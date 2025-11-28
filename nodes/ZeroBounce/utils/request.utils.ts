import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	IN8nHttpFullResponse,
	NodeApiError,
	NodeOperationError,
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
 * Sends an authenticated request to the ZeroBounce API with standardized logging.
 * Handles both JSON and FormData payloads.
 */
export async function zbRequest(
	context: IExecuteFunctions,
	requestOptions: IHttpRequestOptions,
	returnError?: boolean,
): Promise<IN8nHttpFullResponse> {
	if (isBlank(requestOptions.url)) {
		throw new NodeOperationError(context.getNode(), 'zbRequest called without a valid URL.');
	}

	// Always return the full response so we can check the statusCode
	requestOptions.returnFullResponse = true;

	const method = (requestOptions.method ?? 'GET').toUpperCase();

	switch (method) {
		case 'GET':
			break;

		case 'POST':
			if (!requestOptions.body) {
				throw new NodeOperationError(
					context.getNode(),
					'Either a body or formData must be provided for a POST request.',
				);
			}
			break;

		default:
			throw new NodeOperationError(context.getNode(), `Unsupported method '${requestOptions.method}'`);
	}

	let response: IN8nHttpFullResponse;

	try {
		response = (await context.helpers.httpRequestWithAuthentication.call(
			context,
			Credentials.ZeroBounceApi,
			requestOptions,
		)) as IN8nHttpFullResponse;
	} catch (error) {
		context.logger.debug(`ZeroBounce API call failed with status ${error?.httpCode ?? 'unknown'}: ${error.message}`);
		throw error;
	}

	context.logger.debug(
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
