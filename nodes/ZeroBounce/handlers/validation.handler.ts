import { IDataObject, IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import {
	convertItemInput,
	IEmailEntry,
	IErrorResponse,
	IItemInputEntry,
	IOperationHandler,
	isErrorResponse,
	uniqueValue,
} from '../utils/handler.utils';
import { IRequestBody, IRequestParams, zbGetRequest, zbPostRequest } from '../utils/request.utils';
import { BaseUrl, BulkEndpoint, Endpoint, Mode, Operations } from '../enums';
import { Email } from '../fields/email.field';
import { deleteFile, fileStatus, getFile, sendFile } from '../utils/bulk.utils';
import { ApiEndpoint } from '../fields/api-endpoint.field';
import { AddOptions } from '../fields/add-options.field';
import { CombineItems } from '../fields/combine-items.field';
import { SplitItems } from '../fields/split-items.field';

interface IValidateBase {
	timeout?: number; // The duration (3 - 60 seconds) allowed for the validation. If met, the API will return unknown / greylisted. (optional parameter)
	activity_data?: boolean; // Activity Data information will be appended to the validation result. (optional parameter)
	verify_plus?: boolean; // If set to ‘true,’ Verify+ validation method will be used to get the validation result. It overrides the account settings made regarding Verify+. (optional parameter)
}

interface IValidateRequest extends IRequestParams, IValidateBase {
	email: string; // The email address you want to validate
	ip_address: string; // The IP Address the email signed up from (Can be blank, but parameter required)
}

interface IValidateBatchRequest extends IRequestBody, IValidateBase {
	email_batch: Array<IEmailEntry>; // [Array of Objects], Format:{"email_address": "valid@example.com","ip_address": "1.1.1.1"}
}

interface IValidateResult extends IDataObject {
	address: string; //	The email address you are validating.
	status: string; // [valid, invalid, catch-all, unknown, spamtrap, abuse, do_not_mail]
	sub_status: string; //	[alternate, antispam_system, greylisted, mail_server_temporary_error, forcible_disconnect, mail_server_did_not_respond, timeout_exceeded, failed_smtp_connection, mailbox_quota_exceeded, exception_occurred, possible_trap, role_based, global_suppression, mailbox_not_found, no_dns_entries, failed_syntax_check, possible_typo, unroutable_ip_address, leading_period_removed, does_not_accept_mail, alias_address, role_based_catch_all, disposable, toxic, accept_all]
	free_email: boolean; //	[true/false] If the email comes from a free provider.
	did_you_mean?: string; //	Suggestive Fix for an email typo
	account?: string; //	The portion of the email address before the "@" symbol.
	domain: string; //	The portion of the email address after the "@" symbol.
	domain_age_days?: string; //	Age of the email domain in days or [null].
	active_in_days?: string; //	The last activity date that is less than [30/60/90/180/365/365+]
	smtp_provider?: string; //	The SMTP Provider of the email or [null] [BETA].
	mx_found?: string; //	[true/false] Does the domain have an MX record.
	mx_record?: string; //	The preferred MX record of the domain
	firstname?: string; //	The first name of the owner of the email when available or [null].
	lastname?: string; //	The last name of the owner of the email when available or [null].
	gender?: string; //	The gender of the owner of the email when available or [null].
	city?: string; //	The city of the IP passed in or [null]
	region?: string; //	The region/state of the IP passed in or [null]
	zipcode?: string; //	The zipcode of the IP passed in or [null]
	country?: string; //	The country of the IP passed in or [null]
	processed_at: string; //	The UTC time the email was validated.
}

interface IValidateBatchError {
	error: string; // Details of the error
	email_address?: string; // 'All' or the email address the error relates to
}

interface IValidateBatchResult extends IDataObject {
	email_batch?: IValidateResult[]; // An Array of validated emails
	errors?: IValidateBatchError[]; // An Array of errors encountered, if any
}

/**
 * Validates a single email address using the ZeroBounce API.
 *
 * This function sends a GET request to the ZeroBounce `/validate` endpoint to check the validity, deliverability, and other properties of a single email address.
 *
 * @param {IExecuteFunctions} context - The n8n execution context, providing access to node parameters and credentials.
 * @param {number} i - The index of the current item being processed by n8n.
 * @returns {Promise<INodeExecutionData[]>} A promise that resolves to an array containing the API response as JSON. The response includes details such as validation status, sub-status, domain info, and more.
 *
 * @throws {NodeOperationError} If the ZeroBounce API returns an error or the validation fails (e.g., invalid API key, malformed email, or other API-side issues).
 *
 * @example <caption>Example Successful Response</caption>
 * {
 *   "address": "example@example.com",
 *   "status": "valid",
 *   "sub_status": "",
 *   "free_email": true,
 *   "did_you_mean": null,
 *   "account": "example",
 *   "domain": "example.com",
 *   "domain_age_days": "5000",
 *   "smtp_provider": "google.com",
 *   "mx_found": "true",
 *   "mx_record": "mx.example.com",
 *   "firstname": "John",
 *   "lastname": "Doe",
 *   "gender": null,
 *   "city": "New York",
 *   "region": "NY",
 *   "zipcode": "10001",
 *   "country": "US",
 *   "processed_at": "2024-06-01T12:34:56Z"
 * }
 *
 * @remarks
 * - This function performs validation for a single email address only; the 200-entry batch limit does not apply.
 * - Optional parameters (`timeout`, `activityData`, `verifyPlus`) allow for fine-tuned request control.
 * - Throws an error if the API returns an error response or fails to validate the email.
 * - Handles all request construction and response parsing internally.
 */
async function validate(context: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const baseUrl = context.getNodeParameter(ApiEndpoint.name, i) as BaseUrl;
	const email = context.getNodeParameter(Email.name, i) as string;

	const options = context.getNodeParameter(AddOptions.name, i, {}) as {
		ipAddress?: string;
		timeout?: number;
		activityData?: boolean;
		verifyPlus?: boolean;
	};

	const request: IValidateRequest = {
		email: email,
		ip_address: options.ipAddress ?? '',
		timeout: options.timeout ?? undefined,
		activity_data: options.activityData,
		verify_plus: options.verifyPlus,
	};

	const fullResponse = await zbGetRequest(context, baseUrl, Endpoint.Validate, request);
	const response = fullResponse.body as IValidateResult | IErrorResponse;

	if (isErrorResponse(response)) {
		throw new NodeOperationError(context.getNode(), 'Validation failed: ' + response.error);
	}

	return [
		{
			json: response,
			pairedItem: i,
		} as INodeExecutionData,
	] as INodeExecutionData[];
}

/**
 * Validates multiple email addresses in a single request using the ZeroBounce Batch Validation API.
 *
 * This function sends a POST request to the ZeroBounce `/validatebatch` endpoint with an array
 * of up to 200 email entries. Each entry includes an email address and, optionally, an IP address.
 * The API responds with validation results for each email or an error if validation fails.
 *
 * @param context - The n8n execution context providing access to node parameters,
 *   credentials, and helper methods for making HTTP requests.
 * @param i - The index of the current item being processed.
 *
 * @returns A Promise resolving to an array containing one `INodeExecutionData` item:
 * - `json`: The parsed response from the ZeroBounce API, containing:
 *   - `email_batch`: An array of validated email results, each with fields like `address`, `status`, `sub_status`, etc.
 *   - `errors`: (Optional) An array of errors encountered, if any occurred during validation.
 *
 * @throws {NodeOperationError} If:
 * - The email batch contains more than 200 entries (ZeroBounce API limit).
 * - The ZeroBounce API returns an error or a general failure response (`errors` with `email_address: 'All'`).
 *
 * @example
 * // Example output
 * {
 *   "json": {
 *     "email_batch": [
 *       { "address": "user1@example.com", "status": "valid" },
 *       { "address": "user2@example.com", "status": "invalid" }
 *     ],
 *     "errors": []
 *   }
 * }
 *
 * @remarks
 * - The function automatically enforces the 200-entry batch limit per ZeroBounce API rules.
 * - Optional parameters (`timeout`, `activityData`, `verifyPlus`) allow customization of request behavior.
 * - The function wraps the ZeroBounce response in an n8n `INodeExecutionData` structure for workflow compatibility.
 */
async function batchValidate(context: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const combineItems = context.getNodeParameter(CombineItems.name, i, true);

	// Only process the first execution if combine items is enabled
	if (combineItems && i > 0) {
		return [];
	}

	const splitItems = context.getNodeParameter(SplitItems.name, i, true);
	const inputItems = context.getInputData().length;

	if (!combineItems && inputItems > 5) {
		throw new NodeOperationError(context.getNode(), `Exceeded maximum number of batches (5)`, {
			itemIndex: i,
			description: `Enable '${CombineItems.displayName}' to combine inputs into batches of 200 to avoid rate limiting`,
		});
	}

	const entries: IItemInputEntry[] = [];

	if (combineItems && inputItems > 1) {
		const uniqueEntries: Map<string, IItemInputEntry> = new Map();

		// Get data from all input items and combine them into a single batch
		for (let item = 0; item < inputItems; item++) {
			const itemEntries = convertItemInput(context, item, Mode.VALIDATION);
			for (const entry of itemEntries) {
				uniqueEntries.set(uniqueValue(entry, Mode.VALIDATION), entry);
			}
		}
		entries.push(...uniqueEntries.values());
	} else {
		// Only get the data for the current inputItem
		entries.push(...convertItemInput(context, i, Mode.VALIDATION));
	}

	if (entries.length > 200) {
		throw new NodeOperationError(
			context.getNode(),
			'ZeroBounce API allows a maximum of 200 email entries per batch request.',
		);
	}

	const options = context.getNodeParameter(AddOptions.name, i, {}) as {
		timeout?: number;
		activityData?: boolean;
		verifyPlus?: boolean;
	};

	const request: IValidateBatchRequest = {
		email_batch: entries as IEmailEntry[],
		timeout: options.timeout ?? undefined,
		activity_data: options.activityData,
		verify_plus: options.verifyPlus,
	};

	const fullResponse = await zbPostRequest(context, BaseUrl.BULK_V2, BulkEndpoint.ValidateBatch, request);
	const response = fullResponse.body as IValidateBatchResult;
	const emailBatch = response.email_batch ?? [];
	const errors = response.errors ?? [];

	if (Array.isArray(errors) && errors.length > 0 && errors[0].email_address === 'All') {
		throw new NodeOperationError(context.getNode(), 'Validation failed: ' + JSON.stringify(response.errors));
	}

	if (splitItems ?? true) {
		const results = emailBatch.map((result) => ({ json: { ...result } }) as INodeExecutionData);
		const errorResults = errors.map((result) => ({ json: { ...result } }) as INodeExecutionData);

		// Return a result for validation result or error
		return [...results, ...errorResults];
	} else {
		// Return a single result containing the entire results batch
		return [
			{
				json: response,
				pairedItem: i,
			} as INodeExecutionData,
		] as INodeExecutionData[];
	}
}

export class ValidationHandler implements IOperationHandler {
	handle(context: IExecuteFunctions, operation: string, i: number): Promise<INodeExecutionData[]> {
		switch (operation) {
			case Operations.ValidationValidate:
				return validate(context, i);
			case Operations.ValidationBatchValidate:
				return batchValidate(context, i);
			case Operations.BulkValidationSendFile:
				return sendFile(context, i, Mode.VALIDATION);
			case Operations.BulkValidationGetFile:
				return getFile(context, i, Mode.VALIDATION);
			case Operations.BulkValidationFileStatus:
				return fileStatus(context, i, Mode.VALIDATION);
			case Operations.BulkValidationDeleteFile:
				return deleteFile(context, i, Mode.VALIDATION);
			default:
				throw new NodeOperationError(context.getNode(), `Operation ${operation} not supported`, {
					itemIndex: i,
					description: 'Please select an operation from the list',
				});
		}
	}
}
