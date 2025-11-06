import { INodeProperties, NodeHint } from 'n8n-workflow';
import { Email } from '../fields/email.field';
import { addDisplayOptions, combineItemsHint, documentationHint, multipleInputItemsHint } from '../utils/field.utils';
import { Documentation, Fields, Operations, Resources } from '../enums';
import { ApiEndpoint } from '../fields/api-endpoint.field';
import { CombineItems } from '../fields/combine-items.field';
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
import { ItemInputAssignment, ItemInputJson, ItemInputMapped, ItemInputType } from '../fields/item-input.field';

const ScoreFields: INodeProperties[] = [
	// prettier-ignore
	ApiEndpoint,
	Email,
].map(
	addDisplayOptions({
		resource: [Resources.Scoring],
		operation: [Operations.ScoringScore],
	}),
);

const ItemInputFields: INodeProperties[] = [
	CombineItems,
	ItemInputType,
	{
		...ItemInputAssignment,
		description: 'Email(s) or email object(s) to score',
	},
	{
		...ItemInputJson,
		default: '[\n  {"email_address": "valid@example.com"},\n  {"email_address": "invalid@example.com"}\n]',
		description: 'JSON containing one or more email or email objects to score',
	},
	{
		...ItemInputMapped,
		description: 'List of emails to score',
		options: [
			{
				displayName: 'Mapped Values',
				name: 'mappedValues',
				values: [{ ...Email, name: 'email_address' }],
			},
		],
	},
];

const BinaryFileFields: INodeProperties[] = [
	// prettier-ignore
	BinaryKey,
	HasHeader,
	EmailColumnNumber,
];

const SendFileFields: INodeProperties[] = [
	FileName,
	RemoveDuplicates,
	ReturnUrl,
	SendFileInputType,
	...BinaryFileFields.map(addDisplayOptions({ [Fields.SendFileInputType]: [SendFileInputFieldType.FILE] })),
	...ItemInputFields.map(addDisplayOptions({ [Fields.SendFileInputType]: [SendFileInputFieldType.ITEMS] })),
].map(
	addDisplayOptions({
		resource: [Resources.Scoring],
		operation: [Operations.BulkScoringSendFile],
	}),
);

const GetFileFields: INodeProperties[] = [
	{
		...FileId,
		default: '={{ $json.body.file_id }}',
	},
	FileName,
	GetFileOutputType,
	...[Batch].map(addDisplayOptions({ [Fields.GetFileOutputType]: [GetFileOutputFieldType.FIELDS] })),
].map(
	addDisplayOptions({
		resource: [Resources.Scoring],
		operation: [Operations.BulkScoringGetFile],
	}),
);

const FileStatusFields: INodeProperties[] = [
	// prettier-ignore
	FileId,
].map(
	addDisplayOptions({
		resource: [Resources.Scoring],
		operation: [Operations.BulkScoringFileStatus],
	}),
);

const DeleteFileFields: INodeProperties[] = [
	// prettier-ignore
	FileId,
].map(
	addDisplayOptions({
		resource: [Resources.Scoring],
		operation: [Operations.BulkScoringDeleteFile],
	}),
);

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

// prettier-ignore
export const ScoringOperationHints: NodeHint[] = [
	multipleInputItemsHint(Operations.BulkScoringSendFile),
	combineItemsHint(Operations.BulkScoringSendFile),
	documentationHint(Operations.ScoringScore, 'A.I. Scoring: Single Email Scoring', Documentation.ScoringScore),
	documentationHint(Operations.BulkScoringSendFile, 'Bulk A.I. Scoring: Send File', Documentation.BulkScoringSendFile),
	documentationHint(Operations.BulkScoringGetFile, 'Bulk A.I. Scoring: Get File', Documentation.BulkScoringGetFile),
	documentationHint(Operations.BulkScoringFileStatus, 'Bulk A.I. Scoring: File Status', Documentation.BulkScoringFileStatus),
	documentationHint(Operations.BulkScoringFileStatus, 'Bulk A.I. Scoring: Delete File', Documentation.BulkScoringDeleteFile),
];
