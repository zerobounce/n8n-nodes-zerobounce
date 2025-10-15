import { ApplicationError, IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
	convertEmailBatch,
	getNumberParameter,
	IEmailEntry,
	IErrorResponse,
	IOperationHandler,
	isErrorResponse,
} from '../utils/handler.utils';
import { IRequestBody, IRequestParams, zbGetRequest, zbPostRequest } from '../utils/request.utils';
import { BaseUrl, BulkEndpoint, Endpoint, Mode, Operations } from '../enums';
import { Email } from '../fields/email.field';
import { Timeout } from '../fields/timeout.field';
import { ActivityData } from '../fields/activity-data.field';
import { VerifyPlus } from '../fields/verify-plus.field';
import { IpAddress } from '../fields/ip-address.field';
import { ApiEndpoint } from '../fields/api-endpoint.field';

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
 * @param {number} [timeout] - (Optional) The duration in seconds (3–60) to allow for validation. If exceeded, the API may return 'unknown' or 'greylisted'.
 * @param {boolean} [activityData] - (Optional) If true, includes recent activity data in the validation result.
 * @param {boolean} [verifyPlus] - (Optional) If true, forces use of the Verify+ validation method, overriding account settings.
 * @returns {Promise<INodeExecutionData[]>} A promise that resolves to an array containing the API response as JSON. The response includes details such as validation status, sub-status, domain info, and more.
 *
 * @throws {ApplicationError} If the ZeroBounce API returns an error or the validation fails (e.g., invalid API key, malformed email, or other API-side issues).
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
async function validate(
	context: IExecuteFunctions,
	i: number,
	timeout?: number,
	activityData?: boolean,
	verifyPlus?: boolean,
): Promise<INodeExecutionData[]> {
	const email = context.getNodeParameter(Email.name, i) as string;
	const ipAddress = context.getNodeParameter(IpAddress.name, i) as string;
	const baseUrl = context.getNodeParameter(ApiEndpoint.name, i) as BaseUrl;

	const request: IValidateRequest = {
		email: email,
		ip_address: ipAddress,
		timeout: timeout ?? undefined,
		activity_data: activityData,
		verify_plus: verifyPlus,
	};

	const fullResponse = await zbGetRequest(context, baseUrl, Endpoint.Validate, request);
	const response = fullResponse.body as IValidateResult | IErrorResponse;

	if (isErrorResponse(response)) {
		throw new ApplicationError('Validation failed: ' + response.error);
	}

	return [
		{
			json: response,
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
 * @param timeout - (Optional) The duration in seconds (3–60) allowed for validation.
 *   If exceeded, ZeroBounce may return a status of `unknown` or `greylisted`.
 * @param activityData - (Optional) When true, includes recent activity data in the validation results.
 * @param verifyPlus - (Optional) When true, forces use of the Verify+ validation method, overriding account defaults.
 *
 * @returns A Promise resolving to an array containing one `INodeExecutionData` item:
 * - `json`: The parsed response from the ZeroBounce API, containing:
 *   - `email_batch`: An array of validated email results, each with fields like `address`, `status`, `sub_status`, etc.
 *   - `errors`: (Optional) An array of errors encountered, if any occurred during validation.
 *
 * @throws {ApplicationError} If:
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
async function batchValidate(
	context: IExecuteFunctions,
	i: number,
	timeout?: number,
	activityData?: boolean,
	verifyPlus?: boolean,
): Promise<INodeExecutionData[]> {
	const emailBatch = convertEmailBatch(context, i, Mode.VALIDATION);

	if (emailBatch.length > 200) {
		throw new ApplicationError('ZeroBounce API allows a maximum of 200 email entries per request.');
	}

	const request: IValidateBatchRequest = {
		email_batch: emailBatch,
		timeout: timeout ?? undefined,
		activity_data: activityData,
		verify_plus: verifyPlus,
	};

	const fullResponse = await zbPostRequest(context, BaseUrl.BULK, BulkEndpoint.ValidateBatch, request);
	const response = fullResponse.body as IValidateBatchResult;
	const errors = response.errors;

	if (Array.isArray(errors) && errors.length > 0 && errors[0].email_address === 'All') {
		throw new ApplicationError('Validation failed: ' + JSON.stringify(response.errors));
	}

	return [
		{
			json: response,
		} as INodeExecutionData,
	] as INodeExecutionData[];
}

export class ValidationHandler implements IOperationHandler {
	handle(context: IExecuteFunctions, operation: string, i: number): Promise<INodeExecutionData[]> {
		const timeout = getNumberParameter(context, i, Timeout.name);
		const activityData = context.getNodeParameter(ActivityData.name, i, false, { ensureType: 'boolean' }) as boolean;
		const verifyPlus = context.getNodeParameter(VerifyPlus.name, i, false, { ensureType: 'boolean' }) as boolean;

		switch (operation) {
			case Operations.ValidationValidate:
				return validate(context, i, timeout, activityData, verifyPlus);
			case Operations.ValidationBatchValidate:
				return batchValidate(context, i, timeout, activityData, verifyPlus);
			default:
				throw new ApplicationError(`Operation ${operation} not supported`);
		}
	}
}
