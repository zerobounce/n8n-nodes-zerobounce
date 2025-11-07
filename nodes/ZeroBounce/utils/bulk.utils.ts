import { IRequestParams, zbGetFileRequest, zbGetRequest, zbPostRequest } from './request.utils';
import { ApplicationError, IBinaryData, IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
	convertEntriesToCsv,
	convertFileToFields,
	CsvOutput,
	defaultString,
	getBinaryData,
	getFileId,
	getFileNameFromHeader,
	getNumberParameter,
	isBinary, isNotBlank,
} from './handler.utils';
import { BaseUrl, BulkEndpoint, Mode } from '../enums';
import { SendFileInputFieldType, SendFileInputType } from '../fields/send-file-input-type.field';
import { FileName } from '../fields/file-name.field';
import { BinaryKey } from '../fields/binary-key.field';
import { HasHeader } from '../fields/has-header.field';
import { ActivityData } from '../fields/activity-data.field';
import { GetFileOutputFieldType, GetFileOutputType } from '../fields/get-file-output-type.field';
import { Batch } from '../fields/batch.field';
import { CombineItems } from '../fields/combine-items.field';
import { EmailColumnNumber } from '../fields/email-address-column.field';
import { IpAddressColumnNumber } from '../fields/ip-address-column.field';
import { RemoveDuplicates } from '../fields/remove-duplicates.field';
import { DomainColumnNumber } from '../fields/domain-column.field';
import {
	FirstNameColumnNumber,
	FullNameColumnNumber,
	LastNameColumnNumber,
	MiddleNameColumnNumber,
} from '../fields/email-finder.field';

export interface IBulkErrorResponse extends IDataObject {
	success: boolean;
	message?: string;
	error_message?: string;
}

export function isBulkErrorResponse(response: unknown): response is IBulkErrorResponse {
	return typeof response === 'object' && response !== null && 'success' in response && response.success === false;
}

interface ISendFileBaseRequest {
	has_header_row: boolean;
}

interface ISendFileValidationRequest extends ISendFileBaseRequest {
	remove_duplicate: boolean;
	return_url: string;
	email_address_column: number;
	ip_address_column?: number;
}

interface ISendFileScoringRequest extends ISendFileBaseRequest {
	remove_duplicate: boolean;
	return_url: string;
	email_address_column: number;
}

interface ISendFileEmailFinderRequest extends ISendFileBaseRequest {
	domain_column: number; // The column index of the domain in the file. Index starts from 1. (Required)
	first_name_column?: number; // The column index of the first name column. (Either one of the first name column or the full name column is mandatory)
	last_name_column?: number; // The column index of the last name column. (Optional)
	middle_name_column?: number; // The column index of the middle name column. (Optional)
	full_name_column?: number; // The column index of the full name column. (Either one of the first name column or the full name column is mandatory)
}

interface ISendFileDetails {
	request: ISendFileValidationRequest | ISendFileScoringRequest | ISendFileEmailFinderRequest;
	endpoint: BulkEndpoint;
	binaryData: IBinaryData;
	buffer: string | Buffer;
	combineItems: boolean;
	itemCount?: number;
}

export interface ISendFileResponse extends IDataObject {
	success: boolean;
	message: string;
	file_name: string;
	file_id: string;
	return_url?: string; // Added to the returned response for later use
	item_count?: number; // Added to the returned response for info
}

export interface IFileStatusRequest extends IRequestParams {
	file_id: string;
}

export interface IFileStatusResponse extends IDataObject {
	success: boolean;
	file_id: string; // "9f559670-0202-46e9-ab65-7aa1917f12ca",
	file_name: string; // "Your file name.csv",
	upload_date: string; // "2023-04-28T15:25:41Z",
	file_status: string; // "Complete",
	complete_percentage: string; // "100%",
	return_url: string; // "Your return URL if provided when calling sendfile API"
}

export interface IGetFileRequest extends IRequestParams {
	file_id: string;
	activityData?: boolean;
}

export interface IDeleteFileRequest extends IRequestParams {
	file_id: string;
}

export interface IDeleteFileResponse extends IDataObject {
	success: true;
	message: string;
	file_name: string;
	file_id: string;
}

function baseUrl(mode: Mode): BaseUrl {
	switch (mode) {
		case Mode.VALIDATION:
		case Mode.SCORING:
			return BaseUrl.BULK_V2;
		case Mode.EMAIL_FINDER:
			return BaseUrl.BULK;
	}
}

async function sendFileDetails(
	context: IExecuteFunctions,
	i: number,
	mode: Mode,
	inputType: SendFileInputFieldType,
	fileName?: string,
): Promise<ISendFileDetails> {
	const details = {} as ISendFileDetails;

	switch (mode) {
		case Mode.VALIDATION:
			details.request = {
				email_address_column: 1,
				ip_address_column: 2,
			} as ISendFileValidationRequest;
			details.endpoint = BulkEndpoint.SendFile;
			break;
		case Mode.SCORING:
			details.request = {
				email_address_column: 1,
			} as ISendFileScoringRequest;
			details.endpoint = BulkEndpoint.ScoringSendFile;
			break;
		case Mode.EMAIL_FINDER: {
			details.request = {
				domain_column: 1,
				first_name_column: 2,
				last_name_column: 3,
				middle_name_column: 4,
				full_name_column: 5,
			} as ISendFileEmailFinderRequest;
			details.endpoint = BulkEndpoint.EmailFinderSendFile;
			break;
		}
	}

	if (inputType === SendFileInputFieldType.FILE) {
		const binaryKey = context.getNodeParameter(BinaryKey.name, i) as string;
		details.binaryData = getBinaryData(context, i, binaryKey);
		details.buffer = await context.helpers.getBinaryDataBuffer(i, binaryKey);
		details.request.has_header_row = context.getNodeParameter(HasHeader.name, i) as boolean;

		if (isNotBlank(fileName)) {
			details.binaryData.fileName = fileName;
		}

		if (mode === Mode.VALIDATION || mode === Mode.SCORING) {
			const request = details.request as ISendFileValidationRequest | ISendFileScoringRequest;
			request.email_address_column = getNumberParameter(context, i, EmailColumnNumber.name, 1) as number;
			request.remove_duplicate = context.getNodeParameter(RemoveDuplicates.name, i) as boolean;

			if (mode === Mode.VALIDATION) {
				(request as ISendFileValidationRequest).ip_address_column = getNumberParameter(
					context,
					i,
					IpAddressColumnNumber.name,
					2,
				);
			}
		} else if (mode === Mode.EMAIL_FINDER) {
			const request = details.request as ISendFileEmailFinderRequest;
			request.domain_column = getNumberParameter(context, i, DomainColumnNumber.name, 1) as number;
			request.first_name_column = getNumberParameter(context, i, FirstNameColumnNumber.name);
			request.last_name_column = getNumberParameter(context, i, LastNameColumnNumber.name);
			request.middle_name_column = getNumberParameter(context, i, MiddleNameColumnNumber.name);
			request.full_name_column = getNumberParameter(context, i, FullNameColumnNumber.name);
		}
	} else {
		details.combineItems = context.getNodeParameter(CombineItems.name, i, true, { ensureType: 'boolean' }) as boolean;

		// Only process the first execution if combine items is enabled
		if (!details.combineItems || i === 0) {
			const csvOutput: CsvOutput = await convertEntriesToCsv(context, i, details.combineItems, mode);

			details.binaryData = await context.helpers.prepareBinaryData(
				Buffer.from(csvOutput.contents, 'utf8'),
				defaultString(fileName, `n8n_${mode}.csv`),
				'text/csv',
			);
			details.buffer = csvOutput.contents;
			details.itemCount = csvOutput.lineCount - 1;
			details.request.has_header_row = true;
		}
	}

	return details;
}

/**
 * Uploads a CSV file to the ZeroBounce Bulk API for either validation or scoring operations.
 *
 * This function prepares and sends a file to the ZeroBounce `/sendfile` (validation) or
 * `/scoring/sendfile` (scoring) endpoints, depending on the selected `mode`. It supports two input
 * modes: uploading an existing binary file from upstream nodes, or generating a temporary CSV
 * file from an email batch within the workflow. The request is constructed as multipart/form-data
 * and includes configuration options such as header presence, duplicate removal, and column mapping.
 *
 * @param context - The n8n execution context providing access to node parameters, binary helpers, and HTTP utilities.
 * @param i - The index of the current input item being processed.
 * @param mode - Determines the bulk operation mode:
 *   - `BulkMode.VALIDATION`: Email validation upload.
 *   - `BulkMode.SCORING`: Email scoring upload.
 *
 * @returns A Promise resolving to an array containing one `INodeExecutionData` object with:
 * - `json`: The parsed response from the ZeroBounce API, typically including:
 *   - `success`: Whether the upload was accepted.
 *   - `message`: Informational message from ZeroBounce.
 *   - `file_name`: The uploaded filename.
 *   - `file_id`: The unique file identifier for later status checks.
 *   - `return_url`: The callback URL if provided.
 *
 * @throws {ApplicationError} If:
 * - The input type is missing or invalid.
 * - No binary input is found when using the “File” input type.
 * - The API returns an error (`isBulkErrorResponse` is true).
 * - The API response cannot be parsed or contains invalid data.
 *
 * @example
 * // Example output (validation mode)
 * {
 *   "json": {
 *     "success": true,
 *     "message": "File Accepted",
 *     "file_name": "emails.csv",
 *     "file_id": "aaaaaaaa-zzzz-xxxx-yyyy-5003727fffff",
 *     "return_url": "https://example.com/callback"
 *   }
 * }
 *
 * @remarks
 * - When `inputType` = `FILE`, the node uploads an existing binary file from upstream input.
 * - When `inputType` = `EMAIL_BATCH`, the node dynamically generates a CSV file from email batch data.
 * - The correct endpoint (`/sendfile` or `/scoring/sendfile`) is automatically selected based on `mode`.
 * - Throws detailed `ApplicationError` messages for all failure conditions to aid debugging.
 */
export async function sendFile(context: IExecuteFunctions, i: number, mode: Mode): Promise<INodeExecutionData[]> {
	const inputType = context.getNodeParameter(SendFileInputType.name, i) as SendFileInputFieldType;

	if (inputType === undefined || inputType === null) {
		throw new ApplicationError('Please select input type');
	}

	let fileName: string | undefined = context.getNodeParameter(FileName.name, i) as string | undefined;

	const details: ISendFileDetails = await sendFileDetails(context, i, mode, inputType, fileName);

	// Get the filename to use from the binary data if not overridden
	fileName = defaultString(fileName, details.binaryData.fileName);

	const blob = new Blob([details.buffer], { type: 'text/csv' });

	const formData = new FormData();

	formData.append('file', blob, fileName);

	// Append all values from the request object to the form
	for (const [key, value] of Object.entries(details.request)) {
		formData.append(key, value);
	}

	const fullResponse = await zbPostRequest(context, baseUrl(mode), details.endpoint, formData);
	const response = fullResponse.body as ISendFileResponse | IBulkErrorResponse;

	if (isBulkErrorResponse(response)) {
		const error = defaultString(response.error_message, defaultString(response.message, 'Unknown error'));
		throw new ApplicationError('Error sending file: ' + error);
	}

	if ('return_url' in details.request) {
		response.return_url = details.request.return_url;
	}

	response.item_count = details.itemCount;

	const binary = inputType === SendFileInputFieldType.FILE ? undefined : { data: details.binaryData };

	return [
		{
			json: response,
			binary: binary,
		} as INodeExecutionData,
	] as INodeExecutionData[];
}

/**
 * Downloads a ZeroBounce bulk validation or scoring results file and optionally converts it into structured JSON data.
 *
 * Depending on the selected bulk operation mode (`Mode.VALIDATION` or `Mode.SCORING`), this function retrieves a
 * processed results file from the ZeroBounce Bulk API (`/getfile` or `/scoring/getfile` endpoint). If the API response is
 * a binary CSV file, it is returned as binary data; otherwise, the function attempts to extract and throw an error message.
 * The node can either output the raw file or parse it into individual JSON results based on the selected output type.
 *
 * @param context - The n8n execution context providing node parameters, HTTP helpers, and binary utilities.
 * @param i - The index of the current input item being processed.
 * @param mode - Determines the bulk operation type:
 *   - `Mode.VALIDATION`: Downloads an email validation results file.
 *   - `Mode.SCORING`: Downloads an email scoring results file.
 *
 * @returns A Promise resolving to one or more `INodeExecutionData` items:
 * - **File output mode:** Returns a single item containing the binary CSV file under `binary.data`.
 * - **Fields output mode:** Returns either one item with all parsed results (`Batch = true`),
 *   or multiple items where each JSON entry represents one record in the CSV file.
 *
 * @throws {ApplicationError} If:
 * - The API response is not binary (`content-type` not `application/octet-stream`).
 * - The API returns an error message in JSON or text format.
 * - The response body is not valid binary data.
 * - The output type parameter is missing or invalid.
 *
 * @example
 * // Example output (File mode)
 * [
 *   {
 *     "json": {
 *       "file_id": "aaaaaaaa-zzzz-xxxx-yyyy-5003727fffff",
 *       "file_name": "results.csv",
 *       "remote_file_name": "results.csv",
 *       "file_size": "1024",
 *       "activity_data": true
 *     },
 *     "binary": {
 *       "data": {
 *         "fileName": "results.csv",
 *         "mimeType": "text/csv",
 *         "data": "<base64-encoded CSV>"
 *       }
 *     }
 *   }
 * ]
 *
 * @example
 * // Example output (Fields mode, Batch = false)
 * [
 *   {
 *     "json": {
 *       "file_id": "aaaaaaaa-zzzz-xxxx-yyyy-5003727fffff",
 *       "file_name": "results.csv",
 *       "item_number": 1,
 *       "total_items": 3,
 *       "result": { "email_address": "user1@example.com", "status": "valid" }
 *     }
 *   },
 *   {
 *     "json": {
 *       "file_id": "aaaaaaaa-zzzz-xxxx-yyyy-5003727fffff",
 *       "file_name": "results.csv",
 *       "item_number": 2,
 *       "total_items": 3,
 *       "result": { "email_address": "user2@example.com", "status": "invalid" }
 *     }
 *   }
 * ]
 *
 * @remarks
 * - The correct endpoint (`/getfile` or `/scoring/getfile`) is selected automatically based on `mode`.
 * - Supports both raw binary file output and parsed record output.
 * - Includes full metadata (`file_name`, `file_size`, `remote_file_name`, `activity_data`) in the output JSON.
 */
export async function getFile(context: IExecuteFunctions, i: number, mode: Mode): Promise<INodeExecutionData[]> {
	const fileId = getFileId(context, i);
	let request: IGetFileRequest;
	let endpoint: BulkEndpoint;

	switch (mode) {
		case Mode.VALIDATION: {
			endpoint = BulkEndpoint.GetFile;

			request = {
				file_id: fileId,
				activityData: context.getNodeParameter(ActivityData.name, i) as boolean,
			};
			break;
		}
		case Mode.SCORING: {
			endpoint = BulkEndpoint.ScoringGetFile;
			request = {
				file_id: fileId,
			};
			break;
		}
		case Mode.EMAIL_FINDER:
			endpoint = BulkEndpoint.EmailFinderGetFile;
			request = {
				file_id: fileId,
			};
			break;
	}

	const fullResponse = await zbGetFileRequest(context, baseUrl(mode), endpoint, request);
	const headers = fullResponse.headers;
	const response = fullResponse.body;

	const contentType = headers['content-type'] as string;

	if (contentType !== 'application/octet-stream') {
		const message = getFileErrorMessage(contentType, response);
		throw new ApplicationError('Failed to get file: ' + message);
	}

	const remoteFilename = getFileNameFromHeader(headers, fileId);
	const fileName = defaultString(context.getNodeParameter(FileName.name, i) as string, remoteFilename);

	if (!isBinary(response)) {
		throw new ApplicationError(`Invalid response body: ${JSON.stringify(response)}`);
	}

	const binaryData = await context.helpers.prepareBinaryData(response, fileName, 'text/csv');

	const outputType = context.getNodeParameter(GetFileOutputType.name, i) as GetFileOutputFieldType;

	if (outputType === undefined || outputType === null) {
		throw new ApplicationError('Please select output type');
	}

	const baseResponse: INodeExecutionData = {
		json: {
			file_id: fileId,
			file_name: binaryData.fileName,
			remote_file_name: remoteFilename,
			file_size: headers['content-length'],
			activity_data: request.activityData,
			item_number: undefined,
			total_items: undefined,
		},
	};

	switch (outputType) {
		case GetFileOutputFieldType.FILE: {
			return [
				{
					...baseResponse,
					binary: {
						data: binaryData,
					},
				},
			] as INodeExecutionData[];
		}
		case GetFileOutputFieldType.FIELDS: {
			const batch = context.getNodeParameter(Batch.name, i) as boolean;
			const results = await convertFileToFields(binaryData);

			if (batch) {
				// Return a single result containing the entire results batch
				return [
					{
						...baseResponse,
						json: {
							total_items: results.length,
							results: results,
						},
					} as INodeExecutionData,
				] as INodeExecutionData[];
			} else {
				// Return a result for each line in the file
				return results.map(
					(result, index) =>
						({
							...baseResponse,
							json: {
								item_number: index + 1,
								total_items: results.length,
								result: result,
							},
						}) as INodeExecutionData,
				);
			}
		}
	}
}

/**
 * Retrieves the current processing status of a bulk email validation/scoring file from the ZeroBounce API.
 *
 * This function queries the ZeroBounce Bulk API `/filestatus` or '/scoring/filestatus' endpoint using the provided file ID
 * to check whether a previously uploaded file is still being processed, completed, or has encountered an error.
 * If the API response indicates failure (`success: false`), the function throws an `ApplicationError`
 * with the returned error message.
 *
 * @param context - The n8n execution context providing access to parameters, input data, and HTTP helpers.
 * @param i - The index of the current workflow item being processed.
 * @param mode - Whether to request the status of a validation or scoring file
 * @returns A Promise resolving to an `INodeExecutionData` object containing:
 * - `json`: The parsed response from the ZeroBounce API, including fields such as:
 *   - `file_id`: The unique identifier of the file.
 *   - `file_name`: The original filename of the uploaded file.
 *   - `upload_date`: ISO timestamp of when the file was uploaded.
 *   - `file_status`: Current processing status (e.g., `Queued`, `In Progress`, `Complete`).
 *   - `complete_percentage`: Completion percentage as a string.
 *   - `return_url`: Callback URL if one was provided during upload.
 *
 * @throws {ApplicationError} If:
 * - The ZeroBounce API returns `success: false`.
 * - The response format is invalid or missing required fields.
 *
 * @example
 * // Example successful response:
 * {
 *   "json": {
 *     "success": true,
 *     "file_id": "aaaaaaaa-zzzz-xxxx-yyyy-5003727fffff",
 *     "file_name": "emails.csv",
 *     "upload_date": "2023-04-28T15:25:41Z",
 *     "file_status": "Complete",
 *     "complete_percentage": "100%",
 *     "return_url": "https://example.com/webhook"
 *   }
 * }
 *
 * @remarks
 * - Throws immediately if the API response indicates failure.
 */
export async function fileStatus(context: IExecuteFunctions, i: number, mode: Mode): Promise<INodeExecutionData[]> {
	const fileId = getFileId(context, i);

	const request: IFileStatusRequest = {
		file_id: fileId,
	};

	let endpoint: BulkEndpoint;

	switch (mode) {
		case Mode.VALIDATION: {
			endpoint = BulkEndpoint.FileStatus;
			break;
		}
		case Mode.SCORING: {
			endpoint = BulkEndpoint.ScoringFileStatus;
			break;
		}
		case Mode.EMAIL_FINDER:
			endpoint = BulkEndpoint.EmailFinderFileStatus;
			break;
	}

	const fullResponse = await zbGetRequest(context, baseUrl(mode), endpoint, request);
	const response = fullResponse.body as IFileStatusResponse | IBulkErrorResponse;

	if (isBulkErrorResponse(response)) {
		const error = response?.error_message ?? response?.message ?? 'Unknown error';
		throw new ApplicationError('Error getting file status: ' + error);
	}

	return [
		{
			json: response,
		} as INodeExecutionData,
	] as INodeExecutionData[];
}

/**
 * Deletes a previously uploaded ZeroBounce bulk validation or scoring file from the ZeroBounce API.
 *
 * This function sends a request to the appropriate ZeroBounce Bulk API endpoint
 * (`/deletefile` or `/scoring/deletefile`) depending on the selected `mode`.
 * It deletes the file identified by the provided `file_id` and returns the API response.
 * The node outputs a JSON object indicating whether the file was successfully deleted.
 *
 * @param context - The n8n execution context providing node parameters, credentials, and HTTP helpers.
 * @param i - The index of the current workflow item being processed.
 * @param mode - Determines the bulk operation type:
 *   - `Mode.VALIDATION`: Deletes a validation file.
 *   - `Mode.SCORING`: Deletes a scoring file.
 *
 * @returns A Promise resolving to an array containing one `INodeExecutionData` object with:
 * - `json`: The parsed API response, including:
 *   - `deleted`: Boolean flag indicating whether deletion was successful.
 *   - `message` or `error_message`: Message returned from the API.
 *   - `file_id`: The ID of the deleted file.
 *
 * @throws {ApplicationError} If the API request fails or returns an unexpected response.
 *
 * @example
 * // Example output (successful deletion)
 * [
 *   {
 *     "json": {
 *       "deleted": true,
 *       "success": true,
 *       "message": "File deleted successfully",
 *       "file_id": "aaaaaaaa-zzzz-xxxx-yyyy-5003727fffff"
 *     }
 *   }
 * ]
 *
 * @example
 * // Example output (failed deletion)
 * [
 *   {
 *     "json": {
 *       "deleted": false,
 *       "success": false,
 *       "error_message": "File not found",
 *       "file_id": "aaaaaaaa-zzzz-xxxx-yyyy-5003727fffff"
 *     }
 *   }
 * ]
 *
 * @remarks
 * - Automatically selects the correct endpoint (`/deletefile` or `/scoring/deletefile`) based on the `mode` parameter.
 * - Returns the API response merged with a `deleted` flag for convenient downstream use.
 * - Does not throw on API-level errors — the `deleted` flag reflects the result.
 */
export async function deleteFile(context: IExecuteFunctions, i: number, mode: Mode): Promise<INodeExecutionData[]> {
	const fileId = getFileId(context, i);

	const request: IDeleteFileRequest = {
		file_id: fileId,
	};

	let endpoint: BulkEndpoint;

	switch (mode) {
		case Mode.VALIDATION: {
			endpoint = BulkEndpoint.DeleteFile;
			break;
		}
		case Mode.SCORING: {
			endpoint = BulkEndpoint.ScoringDeleteFile;
			break;
		}
		case Mode.EMAIL_FINDER:
			endpoint = BulkEndpoint.EmailFinderDeleteFile;
			break;
	}

	const fullResponse = await zbGetRequest(context, baseUrl(mode), endpoint, request);
	const response = fullResponse.body as IDeleteFileResponse | IBulkErrorResponse;

	return [
		{
			json: {
				deleted: response.success,
				...response,
			},
		},
	] as INodeExecutionData[];
}

export function getFileErrorMessage(contentType: string, response: unknown) {
	if (contentType === 'application/json') {
		let error: IBulkErrorResponse;

		if (isBulkErrorResponse(response)) {
			error = response;
		} else if (response instanceof Buffer) {
			error = JSON.parse(String(response)) as IBulkErrorResponse;
		} else if (typeof response === 'string') {
			error = JSON.parse(response);
		} else {
			error = response as IBulkErrorResponse;
		}
		return error?.error_message ?? error?.message ?? JSON.stringify(error);
	} else {
		return JSON.stringify(response);
	}
}
