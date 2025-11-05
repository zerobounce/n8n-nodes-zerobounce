import type { INodeProperties } from 'n8n-workflow';
import { BaseUrl, Fields } from '../enums';

// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
export const ApiEndpoint: INodeProperties = {
	displayName: 'API Endpoint',
	name: Fields.ApiEndpoint,
	type: 'options',
	required: true,
	noDataExpression: true,
	allowArbitraryValues: false,
	description: 'The API endpoint to send the request to',
	options: [
		{
			name: 'Default',
			value: BaseUrl.DEFAULT,
			description: 'The default API endpoint to send the request to',
		},
		{
			name: 'US',
			value: BaseUrl.US,
			description:
				'This is an endpoint where validations and other interactions only occur within the United States. By utilizing this endpoint, you acknowledge and consent to your data being processed on servers in the United States.',
		},
		{
			name: 'EU',
			value: BaseUrl.EU,
			description:
				'This is an endpoint where validations and other interactions only occur within the European Union (EU)',
		},
	],
	default: BaseUrl.DEFAULT,
};
