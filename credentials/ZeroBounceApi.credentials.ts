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
		light: 'file:../icons/zerobounce.svg',
		dark: 'file:../icons/zerobounce.dark.svg',
	};
	documentationUrl = 'https://www.zerobounce.net/docs/api-dashboard/#API_keys_management';
	properties: INodeProperties[] = [ApiKey];
	test: ICredentialTestRequest = {
		request: {
			baseURL: BaseUrl.DEFAULT,
			url: Endpoint.GetCredits,
			method: 'GET',
		},
	};

	authenticate: IAuthenticate = async (
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	) => {
		const apiKey = credentials.apiKey as string;
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
		} else {
			// POST (or any non-GET) → add to body
			const body = (requestOptions.body ?? {}) as Record<string, unknown>;

			requestOptions.body = {
				...body,
				api_key: apiKey,
			};
			requestOptions.json = true;
		}

		return requestOptions;
	};
}
