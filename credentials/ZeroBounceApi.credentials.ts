import {
	IAuthenticate,
	Icon,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';
import { ApiKey } from '../nodes/ZeroBounce/fields/api-key.field';
import { BaseUrl, Credentials, Endpoint } from '../nodes/ZeroBounce/enums';

export class ZeroBounceApi implements ICredentialType {
	name = Credentials.ZeroBounceApi;
	displayName = 'ZeroBounce API';
	icon: Icon = {
		light: 'file:../icons/zb-icon.svg',
		dark: 'file:../icons/zb-icon.dark.svg',
	};
	documentationUrl = 'https://www.zerobounce.net/docs/api-dashboard/keys-management';
	properties: INodeProperties[] = [ApiKey];
	test: ICredentialTestRequest = {
		request: {
			baseURL: BaseUrl.DEFAULT,
			url: Endpoint.GetCredits,
			method: 'POST',
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'Credits',
					value: '-1',
					message: 'Invalid API key',
				},
			},
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'Credits',
					value: -1,
					message: 'Invalid API key',
				},
			},
		],
	};

	authenticate: IAuthenticate = async (
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	) => {
		const apiKey =
			typeof credentials.apiKey === 'string' ? credentials.apiKey.trim() : credentials.apiKey;

		if (typeof apiKey !== 'string' || apiKey.length !== 32) {
			throw new Error('Invalid API key: API key must be 32 characters long');
		}

		const method = requestOptions.method?.toUpperCase() ?? 'GET';

		if (method === 'GET') {
			// GET → add as query param
			const queryParams = requestOptions.qs ?? {};

			requestOptions.qs = {
				...queryParams,
				api_key: apiKey,
			};
		} else if (requestOptions.body instanceof FormData || requestOptions.body instanceof URLSearchParams) {
			// POST Form → add to form data
			requestOptions.body.set('api_key', apiKey);
		} else if (
			requestOptions.body &&
			typeof requestOptions.body === 'object' &&
			Object.keys(requestOptions.body).length > 0
		) {
			// POST JSON (e.g. /validatebatch) → add to body
			const body = requestOptions.body as Record<string, unknown>;

			requestOptions.body = {
				...body,
				api_key: apiKey,
			};
			requestOptions.json = true;
		} else {
			// POST without body (e.g. credential test /getcredits) → send as URL-encoded form
			requestOptions.body = new URLSearchParams({ api_key: apiKey });
		}

		requestOptions.headers = {
			...requestOptions.headers,
			'X-ZB-Origin': 'external-n8n',
			'X-ZB-Origin-Id': apiKey.slice(-5),
		};

		return requestOptions;
	};
}
