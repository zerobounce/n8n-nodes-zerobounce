import { INodeProperties, NodeHint } from 'n8n-workflow';
import { Email } from '../fields/email.field';
import { addDisplayOptions, documentationHint } from '../utils/field.utils';
import { Documentation, Operations, Resources } from '../enums';
import { ApiEndpoint } from '../fields/api-endpoint.field';

// prettier-ignore
const ScoreFields: INodeProperties[] = [
	ApiEndpoint,
	Email,
].map(addDisplayOptions({
	resource: [Resources.Scoring],
	operation: [Operations.ScoringScore]
}));

export const ScoringOperations: INodeProperties[] = [
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [Resources.Scoring],
			},
		},
		options: [
			{
				value: Operations.ScoringScore,
				name: 'Score Email',
				action: 'Score an email address',
				description: 'Score a single email address (real-time)',
			},
		],
		default: Operations.ValidationValidate,
	},
	...ScoreFields,
];

export const ScoringOperationHints: NodeHint[] = [
	documentationHint(Operations.ScoringScore, 'A.I. Scoring: Single Email Scoring', Documentation.ScoringScore),
];
