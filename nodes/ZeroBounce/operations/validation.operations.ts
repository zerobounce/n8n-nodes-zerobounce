import { Timeout } from '../fields/timeout.field';
import { ActivityData } from '../fields/activity-data.field';
import { VerifyPlus } from '../fields/verify-plus.field';
import { Email } from '../fields/email.field';
import { EmailBatchAssignment, EmailBatchJson, EmailBatchMapped, EmailBatchType } from '../fields/email-batch.field';
import { ApiEndpoint } from '../fields/api-endpoint.field';
import { IpAddress } from '../fields/ip-address.field';
import { addDisplayOptions, combineItemsHint, documentationHint, multipleInputItemsHint } from '../utils/field.utils';
import { Documentation, Fields, Operations, Resources } from '../enums';
import { INodeProperties, NodeHint } from 'n8n-workflow';
import { CombineItems } from '../fields/combine-items.field';
import { BinaryKey } from '../fields/binary-key.field';
import { HasHeader } from '../fields/has-header.field';
import { EmailColumnNumber } from '../fields/email-address-column.field';
import { IpAddressColumnNumber } from '../fields/ip-address-column.field';
import { FileName } from '../fields/file-name.field';
import { RemoveDuplicates } from '../fields/remove-duplicates.field';
import { ReturnUrl } from '../fields/return-url.field';
import { SendFileInputFieldType, SendFileInputType } from '../fields/send-file-input-type.field';
import { FileId } from '../fields/file-id.field';
import { GetFileOutputFieldType, GetFileOutputType } from '../fields/get-file-output-type.field';
import { Batch } from '../fields/batch.field';

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

// prettier-ignore
const EmailBatchFields: INodeProperties[] = [
	CombineItems,
	EmailBatchType,
	EmailBatchAssignment,
	EmailBatchJson,
	EmailBatchMapped,
];

// prettier-ignore
const BinaryFileFields: INodeProperties[] = [
	BinaryKey,
	HasHeader,
	EmailColumnNumber,
	IpAddressColumnNumber,
];

// prettier-ignore
const SendFileFields: INodeProperties[] = [
	FileName,
	RemoveDuplicates,
	ReturnUrl,
	SendFileInputType,
	...BinaryFileFields.map(addDisplayOptions({[Fields.SendFileInputType]: [SendFileInputFieldType.FILE]})),
	...EmailBatchFields.map(addDisplayOptions({[Fields.SendFileInputType]: [SendFileInputFieldType.EMAIL_BATCH]})),
].map(addDisplayOptions({
	resource: [Resources.Validation],
	operation: [Operations.BulkValidationSendFile]
}));

// prettier-ignore
const GetFileFields: INodeProperties[] = [
	{
		...FileId,
		default: '={{ $json.body.file_id }}',
	},
	ActivityData,
	FileName,
	GetFileOutputType,
	...[Batch].map(addDisplayOptions({ [Fields.GetFileOutputType]: [GetFileOutputFieldType.FIELDS] })),
].map(addDisplayOptions({
	resource: [Resources.Validation],
	operation: [Operations.BulkValidationGetFile]
}));

// prettier-ignore
const FileStatusFields: INodeProperties[] = [
	FileId,
].map(addDisplayOptions({
	resource: [Resources.Validation],
	operation: [Operations.BulkValidationFileStatus]
}));

// prettier-ignore
const DeleteFileFields: INodeProperties[] = [
	FileId,
].map(addDisplayOptions({
	resource: [Resources.Validation],
	operation: [Operations.BulkValidationDeleteFile]
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
				action: 'Validate an email',
				description: 'Validate a single email address (real-time)',
			},
			{
				value: Operations.ValidationBatchValidate,
				name: 'Validate Batch',
				action: 'Validate an email batch',
				description:
					"Validates batches of up to 200 email addresses at a time. It is rate limited to 5 uses per minute, if you exceed the rate limit, you will be blocked for 10 minutes. If you're looking to do single email validations, please use our single email validator endpoint.",
			},
			{
				value: Operations.BulkValidationSendFile,
				name: 'Bulk Validate Send File',
				action: 'Send validation file',
				description: 'Send a file to ZeroBounce for bulk validation',
			},
			{
				value: Operations.BulkValidationGetFile,
				name: 'Bulk Validate Get File',
				action: 'Get validation results file',
				description: 'Get the results file for a submitted validation file',
			},
			{
				value: Operations.BulkValidationFileStatus,
				name: 'Bulk Validate File Status',
				action: 'Get validation file status',
				description: 'Get the status of a file submitted for validation',
			},
			{
				value: Operations.BulkValidationDeleteFile,
				name: 'Bulk Validate Delete File',
				action: 'Delete validation file',
				description: 'Delete a previously submitted validation file',
			},
		],
		default: Operations.ValidationValidate,
	},
	...ValidateFields,
	...BatchValidateFields,
	...SendFileFields,
	...GetFileFields,
	...FileStatusFields,
	...DeleteFileFields,
];

export const ValidationOperationHints: NodeHint[] = [
	documentationHint(
		Operations.ValidationValidate,
		'Email Validation: Single Email Validation',
		Documentation.ValidationValidate,
	),
	documentationHint(
		Operations.ValidationBatchValidate,
		'Email Validation: Batch Email Validation',
		Documentation.ValidationBatchValidate,
	),
	multipleInputItemsHint(Operations.BulkValidationSendFile),
	combineItemsHint(Operations.BulkValidationSendFile),
	documentationHint(
		Operations.BulkValidationSendFile,
		'Bulk Validation: Send File',
		Documentation.BulkValidationSendFile,
	),
	documentationHint(Operations.BulkValidationGetFile, 'Bulk Validation: Get File', Documentation.BulkValidationGetFile),
	documentationHint(
		Operations.BulkValidationFileStatus,
		'Bulk Validation: File Status',
		Documentation.BulkValidationFileStatus,
	),
	documentationHint(
		Operations.BulkValidationFileStatus,
		'Bulk Validation: Delete File',
		Documentation.BulkValidationDeleteFile,
	),
];
