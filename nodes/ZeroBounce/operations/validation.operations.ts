import { Timeout } from '../fields/timeout.field';
import { ActivityData } from '../fields/activity-data.field';
import { VerifyPlus } from '../fields/verify-plus.field';
import { Email } from '../fields/email.field';
import { EmailBatchAssignment, EmailBatchJson, EmailBatchMapped, EmailBatchType } from '../fields/email-batch.field';
import { ApiEndpoint } from '../fields/api-endpoint.field';
import { IpAddress } from '../fields/ip-address.field';
import { addDisplayOptions, documentationHint } from '../utils/field.utils';
import { Documentation, Operations, Resources } from '../enums';
import { INodeProperties, NodeHint } from 'n8n-workflow';

// prettier-ignore
const ValidateFields: INodeProperties[] = [
	ApiEndpoint,
	Timeout,
	ActivityData,
	VerifyPlus,
	Email,
	IpAddress,
].map(addDisplayOptions({
	resource: [Resources.Validation],
	operation: [Operations.ValidationValidate]
}));

// prettier-ignore
const BatchValidateFields: INodeProperties[] = [
	Timeout,
	ActivityData,
	VerifyPlus,
	EmailBatchType,
	EmailBatchAssignment,
	EmailBatchJson,
	EmailBatchMapped,
].map(addDisplayOptions({
	resource: [Resources.Validation],
	operation: [Operations.ValidationBatchValidate]
}));

export const ValidationOperations: INodeProperties[] = [
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [Resources.Validation],
			},
		},
		options: [
			{
				value: Operations.ValidationValidate,
				name: 'Validate Email',
				action: 'Validate an email address',
				description: 'Validate a single email address (real-time)',
			},
			{
				value: Operations.ValidationBatchValidate,
				name: 'Validate Batch',
				action: 'Validate a batch of email addresses',
				description:
					"Validates batches of up to 200 email addresses at a time. It is rate limited to 5 uses per minute, if you exceed the rate limit, you will be blocked for 10 minutes. If you're looking to do single email validations, please use our single email validator endpoint.",
			},
		],
		default: Operations.ValidationValidate,
	},
	...ValidateFields,
	...BatchValidateFields,
];

export const ValidationOperationHints: NodeHint[] = [
	documentationHint(Operations.ValidationValidate, 'Email Validation: Single Email Validation', Documentation.ValidationValidate),
	documentationHint(Operations.ValidationBatchValidate, 'Email Validation: Batch Email Validation', Documentation.ValidationBatchValidate),
];
