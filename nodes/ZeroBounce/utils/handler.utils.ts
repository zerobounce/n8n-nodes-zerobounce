import {
	ApplicationError,
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
import { BulkValidationHandler } from '../handlers/bulk-validation.handler';
import AccountHandler from '../handlers/account.handler';
import {
	EmailBatchAssignment,
	EmailBatchFieldType,
	EmailBatchJson,
	EmailBatchMapped,
	EmailBatchType,
} from '../fields/email-batch.field';
import { Mode, Resources } from '../enums';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { Readable } from 'node:stream';
import { FileId } from '../fields/file-id.field';
import { ScoringHandler } from '../handlers/scoring.handler';
import { BulkScoringHandler } from '../handlers/bulk-scoring.handler';
import { CombineItems } from '../fields/combine-items.field';
import { EmailFinderHandler } from '../handlers/email-finder.handler';

export interface IOperationHandler {
	handle(context: IExecuteFunctions, operation: string, i: number): Promise<INodeExecutionData[]>;
}

export interface IEmailEntry {
	email_address: string;
	ip_address?: string;
}

export interface IEmailBatch {
	emailBatch: Array<IEmailEntry>;
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

export function createHandler(resource: string): IOperationHandler {
	switch (resource) {
		case Resources.Account:
			return new AccountHandler();
		case Resources.Validation:
			return new ValidationHandler();
		case Resources.BulkValidation:
			return new BulkValidationHandler();
		case Resources.Scoring:
			return new ScoringHandler();
		case Resources.BulkScoring:
			return new BulkScoringHandler();
		case Resources.EmailFinder:
			return new EmailFinderHandler();
		default:
			throw new ApplicationError(`Unsupported resource '${resource}'`);
	}
}

export function getHandler(handlers: Map<string, IOperationHandler>, resource: string): IOperationHandler {
	let handler = handlers.get(resource);

	if (!handler) {
		handler = createHandler(resource);
		handlers.set(resource, handler);
	}

	return handler;
}

export function toDate(dateTime: string): string | null {
	if (isBlank(dateTime)) {
		return null;
	}

	const d = new Date(dateTime);

	if (Number.isNaN(d.valueOf())) {
		throw new ApplicationError(`Invalid date value: ${dateTime}`);
	}

	return d.toISOString().split('T')[0]; // → "2025-10-08"
}

export function isBlank(value: string | null | undefined): value is null | undefined | '' {
	return typeof value !== 'string' || value.trim() === '';
}

export const isNotBlank = (value: string | null | undefined): boolean => !isBlank(value);

export const defaultString = (value: string | null | undefined, defaultValue = ''): string =>
	isBlank(value) ? defaultValue : value;

export function isEmailEntry(obj: unknown): obj is IEmailEntry {
	return (
		obj !== null &&
		typeof obj === 'object' &&
		'email_address' in obj &&
		typeof obj.email_address === 'string' &&
		isNotBlank(obj.email_address)
	);
}

export function invalidEmailEntry(obj: NodeParameterValueType | object): boolean {
	return !isEmailEntry(obj);
}

export function validateEmailBatch(emailBatch: unknown): asserts emailBatch is IEmailEntry[] {
	if (!Array.isArray(emailBatch)) {
		throw new ApplicationError(
			'Invalid email batch format. Expected an array of objects like: [{"email_address": "...", "ip_address": "..."},{"email_address": "...", "ip_address": "..."}...]',
		);
	}

	for (let idx = 0; idx < emailBatch.length; idx++) {
		const entry = emailBatch[idx];
		if (!isEmailEntry(entry)) {
			throw new ApplicationError(
				`Invalid entry at position ${idx + 1}: ${JSON.stringify(entry)}. Expected {"email_address": "...", "ip_address"?: "..."}`,
			);
		}
	}

	if (emailBatch.length === 0) {
		throw new ApplicationError('Email batch is empty');
	}
}

export function convertAssignments(obj: object | NodeParameterValueType, mode: Mode): IEmailEntry[] {
	const assignments: AssignmentValue[] = (obj as AssignmentCollectionValue)?.assignments;

	if (!assignments || !Array.isArray(assignments) || assignments.length == 0) {
		throw new ApplicationError('Invalid assignment value: Value missing, must include at least one email address.');
	}

	const entries: IEmailEntry[] = [];

	for (let i = 0; i < assignments.length; i++) {
		const assignment = assignments[i];
		convertAssignmentEntry(assignment, i, mode, entries);
	}

	return entries;
}

function convertAssignmentEntry(
	assignmentEntry: AssignmentValue,
	idx: number,
	mode: Mode,
	entries: IEmailEntry[],
): IEmailEntry[] {
	if (!assignmentEntry.value) {
		throw new ApplicationError(`Invalid assignment value at position ${idx + 1}: Value is missing.`);
	}

	const type = defaultString(assignmentEntry.type, 'object');
	const name = assignmentEntry.name.toLocaleLowerCase();
	const value = assignmentEntry.value;

	switch (type) {
		case 'string':
		case 'array':
		case 'object': {
			convertValueToEmailEntries(name, value, idx, mode, entries);
			break;
		}
		default: {
			throw new ApplicationError(
				`Invalid assignment value '${name}' at position ${idx + 1}: Type '${type}' not supported.`,
			);
		}
	}

	if (entries.length === 0) {
		throw new ApplicationError(
			`Invalid assignment value '${name}' at position ${idx + 1}: Value must contain at least one email address.`,
		);
	}

	return entries;
}

export function convertValueToEmailEntries(
	name: string,
	value: unknown,
	idx: number,
	mode: Mode,
	entries: IEmailEntry[],
): void {
	// Loop and convert all values in arrays
	if (Array.isArray(value)) {
		for (const subValue of value) {
			convertValueToEmailEntries(name, subValue, idx, mode, entries);
		}
		return;
	}

	// If it's already in the correct format, add it
	if (isEmailEntry(value)) {
		entries.push(value);
		return;
	}

	// If it's a string, check the name and convert
	if (isString(value)) {
		convertStringValue(value, name, idx, mode, entries);
		return;
	}

	// If it's an object, split into object entries and handle
	if (typeof value === 'object' && value !== null) {
		for (const [key, subValue] of Object.entries(value)) {
			convertValueToEmailEntries(key, subValue, idx, mode, entries);
		}
		return;
	}

	if (mode === Mode.VALIDATION) {
		throw new ApplicationError(
			`Invalid assignment value '${name}' at position ${idx + 1}: Field name is expected to contain either 'email' or 'ip' e.g. 'email-address', 'IP_ADDRESS', 'personalEmail' etc.`,
		);
	} else {
		throw new ApplicationError(
			`Invalid assignment value '${name}' at position ${idx + 1}: Field name is expected to contain 'email' e.g. 'email-address', 'EMAIL', 'personalEmail' etc.`,
		);
	}
}

function convertStringValue(value: string, name: string, idx: number, mode: Mode, entries: IEmailEntry[]): void {
	// Expect either an email or ip address for string values
	if (name.includes('email')) {
		entries.push({ email_address: value });
		return;
	}

	if (mode === Mode.VALIDATION) {
		if (name.includes('ip')) {
			if (entries.length === 0) {
				throw new ApplicationError(
					`Invalid assignment value '${name}' at position ${idx + 1}: Expected email field before ip field.`,
				);
			}
			// Add the ip_address to the previous IEmailEntry
			entries[entries.length - 1].ip_address = value;
			return;
		}
	}
}

function isString(value: unknown): value is string {
	return typeof value === 'string';
}

function convertJson(json: unknown, mode: Mode): IEmailEntry[] {
	if (!isString(json) || isBlank(json)) {
		throw new ApplicationError('Invalid JSON value');
	}

	let value;

	try {
		value = JSON.parse(json);
	} catch (err) {
		throw new ApplicationError('Failed to parse email batch JSON: ' + (err as Error).message);
	}

	const entries: IEmailEntry[] = [];

	convertValueToEmailEntries('email_batch', value, 0, mode, entries);

	if (entries.length === 0) {
		throw new ApplicationError('Invalid JSON value: Value must contain at least one email address');
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
 * @throws ApplicationError if the data format is invalid
 */
export function convertEmailBatch(context: IExecuteFunctions, i: number, mode: Mode): IEmailEntry[] {
	const emailBatchType = context.getNodeParameter(EmailBatchType.name, i) as EmailBatchFieldType;

	let emailBatch: IEmailEntry[];

	switch (emailBatchType) {
		case EmailBatchFieldType.ASSIGNMENT: {
			const value = context.getNodeParameter(EmailBatchAssignment.name, i);
			emailBatch = convertAssignments(value, mode);
			break;
		}

		case EmailBatchFieldType.JSON: {
			const value = context.getNodeParameter(EmailBatchJson.name, i);
			emailBatch = convertJson(value, mode);
			break;
		}

		case EmailBatchFieldType.MAPPED: {
			const value = context.getNodeParameter(EmailBatchMapped.name, i) as IEmailBatch;
			emailBatch = value.emailBatch;
			break;
		}

		default:
			throw new ApplicationError(`Unsupported email batch type '${emailBatchType}'`);
	}

	validateEmailBatch(emailBatch);

	return emailBatch;
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

export interface IValidationResult {
	[key: string]: string;
}

export function toValidationResult(header: string[], values: string[]): IValidationResult {
	return Object.fromEntries(header.map((k: string, i: number): [string, string] => [k, values[i]]));
}

const quotePattern = /^"(.*)"$/;

export function splitLine(line: string): string[] {
	return line.split(',').map((value) => quotePattern.exec(value)?.[1] ?? value);
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

export async function convertBatchToCsv(
	context: IExecuteFunctions,
	i: number,
	combineItems: boolean,
	mode: Mode,
): Promise<CsvOutput> {
	const inputItems = context.getInputData().length;
	// Limit the number of files which can be sent

	if (!combineItems && inputItems > 50) {
		throw new ApplicationError(
			`Exceeded maximum number of files (50). Enable '${CombineItems.displayName}' to combine inputs into a single file.`,
		);
	}

	const emailBatch: IEmailEntry[] = [];

	if (combineItems) {
		const uniqueEntries: Map<string, IEmailEntry> = new Map();

		// Get data from all input items and combine them into a single file
		for (let item = 0; item < inputItems; item++) {
			const entries = convertEmailBatch(context, item, mode);
			for (const entry of entries) {
				uniqueEntries.set(entry.email_address, entry);
			}
		}
		emailBatch.push(...uniqueEntries.values());
	} else {
		// Only get the data for the current inputItem
		emailBatch.push(...convertEmailBatch(context, i, mode));
	}

	let rows: string[][];

	if (mode === Mode.VALIDATION) {
		rows = [['email_address', 'ip_address']];
		rows.push(...emailBatch.map((e) => [e.email_address, e.ip_address ?? '']));
	} else {
		rows = [['email_address']];
		rows.push(...emailBatch.map((e) => [e.email_address]));
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

export async function convertFileToFields(binaryData: IBinaryData): Promise<IValidationResult[]> {
	let lines: string[] = Buffer.from(binaryData.data, 'base64').toString('utf8').trim().split(/\r?\n/);

	const header: string[] = splitLine(lines[0]);

	if (lines[lines.length - 1]) {
		lines = lines.slice(1);
	} else {
		lines = lines.slice(1, -1);
	}

	return lines.map((line: string): IValidationResult => toValidationResult(header, splitLine(line)));
}
