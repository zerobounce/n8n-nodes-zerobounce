import { Timeout } from '../fields/timeout.field';
import { ActivityData } from '../fields/activity-data.field';
import { VerifyPlus } from '../fields/verify-plus.field';
import { Email } from '../fields/email.field';
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
import { ItemInputAssignment, ItemInputJson, ItemInputMapped, ItemInputType } from '../fields/item-input.field';
import { IncludeFile } from '../fields/include-file.field';

const ValidateFields: INodeProperties[] = [
	// prettier-ignore
	ApiEndpoint,
	Timeout,
	ActivityData,
	VerifyPlus,
	Email,
	IpAddress,
].map(
	addDisplayOptions({
		resource: [Resources.Validation],
		operation: [Operations.ValidationValidate],
	}),
);

const ValidateItemInputFields: INodeProperties[] = [
	ItemInputType,
	{
		...ItemInputAssignment,
		description: 'Email(s) or email objects (and optional IPs) to validate',
	},
	{
		...ItemInputJson,
		default: '[\n  {"email_address": "valid@example.com", "ip_address": ""}\n]',
		description: 'JSON containing one or more email or email objects (and optional IPs) to validate',
	},
	{
		...ItemInputMapped,
		description: 'List of emails (and optional IPs) to validate',
		options: [
			{
				displayName: 'Mapped Values',
				name: 'mappedValues',
				values: [
					{ ...Email, name: 'email_address' },
					{ ...IpAddress, name: 'ip_address' },
				],
			},
		],
	},
];

const BatchValidateFields: INodeProperties[] = [Timeout, ActivityData, VerifyPlus, ...ValidateItemInputFields].map(
	addDisplayOptions({
		resource: [Resources.Validation],
		operation: [Operations.ValidationBatchValidate],
	}),
);

const ItemInputFields: INodeProperties[] = [
	// prettier-ignore
	CombineItems,
	IncludeFile,
	...ValidateItemInputFields,
];

const BinaryFileFields: INodeProperties[] = [
	// prettier-ignore
	BinaryKey,
	HasHeader,
	EmailColumnNumber,
	IpAddressColumnNumber,
];

const SendFileFields: INodeProperties[] = [
	{
		...FileName,
		placeholder: 'e.g. n8n_validation.csv',
	},
	RemoveDuplicates,
	ReturnUrl,
	SendFileInputType,
	...BinaryFileFields.map(addDisplayOptions({ [Fields.SendFileInputType]: [SendFileInputFieldType.FILE] })),
	...ItemInputFields.map(addDisplayOptions({ [Fields.SendFileInputType]: [SendFileInputFieldType.ITEMS] })),
].map(
	addDisplayOptions({
		resource: [Resources.Validation],
		operation: [Operations.BulkValidationSendFile],
	}),
);

const GetFileFields: INodeProperties[] = [
	{
		...FileId,
		default: '={{ $json.body.file_id }}',
	},
	ActivityData,
	{
		...FileName,
		placeholder: 'e.g. n8n_validation_results.csv',
	},
	GetFileOutputType,
	...[Batch, IncludeFile].map(addDisplayOptions({ [Fields.GetFileOutputType]: [GetFileOutputFieldType.FIELDS] })),
].map(
	addDisplayOptions({
		resource: [Resources.Validation],
		operation: [Operations.BulkValidationGetFile],
	}),
);

const FileStatusFields: INodeProperties[] = [
	// prettier-ignore
	FileId,
].map(
	addDisplayOptions({
		resource: [Resources.Validation],
		operation: [Operations.BulkValidationFileStatus],
	}),
);

const DeleteFileFields: INodeProperties[] = [
	// prettier-ignore
	FileId,
].map(
	addDisplayOptions({
		resource: [Resources.Validation],
		operation: [Operations.BulkValidationDeleteFile],
	}),
);

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

// prettier-ignore
export const ValidationOperationHints: NodeHint[] = [
	multipleInputItemsHint(Operations.BulkValidationSendFile),
	combineItemsHint(Operations.BulkValidationSendFile),
	documentationHint(Operations.ValidationValidate, 'Email Validation: Single Email Validation', Documentation.ValidationValidate),
	documentationHint(Operations.ValidationBatchValidate, 'Email Validation: Batch Email Validation', Documentation.ValidationBatchValidate),
	documentationHint(Operations.BulkValidationSendFile, 'Bulk Validation: Send File', Documentation.BulkValidationSendFile),
	documentationHint(Operations.BulkValidationGetFile, 'Bulk Validation: Get File', Documentation.BulkValidationGetFile),
	documentationHint(Operations.BulkValidationFileStatus, 'Bulk Validation: File Status',Documentation.BulkValidationFileStatus),
	documentationHint(Operations.BulkValidationDeleteFile, 'Bulk Validation: Delete File', Documentation.BulkValidationDeleteFile),
];
