import { INodeProperties, NodeHint } from 'n8n-workflow';
import { Email } from '../fields/email.field';
import { addDisplayOptions, combineItemsHint, documentationHint, multipleInputItemsHint } from '../utils/field.utils';
import { Documentation, Fields, Operations, Resources } from '../enums';
import { ApiEndpoint } from '../fields/api-endpoint.field';
import { CombineItems } from '../fields/combine-items.field';
import { EmailBatchAssignment, EmailBatchJson, EmailBatchMapped, EmailBatchType } from '../fields/email-batch.field';
import { BinaryKey } from '../fields/binary-key.field';
import { HasHeader } from '../fields/has-header.field';
import { EmailColumnNumber } from '../fields/email-address-column.field';
import { FileName } from '../fields/file-name.field';
import { RemoveDuplicates } from '../fields/remove-duplicates.field';
import { ReturnUrl } from '../fields/return-url.field';
import { SendFileInputFieldType, SendFileInputType } from '../fields/send-file-input-type.field';
import { FileId } from '../fields/file-id.field';
import { GetFileOutputFieldType, GetFileOutputType } from '../fields/get-file-output-type.field';
import { Batch } from '../fields/batch.field';

// prettier-ignore
const ScoreFields: INodeProperties[] = [
	ApiEndpoint,
	Email,
].map(addDisplayOptions({
	resource: [Resources.Scoring],
	operation: [Operations.ScoringScore]
}));

// prettier-ignore
const EmailBatchFields: INodeProperties[] = [
	CombineItems,
	EmailBatchType,
	{
		...EmailBatchAssignment,
		description:
			'Array of emails to validate in batch. Expects the format [{"email_address": "..."}, {"email_address": "..."}].',
	},
	{
		...EmailBatchJson,
		default: '[\n  {"email_address": "valid@example.com"},\n  {"email_address": "invalid@example.com"}\n]',
		description:
			'JSON array of emails (and optional IPs) to validate in batch. Expects the format [{"email_address": "..."}, {"email_address": "..."}].',
	},
	{
		...EmailBatchMapped,
		description: 'List of emails to validate in batch',
		options: [
			{
				displayName: 'Email Batch',
				name: 'emailBatch',
				values: [
					{ ...Email, name: 'email_address' },
				],
			},
		],
	},
];

// prettier-ignore
const BinaryFileFields: INodeProperties[] = [
	BinaryKey,
	HasHeader,
	EmailColumnNumber,
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
	resource: [Resources.Scoring],
	operation: [Operations.BulkScoringSendFile]
}));

// prettier-ignore
const GetFileFields: INodeProperties[] = [
	{
		...FileId,
		default: '={{ $json.body.file_id }}',
	},
	FileName,
	GetFileOutputType,
	...[Batch].map(addDisplayOptions({ [Fields.GetFileOutputType]: [GetFileOutputFieldType.FIELDS] })),
].map(addDisplayOptions({
	resource: [Resources.Scoring],
	operation: [Operations.BulkScoringGetFile]
}));

// prettier-ignore
const FileStatusFields: INodeProperties[] = [
	FileId,
].map(addDisplayOptions({
	resource: [Resources.Scoring],
	operation: [Operations.BulkScoringFileStatus]
}));

// prettier-ignore
const DeleteFileFields: INodeProperties[] = [
	FileId,
].map(addDisplayOptions({
	resource: [Resources.Scoring],
	operation: [Operations.BulkScoringDeleteFile]
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
				action: 'Score an email',
				description: 'Score a single email address (real-time)',
			},
			{
				value: Operations.BulkScoringSendFile,
				name: 'Bulk Scoring Send File',
				action: 'Send scoring file',
				description: 'Send a file to ZeroBounce for bulk scoring',
			},
			{
				value: Operations.BulkScoringGetFile,
				name: 'Bulk Scoring Get File',
				action: 'Get scoring results file',
				description: 'Get the results file for a submitted scoring file',
			},
			{
				value: Operations.BulkScoringFileStatus,
				name: 'Bulk Scoring File Status',
				action: 'Get scoring file status',
				description: 'Get the status of a file submitted for scoring',
			},
			{
				value: Operations.BulkScoringDeleteFile,
				name: 'Bulk Scoring Delete File',
				action: 'Delete scoring file',
				description: 'Delete a previously submitted scoring file',
			},
		],
		default: Operations.ScoringScore,
	},
	...ScoreFields,
	...SendFileFields,
	...GetFileFields,
	...FileStatusFields,
	...DeleteFileFields,
];

export const ScoringOperationHints: NodeHint[] = [
	documentationHint(Operations.ScoringScore, 'A.I. Scoring: Single Email Scoring', Documentation.ScoringScore),
	multipleInputItemsHint(Operations.BulkScoringSendFile),
	combineItemsHint(Operations.BulkScoringSendFile),
	documentationHint(Operations.BulkScoringSendFile, 'Bulk A.I. Scoring: Send File', Documentation.BulkScoringSendFile),
	documentationHint(Operations.BulkScoringGetFile, 'Bulk A.I. Scoring: Get File', Documentation.BulkScoringGetFile),
	documentationHint(
		Operations.BulkScoringFileStatus,
		'Bulk A.I. Scoring: File Status',
		Documentation.BulkScoringFileStatus,
	),
	documentationHint(
		Operations.BulkScoringFileStatus,
		'Bulk A.I. Scoring: Delete File',
		Documentation.BulkScoringDeleteFile,
	),
];
