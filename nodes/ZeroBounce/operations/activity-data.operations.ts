// prettier-ignore
import { INodeProperties, NodeHint } from 'n8n-workflow';
import { addDisplayOptions, documentationHint } from '../utils/field.utils';
import { Documentation, Operations, Resources } from '../enums';
import { ApiEndpoint } from '../fields/api-endpoint.field';
import { Email } from '../fields/email.field';

const ActivityDataFields: INodeProperties[] = [
	// prettier-ignore
	ApiEndpoint,
	{
		...Email,
		description: 'The email address you want activity data for',
	},
].map(
	addDisplayOptions({
		resource: [Resources.ActivityData],
		operation: [Operations.ActivityData],
	}),
);

export const ActivityDataOperations: INodeProperties[] = [
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [Resources.ActivityData],
			},
		},
		options: [
			{
				value: Operations.ActivityData,
				name: 'Activity Data',
				action: 'Get activity data',
				description:
					'Our Activity Data feature allows you to gather insights into your subscribers’ overall email engagement. ' +
					'The tool returns if the email inbox has been active in the past 30, 60, 90, 180, 365, or 365+ days. ' +
					'This indicates a potentially outdated contact, not recommended for cold emailing. ' +
					'Thus, you can improve your targeting and personalization and run more successful email campaigns.',
			},
		],
		default: Operations.ActivityData,
	},
	...ActivityDataFields,
];

export const ActivityDataOperationHints: NodeHint[] = [
	documentationHint(Operations.ActivityData, 'Activity Data', Documentation.ActivityData),
];
