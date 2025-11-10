import {
	AssignmentCollectionValue,
	AssignmentValue,
	IBinaryData,
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
	NodeParameterValueType,
} from 'n8n-workflow';
import { ValidationHandler } from '../handlers/validation.handler';
import AccountHandler from '../handlers/account.handler';
import { Mode, Resources } from '../enums';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { Readable } from 'node:stream';
import { FileId } from '../fields/file-id.field';
import { ScoringHandler } from '../handlers/scoring.handler';
import { CombineItems } from '../fields/combine-items.field';
import { EmailFinderHandler } from '../handlers/email-finder.handler';
import {
	IMappedValues,
	ItemInputAssignment,
	ItemInputJson,
	ItemInputMapped,
	ItemInputOptions,
	ItemInputType,
} from '../fields/item-input.field';
import { DomainSearchHandler } from '../handlers/domain-search.handler';
import { NameType, NameTypeOptions } from '../fields/email-finder.field';
import { ActivityDataHandler } from '../handlers/activity-data.handler';

export interface IOperationHandler {
	handle(context: IExecuteFunctions, operation: string, i: number): Promise<INodeExecutionData[]>;
}

export interface IItemInputEntry {
	[key: string]: string | undefined;
}

export interface IEmailEntry extends IItemInputEntry {
	email_address: string;
	ip_address?: string;
}

export interface IEmailFinderEntry extends IItemInputEntry {
	domain: string;
	first_name?: string;
	last_name?: string;
	middle_name?: string;
	full_name?: string;
}

export interface IDomainSearchEntry extends IItemInputEntry {
	domain: string;
}

export interface IErrorResponse extends IDataObject {
	error: string;
}

export interface IAltErrorResponse extends IDataObject {
	Error: string;
}

export function isErrorResponse(response: unknown): response is IErrorResponse {
	return typeof response === 'object' && response !== null && 'error' in response && typeof response.error === 'string';
}

export function isAltErrorResponse(response: unknown): response is IAltErrorResponse {
	return typeof response === 'object' && response !== null && 'Error' in response && typeof response.Error === 'string';
}

export function createHandler(context: IExecuteFunctions, resource: string): IOperationHandler {
	switch (resource) {
		case Resources.Account:
			return new AccountHandler();
		case Resources.Validation:
			return new ValidationHandler();
		case Resources.Scoring:
			return new ScoringHandler();
		case Resources.EmailFinder:
			return new EmailFinderHandler();
		case Resources.DomainSearch:
			return new DomainSearchHandler();
		case Resources.ActivityData:
			return new ActivityDataHandler();
		default:
			throw new NodeOperationError(context.getNode(), `Unsupported resource '${resource}'`);
	}
}

export function getHandler(
	context: IExecuteFunctions,
	handlers: Map<string, IOperationHandler>,
	resource: string,
): IOperationHandler {
	let handler = handlers.get(resource);

	if (!handler) {
		handler = createHandler(context, resource);
		handlers.set(resource, handler);
	}

	return handler;
}

export function toDate(context: IExecuteFunctions, dateTime: string): string | null {
	if (isBlank(dateTime)) {
		return null;
	}

	const d = new Date(dateTime);

	if (Number.isNaN(d.valueOf())) {
		throw new NodeOperationError(context.getNode(), `Invalid date value: ${dateTime}`);
	}

	return d.toISOString().split('T')[0]; // → "2025-10-08"
}

export function isBlank(value: string | null | undefined): value is null | undefined | '' {
	return typeof value !== 'string' || value.trim() === '';
}

export const isNotBlank = (value: string | null | undefined): boolean => !isBlank(value);

export const defaultString = (value: string | null | undefined, defaultValue = ''): string =>
	isBlank(value) ? defaultValue : value;

/**
 * Type guard to determine whether a given value is a valid {@link IEmailEntry}.
 *
 * A valid email entry must:
 * - Be a non-null object.
 * - Contain a property `email_address` of type `string`.
 * - Have a non-empty (non-blank) `email_address` value.
 *
 * @param obj - The value to test.
 * @returns `true` if the object satisfies the {@link IEmailEntry} interface; otherwise `false`.
 */
export function isEmailEntry(obj: unknown): obj is IEmailEntry {
	return (
		obj !== null &&
		typeof obj === 'object' &&
		'email_address' in obj &&
		typeof obj.email_address === 'string' &&
		isNotBlank(obj.email_address)
	);
}

/**
 * Type guard to determine whether a given value is a valid {@link IEmailFinderEntry}.
 *
 * A valid domain entry must:
 * - Be a non-null object.
 * - Contain a non-empty string property `domain`.
 * - Contain **either**:
 *   - A non-empty string property `first_name`, **or**
 *   - A non-empty string property `full_name`.
 *
 * @param obj - The value to test.
 * @returns `true` if the object satisfies the {@link IEmailFinderEntry} structure; otherwise `false`.
 */
export function isEmailFinderEntry(obj: unknown): obj is IEmailFinderEntry {
	return (
		obj !== null &&
		typeof obj === 'object' &&
		'domain' in obj &&
		typeof obj.domain === 'string' &&
		isNotBlank(obj.domain) &&
		(('first_name' in obj && typeof obj.first_name === 'string' && isNotBlank(obj.first_name)) ||
			('full_name' in obj && typeof obj.full_name === 'string' && isNotBlank(obj.full_name)))
	);
}

/**
 * Type guard to determine whether a given value is a valid {@link IDomainSearchEntry}.
 *
 * A valid domain entry must:
 * - Be a non-null object.
 * - Contain a non-empty string property `domain`.
 *
 * @param obj - The value to test.
 * @returns `true` if the object satisfies the {@link IDomainSearchEntry} structure; otherwise `false`.
 */
export function isDomainSearchEntry(obj: unknown): obj is IDomainSearchEntry {
	return (
		obj !== null &&
		typeof obj === 'object' &&
		'domain' in obj &&
		typeof obj.domain === 'string' &&
		isNotBlank(obj.domain)
	);
}

function isNative(value: unknown, mode: Mode): value is IEmailEntry | IEmailFinderEntry | IDomainSearchEntry {
	switch (mode) {
		case Mode.VALIDATION:
		case Mode.SCORING:
			return isEmailEntry(value);
		case Mode.EMAIL_FINDER:
			return isEmailFinderEntry(value);
		case Mode.DOMAIN_SEARCH:
			return isDomainSearchEntry(value);
	}
}

function nameOfRequiredValue(mode: Mode): string {
	switch (mode) {
		case Mode.VALIDATION:
		case Mode.SCORING:
			return 'email address';
		case Mode.EMAIL_FINDER:
			return 'domain and either a first name or full name';
		case Mode.DOMAIN_SEARCH:
			return 'domain';
	}
}

function expectedFormat(mode: Mode): string {
	switch (mode) {
		case Mode.VALIDATION:
			return '{"email_address": "...", "ip_address"?: "..."}';
		case Mode.SCORING:
			return '{"email_address": "..."}';
		case Mode.EMAIL_FINDER:
			return '{"domain": "...", "first_name": "..."}';
		case Mode.DOMAIN_SEARCH:
			return '{"domain": "..."}';
	}
}

function expectedFields(mode: Mode): string {
	switch (mode) {
		case Mode.VALIDATION:
			return "either 'email' or 'ip' e.g. 'email-address', 'IP_ADDRESS', 'personalEmail' etc.";
		case Mode.SCORING:
			return "'email' e.g. 'email-address', 'EMAIL', 'personalEmail' etc.";
		case Mode.EMAIL_FINDER:
			return "either 'domain' or 'name' e.g. 'domain', 'DOMAIN', 'emailDomain', 'first_name', 'full_name' etc.";
		case Mode.DOMAIN_SEARCH:
			return "'domain' e.g. 'domain', 'DOMAIN', 'emailDomain' etc.";
	}
}

function uniqueValue(value: IItemInputEntry, mode: Mode): string {
	switch (mode) {
		case Mode.VALIDATION:
		case Mode.SCORING:
			return (value as IEmailEntry).email_address;
		case Mode.EMAIL_FINDER: {
			const entry = value as IEmailFinderEntry;
			return entry.domain + ',' + defaultString(entry.first_name) + ',' + defaultString(entry.full_name);
		}
		case Mode.DOMAIN_SEARCH:
			return (value as IDomainSearchEntry).domain;
	}
}

export function invalidEmailEntry(obj: NodeParameterValueType | object): boolean {
	return !isEmailEntry(obj);
}

export function validateItemInputEntries(
	context: IExecuteFunctions,
	entries: unknown,
	mode: Mode,
): asserts entries is IItemInputEntry[] {
	if (!Array.isArray(entries)) {
		throw new NodeOperationError(
			context.getNode(),
			`Invalid entry format. Expected an array of objects like: [${expectedFormat(mode)},${expectedFormat(mode)}...]`,
		);
	}

	for (let idx = 0; idx < entries.length; idx++) {
		const entry = entries[idx];
		if (!isNative(entry, mode)) {
			throw new NodeOperationError(
				context.getNode(),
				`Invalid entry at position ${idx + 1}: ${JSON.stringify(entry)}. Expected ${expectedFormat(mode)}`,
			);
		}
	}

	if (entries.length === 0) {
		throw new NodeOperationError(context.getNode(), 'No entries');
	}
}

export function convertAssignments(
	context: IExecuteFunctions,
	obj: object | NodeParameterValueType,
	mode: Mode,
): IItemInputEntry[] {
	const assignments: AssignmentValue[] = (obj as AssignmentCollectionValue)?.assignments;

	if (!assignments || !Array.isArray(assignments) || assignments.length == 0) {
		throw new NodeOperationError(
			context.getNode(),
			`Invalid assignment value: Value missing, must include at least one ${nameOfRequiredValue(mode)}.`,
		);
	}

	const entries: IItemInputEntry[] = [];

	for (let i = 0; i < assignments.length; i++) {
		const assignment = assignments[i];
		convertAssignmentEntry(context, assignment, i, mode, entries);
	}

	return entries;
}

function convertAssignmentEntry(
	context: IExecuteFunctions,
	assignmentEntry: AssignmentValue,
	idx: number,
	mode: Mode,
	entries: IItemInputEntry[],
) {
	if (!assignmentEntry.value) {
		throw new NodeOperationError(
			context.getNode(),
			`Invalid assignment value at position ${idx + 1}: Value is missing.`,
		);
	}

	const type = defaultString(assignmentEntry.type, 'object');
	const name = assignmentEntry.name.toLocaleLowerCase();
	const value = assignmentEntry.value;

	switch (type) {
		case 'string':
		case 'array':
		case 'object': {
			convertValueToEntries(context, name, value, idx, mode, entries);
			break;
		}
		default: {
			throw new NodeOperationError(
				context.getNode(),
				`Invalid assignment value '${name}' at position ${idx + 1}: Type '${type}' not supported.`,
			);
		}
	}

	if (entries.length === 0) {
		throw new NodeOperationError(
			context.getNode(),
			`Invalid assignment value '${name}' at position ${idx + 1}: Value must contain at least one ${nameOfRequiredValue(mode)}.`,
		);
	}
}

export function convertValueToEntries(
	context: IExecuteFunctions,
	name: string,
	value: unknown,
	idx: number,
	mode: Mode,
	entries: IItemInputEntry[],
): void {
	// Loop and convert all values in arrays
	if (Array.isArray(value)) {
		for (let subIdx = 0; subIdx < value.length; subIdx++) {
			const subValue = value[subIdx];
			convertValueToEntries(context, name, subValue, subIdx, mode, entries);
		}
		return;
	}

	// If it's already in the correct format, add it
	if (isNative(value, mode)) {
		entries.push(value);
		return;
	}

	// If it's a string, check the name and convert
	if (isString(value)) {
		convertStringValue(context, value, name, idx, mode, entries);
		return;
	}

	// If it's an object, split into object entries and handle
	if (typeof value === 'object' && value !== null) {
		for (const [key, subValue] of Object.entries(value)) {
			convertValueToEntries(context, key, subValue, idx, mode, entries);
		}
		return;
	}

	throw new NodeOperationError(
		context.getNode(),
		`Invalid assignment value '${name}' at position ${idx + 1}: Field name is expected to contain ${expectedFields(mode)}`,
	);
}

function convertValidationStringValue(
	context: IExecuteFunctions,
	value: string,
	name: string,
	idx: number,
	entries: IItemInputEntry[],
): void {
	// Expect either an email or ip address for string values
	if (name.includes('email')) {
		entries.push({ email_address: value });
		return;
	}

	if (name.includes('ip')) {
		if (entries.length === 0) {
			throw new NodeOperationError(
				context.getNode(),
				`Invalid assignment value '${name}' at position ${idx + 1}: Expected email field before ip field.`,
			);
		}
		// Add the ip_address to the previous IEmailEntry
		entries[entries.length - 1].ip_address = value;
	}
}

function convertScoringStringValue(value: string, name: string, idx: number, entries: IItemInputEntry[]): void {
	// Expect an email address for string values
	if (name.includes('email')) {
		entries.push({ email_address: value });
	}
}

function convertEmailFinderStringValue(
	context: IExecuteFunctions,
	value: string,
	name: string,
	idx: number,
	entries: IItemInputEntry[],
): void {
	// Expect a domain for string values
	if (name.includes('domain')) {
		entries.push({ domain: value });
		return;
	}

	if (!name.includes('name')) {
		return;
	}

	if (entries.length === 0) {
		throw new NodeOperationError(
			context.getNode(),
			`Invalid assignment value '${name}' at position ${idx + 1}: Expected domain field before name field.`,
		);
	}

	if (name.includes('first')) {
		// Add first_name to the previous IEmailFinderEntry
		entries[entries.length - 1].first_name = value;
	} else if (name.includes('last')) {
		// Add last_name to the previous IEmailFinderEntry
		entries[entries.length - 1].last_name = value;
	} else if (name.includes('middle')) {
		// Add last_name to the previous IEmailFinderEntry
		entries[entries.length - 1].middle_name = value;
	} else if (name.includes('full')) {
		// Add last_name to the previous IEmailFinderEntry
		entries[entries.length - 1].full_name = value;
	}
}

function convertDomainSearchStringValue(value: string, name: string, idx: number, entries: IItemInputEntry[]): void {
	// Expect a domain for string values
	if (name.includes('domain')) {
		entries.push({ domain: value });
	}
}

function convertStringValue(
	context: IExecuteFunctions,
	value: string,
	name: string,
	idx: number,
	mode: Mode,
	entries: IItemInputEntry[],
): void {
	switch (mode) {
		case Mode.VALIDATION:
			convertValidationStringValue(context, value, name, idx, entries);
			return;

		case Mode.SCORING:
			convertScoringStringValue(value, name, idx, entries);
			return;

		case Mode.EMAIL_FINDER:
			convertEmailFinderStringValue(context, value, name, idx, entries);
			return;

		case Mode.DOMAIN_SEARCH:
			convertDomainSearchStringValue(value, name, idx, entries);
			return;
	}
}

function isString(value: unknown): value is string {
	return typeof value === 'string';
}

function convertJson(context: IExecuteFunctions, json: unknown, mode: Mode): IItemInputEntry[] {
	if (!isString(json) || isBlank(json)) {
		throw new NodeOperationError(context.getNode(), 'Invalid JSON value');
	}

	let value;

	try {
		value = JSON.parse(json);
	} catch (err) {
		throw new NodeOperationError(
			context.getNode(),
			`Failed to parse ${nameOfRequiredValue(mode)} JSON: ` + (err as Error).message,
		);
	}

	return convertToEntries(context, value, mode, ItemInputOptions.JSON);
}

function convertToEntries(
	context: IExecuteFunctions,
	value: unknown,
	mode: Mode,
	itemInputType: ItemInputOptions,
): IItemInputEntry[] {
	let name: string;

	switch (mode) {
		case Mode.VALIDATION:
		case Mode.SCORING:
			name = 'emails';
			break;
		case Mode.EMAIL_FINDER:
		case Mode.DOMAIN_SEARCH:
			name = 'values';
			break;
	}

	const entries: IItemInputEntry[] = [];

	convertValueToEntries(context, name, value, 0, mode, entries);

	if (entries.length === 0) {
		throw new NodeOperationError(
			context.getNode(),
			`Invalid ${itemInputType.toLowerCase()} value: Value must contain at least one ${nameOfRequiredValue(mode)}`,
		);
	}

	return entries;
}

/**
 * Converts the user-selected email batch input into a normalized array of IEmailEntry.
 * Validates structure and data integrity.
 *
 * @param context - n8n execution context
 * @param i - Item index
 * @param mode - Validate or Scoring
 * @throws NodeOperationError if the data format is invalid
 */
export function convertItemInput(context: IExecuteFunctions, i: number, mode: Mode): IItemInputEntry[] {
	const itemInputType = context.getNodeParameter(ItemInputType.name, i) as ItemInputOptions;

	let entries: IItemInputEntry[];

	switch (itemInputType) {
		case ItemInputOptions.ASSIGNMENT: {
			const value = context.getNodeParameter(ItemInputAssignment.name, i);
			entries = convertAssignments(context, value, mode);
			break;
		}

		case ItemInputOptions.JSON: {
			const value = context.getNodeParameter(ItemInputJson.name, i);
			entries = convertJson(context, value, mode);
			break;
		}

		case ItemInputOptions.MAPPED: {
			const mapped = context.getNodeParameter(ItemInputMapped.name, i) as IMappedValues;
			entries = convertToEntries(context, mapped.mappedValues, mode, itemInputType);
			break;
		}

		default:
			throw new NodeOperationError(context.getNode(), `Unsupported email batch type '${itemInputType}'`);
	}

	validateItemInputEntries(context, entries, mode);

	return entries;
}

const filenamePattern = /filename="?([^"]+)"?/;

export function getFileNameFromHeader(headers: IDataObject, fileId: string): string {
	const dispositionHeader = headers?.['content-disposition'];

	let fileNameHeader = '';

	if (typeof dispositionHeader === 'string') {
		fileNameHeader = dispositionHeader;
	} else if (Array.isArray(dispositionHeader) && typeof dispositionHeader[0] === 'string') {
		fileNameHeader = dispositionHeader[0];
	}

	const match = filenamePattern.exec(fileNameHeader);

	return defaultString(match?.[1], fileId + '.csv');
}

export function getBinaryData(context: IExecuteFunctions, i: number, binaryKey: string) {
	const inputData = context.getInputData(i);
	const binaryInput = inputData.find((item) => item?.binary !== undefined);

	if (!binaryInput) {
		throw new NodeOperationError(
			context.getNode(),
			'No binary input found. Make sure the previous node outputs a binary CSV file.',
		);
	}

	return context.helpers.assertBinaryData(i, binaryKey);
}

export interface IStringFields {
	[key: string]: string | object | object[];
}

export function toFields(header: string[], values: string[]): IStringFields {
	return Object.fromEntries(
		header.map((k: string, i: number): [string, string | object | object[]] => {
			let value = values[i];

			// Domain Search 'ZB Other Domain Formats' column is returned as a pseudo JSON array. Replace single quotes with double and parse as JSON
			if (value.startsWith('[{') || value.startsWith('{')) {
				value = value.replace(/'/g, '"');
				value = JSON.parse(value);
			}

			return [k, value];
		}),
	);
}

export function splitLine(line: string): string[] {
	return line.split(/,"/).map((s) => s.replace(/^"?(.*)"$/, '$1'));
}

export function isBinary(body: unknown): body is Buffer | Readable {
	return body instanceof Buffer || body instanceof Readable;
}

const fileIdPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function getFileId(context: IExecuteFunctions, i: number): string {
	const fileId = context.getNodeParameter(FileId.name, i) as string;
	if (isBlank(fileId) || !fileIdPattern.test(fileId)) {
		let detail: string = '';

		if (fileId?.length > 36) {
			detail = ' (too long)';
		} else if (fileId?.length < 36) {
			detail = ' (too short)';
		}

		throw new NodeOperationError(
			context.getNode(),
			`Invalid File ID '${fileId}'${detail}. Expected UUID format e.g. '9f559670-0202-46e9-ab65-7aa1917f12ca'`,
		);
	}
	return fileId;
}

export function getNumberParameter(
	context: IExecuteFunctions,
	i: number,
	name: string,
	defaultValue?: number,
): number | undefined {
	const value = context.getNodeParameter(name, i, undefined);

	if (value === null || value === undefined || value === '') {
		return defaultValue;
	}

	if (typeof value === 'number' && !Number.isNaN(value)) {
		return value;
	}

	const numberValue = Number(value);

	if (numberValue === null || numberValue === undefined || Number.isNaN(numberValue)) {
		throw new NodeOperationError(
			context.getNode(),
			`Invalid value '${JSON.stringify(value)}' for number parameter '${name}'`,
		);
	}

	return numberValue;
}

export interface CsvOutput {
	contents: string;
	lineCount: number;
}

export async function convertEntriesToCsv(
	context: IExecuteFunctions,
	i: number,
	combineItems: boolean,
	mode: Mode,
): Promise<CsvOutput> {
	const inputItems = context.getInputData().length;
	// Limit the number of files which can be sent

	if (!combineItems && inputItems > 50) {
		throw new NodeOperationError(
			context.getNode(),
			`Exceeded maximum number of files (50). Enable '${CombineItems.displayName}' to combine inputs into a single file.`,
		);
	}

	const entries: IItemInputEntry[] = [];

	if (combineItems && inputItems > 1) {
		const uniqueEntries: Map<string, IItemInputEntry> = new Map();

		// Get data from all input items and combine them into a single file
		for (let item = 0; item < inputItems; item++) {
			const itemEntries = convertItemInput(context, item, mode);
			for (const entry of itemEntries) {
				uniqueEntries.set(uniqueValue(entry, mode), entry);
			}
		}
		entries.push(...uniqueEntries.values());
	} else {
		// Only get the data for the current inputItem
		entries.push(...convertItemInput(context, i, mode));
	}

	let rows: string[][];

	switch (mode) {
		case Mode.VALIDATION:
			rows = [['email_address', 'ip_address']];
			rows.push(...(entries as IEmailEntry[]).map((e) => [e.email_address, defaultString(e.ip_address)]));
			break;
		case Mode.SCORING:
			rows = [['email_address']];
			rows.push(...(entries as IEmailEntry[]).map((e) => [e.email_address]));
			break;
		case Mode.EMAIL_FINDER: {
			const nameType = context.getNodeParameter(NameType.name, i, NameTypeOptions.FULL) as string;

			if (nameType === NameTypeOptions.FULL) {
				rows = [['domain', 'full_name']];
				rows.push(...(entries as IEmailFinderEntry[]).map((e) => [e.domain, defaultString(e.full_name)]));
			} else {
				rows = [['domain', 'first_name', 'last_name', 'middle_name']];
				rows.push(
					...(entries as IEmailFinderEntry[]).map((e) => [
						e.domain,
						defaultString(e.first_name),
						defaultString(e.last_name),
						defaultString(e.middle_name),
					]),
				);
			}

			break;
		}
		case Mode.DOMAIN_SEARCH:
			rows = [['domain']];
			rows.push(...(entries as IDomainSearchEntry[]).map((e) => [e.domain]));
			break;
	}

	return {
		lineCount: rows.length,
		contents: rows
			// Join values in each row together with the delimiter, use JSON stringify to add quotes around values
			.map((row: string[]): string => row.map((value: string): string => JSON.stringify(value)).join(','))
			// Join all rows together with the line separator
			.join('\n'),
	};
}

export async function convertFileToFields(binaryData: IBinaryData): Promise<IStringFields[]> {
	let lines: string[] = Buffer.from(binaryData.data, 'base64').toString('utf8').trim().split(/\r?\n/);

	const header: string[] = splitLine(lines[0]);

	if (lines[lines.length - 1]) {
		lines = lines.slice(1);
	} else {
		lines = lines.slice(1, -1);
	}

	return lines.map((line: string): IStringFields => toFields(header, splitLine(line)));
}
