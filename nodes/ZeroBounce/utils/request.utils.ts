import {
	ApplicationError,
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	IN8nHttpFullResponse,
	NodeApiError,
} from 'n8n-workflow';
import { BaseUrl, BulkEndpoint, Credentials, Endpoint } from '../enums';
import { isBlank } from './handler.utils';

export interface IRequestParams extends IDataObject {
	api_key?: string;
}

export interface IRequestBody {
	api_key?: string;
}

/**
 * Converts a FormData or URLSearchParams instance into a plain object suitable for safe logging.
 * File values are replaced with metadata (name, type, size).
 */
function extractFormDataSummary(formData: FormData | URLSearchParams): IDataObject {
	const values: IDataObject = {};
	for (const [key, value] of formData.entries()) {
		if (value instanceof File) {
			values[key] = {
				filename: value.name,
				type: value.type,
				size: value.size,
			};
		} else {
			values[key] = value;
		}
	}
	return values;
}

/**
 * Sends an authenticated request to the ZeroBounce API with standardized logging.
 * Handles both JSON and FormData payloads.
 */
export async function zbRequest(
	context: IExecuteFunctions,
	requestOptions: IHttpRequestOptions,
	returnError?: boolean,
): Promise<IN8nHttpFullResponse> {
	if (isBlank(requestOptions.url)) {
		throw new ApplicationError('zbRequest called without a valid URL.');
	}

	// Always return the full response so we can check the statusCode
	requestOptions.returnFullResponse = true;

	const method = (requestOptions.method ?? 'GET').toUpperCase();

	switch (method) {
		case 'GET':
			context.logger.info(
				`ZeroBounce Request: ${requestOptions.method} ${requestOptions.baseURL}${requestOptions.url} queryParams='${JSON.stringify(requestOptions?.qs)}'`,
			);
			break;

		case 'POST':
			if (!requestOptions.body) {
				throw new ApplicationError('Either a body or formData must be provided for a POST request.');
			}

			if (requestOptions.body instanceof FormData) {
				const formData = extractFormDataSummary(requestOptions.body);

				context.logger.info(
					`ZeroBounce Request: ${requestOptions.method} ${requestOptions.baseURL}${requestOptions.url} formData='${JSON.stringify(formData)}'`,
				);
			} else if (requestOptions.body instanceof URLSearchParams) {
				const urlSearchParams = extractFormDataSummary(requestOptions.body);

				context.logger.info(
					`ZeroBounce Request: ${requestOptions.method} ${requestOptions.baseURL}${requestOptions.url} urlSearchParams='${JSON.stringify(urlSearchParams)}'`,
				);
			} else {
				context.logger.info(
					`ZeroBounce Request: ${requestOptions.method} ${requestOptions.baseURL}${requestOptions.url} body='${JSON.stringify(requestOptions.body)}'`,
				);
			}
			break;

		default:
			throw new ApplicationError(`Unsupported method '${requestOptions.method}'`);
	}

	let response: IN8nHttpFullResponse;

	try {
		response = (await context.helpers.httpRequestWithAuthentication.call(
			context,
			Credentials.ZeroBounceApi,
			requestOptions,
		)) as IN8nHttpFullResponse;
	} catch (error) {
		context.logger.info(`ZeroBounce API call failed with status ${error?.httpCode ?? 'unknown'}: ${error.message}`);
		throw error;
	}

	context.logger.info(
		`ZeroBounce Response: ${method} ${requestOptions.baseURL}${requestOptions.url} status=${response.statusCode ?? 'unknown'}`,
	);

	if (!returnError && response.statusCode >= 400) {
		const message = ((response?.body as IDataObject)?.message as string) ?? JSON.stringify(response?.body);
		throw new NodeApiError(context.getNode(), {
			message: `ZeroBounce API call failed with status ${response.statusCode}: ${message}`,
			httpCode: response.statusCode,
		});
	}

	return response;
}

export async function zbGetRequest(
	context: IExecuteFunctions,
	baseUrl: BaseUrl,
	endpoint: Endpoint | BulkEndpoint,
	queryParams?: IRequestParams,
): Promise<IN8nHttpFullResponse> {
	const requestOptions: IHttpRequestOptions = {
		method: 'GET',
		baseURL: baseUrl,
		url: endpoint,
		json: true,
		returnFullResponse: true,
		qs: queryParams,
	};

	return await zbRequest(context, requestOptions);
}

export async function zbGetFileRequest(
	context: IExecuteFunctions,
	baseUrl: BaseUrl,
	endpoint: Endpoint | BulkEndpoint,
	queryParams?: IRequestParams,
): Promise<IN8nHttpFullResponse> {
	const requestOptions: IHttpRequestOptions = {
		method: 'GET',
		baseURL: baseUrl,
		url: endpoint,
		json: true,
		encoding: 'arraybuffer',
		returnFullResponse: true,
		qs: queryParams,
	};

	return await zbRequest(context, requestOptions);
}

export async function zbPostRequest(
	context: IExecuteFunctions,
	baseUrl: BaseUrl,
	endpoint: Endpoint | BulkEndpoint,
	body?: IRequestBody | FormData | URLSearchParams,
	headers?: IDataObject,
): Promise<IN8nHttpFullResponse> {
	const requestOptions: IHttpRequestOptions = {
		method: 'POST',
		baseURL: baseUrl,
		url: endpoint,
		json: true,
		returnFullResponse: true,
		body: body,
		headers: headers,
	};

	return await zbRequest(context, requestOptions);
}
