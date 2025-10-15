import { addDisplayOptions, combineItemsHint, documentationHint, multipleInputItemsHint } from '../utils/field.utils';
import { EmailBatchAssignment, EmailBatchJson, EmailBatchMapped, EmailBatchType } from '../fields/email-batch.field';
import { Documentation, Fields, Operations, Resources } from '../enums';
import { BinaryKey } from '../fields/binary-key.field';
import { FileId } from '../fields/file-id.field';
import { ReturnUrl } from '../fields/return-url.field';
import { ActivityData } from '../fields/activity-data.field';
import { Batch } from '../fields/batch.field';
import { FileName } from '../fields/file-name.field';
import { HasHeader } from '../fields/has-header.field';
import { RemoveDuplicates } from '../fields/remove-duplicates.field';
import { EmailColumnNumber } from '../fields/email-address-column.field';
import { IpAddressColumnNumber } from '../fields/ip-address-column.field';
import { SendFileInputFieldType, SendFileInputType } from '../fields/send-file-input-type.field';
import { GetFileOutputFieldType, GetFileOutputType } from '../fields/get-file-output-type.field';
import { CombineItems } from '../fields/combine-items.field';
import { INodeProperties, NodeHint } from 'n8n-workflow';

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
	resource: [Resources.BulkValidation],
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
	resource: [Resources.BulkValidation],
	operation: [Operations.BulkValidationGetFile]
}));

// prettier-ignore
const FileStatusFields: INodeProperties[] = [
FileId,
].map(addDisplayOptions({
resource: [Resources.BulkValidation],
operation: [Operations.BulkValidationFileStatus]
}));

// prettier-ignore
const DeleteFileFields: INodeProperties[] = [
	FileId,
].map(addDisplayOptions({
	resource: [Resources.BulkValidation],
	operation: [Operations.BulkValidationDeleteFile]
}));

export const BulkValidationOperations: INodeProperties[] = [
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [Resources.BulkValidation],
			},
		},
		options: [
			{
				value: Operations.BulkValidationSendFile,
				name: 'Send Validation File',
				action: 'Send a file for validation',
				description: 'Send a file to ZeroBounce for bulk validation',
			},
			{
				value: Operations.BulkValidationGetFile,
				name: 'Get Validation Results File',
				action: 'Get a validation results file',
				description: 'Get the results file for a submitted validation file',
			},
			{
				value: Operations.BulkValidationFileStatus,
				name: 'Get Validation File Status',
				action: 'Get the status of a validation file',
				description: 'Get the status of a file submitted for validation',
			},
			{
				value: Operations.BulkValidationDeleteFile,
				name: 'Delete Validation File',
				action: 'Delete a validation file',
				description: 'Delete a previously submitted validation file',
			},
		],
		default: Operations.BulkValidationSendFile,
	},
	...SendFileFields,
	...GetFileFields,
	...FileStatusFields,
	...DeleteFileFields,
];

// prettier-ignore
export const BulkValidationOperationHints: NodeHint[] = [
	multipleInputItemsHint(Operations.BulkValidationSendFile),
	combineItemsHint(Operations.BulkValidationSendFile),
	documentationHint(Operations.BulkValidationSendFile, 'Bulk Validation: Send File', Documentation.BulkValidationSendFile),
	documentationHint(Operations.BulkValidationGetFile, 'Bulk Validation: Get File', Documentation.BulkValidationGetFile),
	documentationHint(Operations.BulkValidationFileStatus, 'Bulk Validation: File Status', Documentation.BulkValidationFileStatus),
	documentationHint(Operations.BulkValidationFileStatus, 'Bulk Validation: Delete File', Documentation.BulkValidationDeleteFile),
];
