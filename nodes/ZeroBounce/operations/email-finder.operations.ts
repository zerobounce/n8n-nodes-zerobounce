import { ApiEndpoint } from '../fields/api-endpoint.field';
import { addDisplayOptions, combineItemsHint, documentationHint, multipleInputItemsHint } from '../utils/field.utils';
import { Documentation, Fields, Operations, Resources } from '../enums';
import { INodeProperties, NodeHint } from 'n8n-workflow';
import { Domain } from '../fields/domain.field';
import { CompanyName } from '../fields/company-name.field';
import { FirstName } from '../fields/first-name.field';
import { MiddleName } from '../fields/middle-name.field';
import { LastName } from '../fields/last-name.field';
import { FileName } from '../fields/file-name.field';
import { SendFileInputFieldType, SendFileInputType } from '../fields/send-file-input-type.field';
import { BinaryKey } from '../fields/binary-key.field';
import { HasHeader } from '../fields/has-header.field';
import { CombineItems } from '../fields/combine-items.field';
import { FileId } from '../fields/file-id.field';
import { GetFileOutputFieldType, GetFileOutputType } from '../fields/get-file-output-type.field';
import { Batch } from '../fields/batch.field';
import { DomainColumnNumber } from '../fields/domain-column.field';
import { ItemInputAssignment, ItemInputJson, ItemInputMapped, ItemInputType } from '../fields/item-input.field';
import { FullName } from '../fields/full-name.field';
import {
	FindBy,
	FindByType,
	FirstNameColumnNumber,
	FullNameColumnNumber,
	LastNameColumnNumber,
	MiddleNameColumnNumber,
	NameType,
	NameTypeOptions,
} from '../fields/email-finder.field';

const FindFields: INodeProperties[] = [
	ApiEndpoint,
	FindBy,
	...[Domain].map(addDisplayOptions({ [FindBy.name]: [FindByType.DOMAIN] })),
	...[CompanyName].map(addDisplayOptions({ [FindBy.name]: [FindByType.COMPANY_NAME] })),
	FirstName,
	MiddleName,
	LastName,
].map(
	addDisplayOptions({
		resource: [Resources.EmailFinder],
		operation: [Operations.EmailFinderFind],
	}),
);

const BinaryFileFields: INodeProperties[] = [
	// prettier-ignore
	BinaryKey,
	HasHeader,
	NameType,
	DomainColumnNumber,
	FirstNameColumnNumber,
	LastNameColumnNumber,
	MiddleNameColumnNumber,
	FullNameColumnNumber,
];

const PartialNameFields: INodeProperties[] = [
	{
		...ItemInputJson,
		default: '[\n  {"domain": "example.com", "first_name": "First"}\n]',
		description: 'JSON containing one or more domains or email finder objects',
	},
	{
		...ItemInputMapped,
		description: 'List of domains and first name (and optional additional columns)',
		options: [
			{
				displayName: 'Mapped Values',
				name: 'mappedValues',
				values: [
					{
						...Domain,
						name: 'domain',
						required: true,
						description: 'The email domain for which to find the email format',
					},
					{
						...FirstName,
						name: 'first_name',
						required: true,
						description: 'The first name of the person whose email format is being searched.',
					},
					{
						...LastName,
						name: 'last_name',
						description: 'The last name of the person whose email format is being searched.',
					},
					{
						...MiddleName,
						name: 'middle_name',
						description: 'The middle name of the person whose email format is being searched.',
					},
				],
			},
		],
	},
].map(addDisplayOptions({ [NameType.name]: [NameTypeOptions.PARTIAL] }));

const FullNameFields: INodeProperties[] = [
	{
		...ItemInputJson,
		default: '[\n  {"domain": "example.com", "full_name": "First Last"}\n]',
		description: 'JSON containing one or more email finder objects',
	},
	{
		...ItemInputMapped,
		description: 'List of domains and full name',
		options: [
			{
				displayName: 'Mapped Values',
				name: 'mappedValues',
				values: [
					{
						...Domain,
						name: 'domain',
						required: true,
						description: 'The email domain for which to find the email format',
					},
					{
						...FullName,
						name: 'full_name',
						required: true,
						description: 'The full name of the person whose email format is being searched.',
					},
				],
			},
		],
	},
].map(addDisplayOptions({ [NameType.name]: [NameTypeOptions.FULL] }));

const ItemInputFields: INodeProperties[] = [
	CombineItems,
	NameType,
	ItemInputType,
	{
		...ItemInputAssignment,
		description: 'Email finder object(s)',
	},
	...PartialNameFields,
	...FullNameFields,
];

const SendFileFields: INodeProperties[] = [
	{
		...FileName,
		placeholder: 'n8n_email_finder.csv',
	},
	SendFileInputType,
	...BinaryFileFields.map(addDisplayOptions({ [Fields.SendFileInputType]: [SendFileInputFieldType.FILE] })),
	...ItemInputFields.map(addDisplayOptions({ [Fields.SendFileInputType]: [SendFileInputFieldType.ITEMS] })),
].map(
	addDisplayOptions({
		resource: [Resources.EmailFinder],
		operation: [Operations.BulkEmailFinderSendFile],
	}),
);

const GetFileFields: INodeProperties[] = [
	{
		...FileId,
		default: '={{ $json.body.file_id }}',
	},
	{
		...FileName,
		placeholder: 'n8n_email_finder_results.csv',
	},
	GetFileOutputType,
	...[Batch].map(addDisplayOptions({ [Fields.GetFileOutputType]: [GetFileOutputFieldType.FIELDS] })),
].map(
	addDisplayOptions({
		resource: [Resources.EmailFinder],
		operation: [Operations.BulkEmailFinderGetFile],
	}),
);

const FileStatusFields: INodeProperties[] = [
	// prettier-ignore
	FileId,
].map(
	addDisplayOptions({
		resource: [Resources.EmailFinder],
		operation: [Operations.BulkEmailFinderFileStatus],
	}),
);

const DeleteFileFields: INodeProperties[] = [
	// prettier-ignore
	FileId,
].map(
	addDisplayOptions({
		resource: [Resources.EmailFinder],
		operation: [Operations.BulkEmailFinderDeleteFile],
	}),
);

export const EmailFinderOperations: INodeProperties[] = [
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [Resources.EmailFinder],
			},
		},
		options: [
			{
				value: Operations.EmailFinderFind,
				name: 'Find Email Address',
				action: 'Find email address',
				description:
					'Uses a person’s first and last name and a domain or company name to test a variety of patterns and combinations in real time until it identifies a valid business email. It does not use or process customer data at any point to aid in this search. ' +
					'Privacy and Security Note – Email Finder API searches are performed in real time and do not use stored or processed customer data. Customer privacy and security are and will always remain our top priority.',
			},
			{
				value: Operations.BulkEmailFinderSendFile,
				name: 'Bulk Email Finder Send File',
				action: 'Send email finder file',
				description: 'Send a file to ZeroBounce for bulk email finding',
			},
			{
				value: Operations.BulkEmailFinderGetFile,
				name: 'Bulk Email Finder Get File',
				action: 'Get email finder results file',
				description: 'Get the results file for a submitted email finder file',
			},
			{
				value: Operations.BulkEmailFinderFileStatus,
				name: 'Bulk Email Finder File Status',
				action: 'Get email finder file status',
				description: 'Get the status of a submitted email finder file',
			},
			{
				value: Operations.BulkEmailFinderDeleteFile,
				name: 'Bulk Email Finder Delete File',
				action: 'Delete email finder file',
				description: 'Delete a previously submitted email finder file',
			},
		],
		default: Operations.EmailFinderFind,
	},
	...FindFields,
	...SendFileFields,
	...GetFileFields,
	...FileStatusFields,
	...DeleteFileFields,
];

// prettier-ignore
export const EmailFinderOperationHints: NodeHint[] = [
	multipleInputItemsHint(Operations.BulkEmailFinderSendFile),
	combineItemsHint(Operations.BulkEmailFinderSendFile),
	documentationHint(Operations.EmailFinderFind, 'Email Finder', Documentation.EmailFinderFind),
	documentationHint(Operations.BulkEmailFinderSendFile, 'Bulk Email Finder: Send File', Documentation.BulkEmailFinderSendFile),
	documentationHint(Operations.BulkEmailFinderGetFile, 'Bulk Email Finder: Get File', Documentation.BulkEmailFinderGetFile),
	documentationHint(Operations.BulkEmailFinderFileStatus, 'Bulk Email Finder: File Status',Documentation.BulkEmailFinderFileStatus),
	documentationHint(Operations.BulkEmailFinderDeleteFile, 'Bulk Email Finder: Delete File', Documentation.BulkEmailFinderDeleteFile),
];
