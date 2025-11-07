import { ApiEndpoint } from '../fields/api-endpoint.field';
import { addDisplayOptions, combineItemsHint, documentationHint, multipleInputItemsHint } from '../utils/field.utils';
import { Documentation, Fields, Operations, Resources } from '../enums';
import { INodeProperties, NodeHint } from 'n8n-workflow';
import { Domain } from '../fields/domain.field';
import { CompanyName } from '../fields/company-name.field';
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
import { FindBy, FindByType } from '../fields/email-finder.field';

const FindFields: INodeProperties[] = [
	ApiEndpoint,
	FindBy,
	...[Domain].map(addDisplayOptions({ [FindBy.name]: [FindByType.DOMAIN] })),
	...[CompanyName].map(addDisplayOptions({ [FindBy.name]: [FindByType.COMPANY_NAME] })),
].map(
	addDisplayOptions({
		resource: [Resources.DomainSearch],
		operation: [Operations.DomainSearch],
	}),
);

const BinaryFileFields: INodeProperties[] = [
	// prettier-ignore
	BinaryKey,
	HasHeader,
	DomainColumnNumber,
];

const ItemInputFields: INodeProperties[] = [
	CombineItems,
	ItemInputType,
	{
		...ItemInputAssignment,
		description: 'Domain search object(s)',
	},
	{
		...ItemInputJson,
		default: '[\n  {"domain": "example.com"}\n]',
		description: 'JSON containing one or more domains',
	},
	{
		...ItemInputMapped,
		description: 'List of domains',
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
				],
			},
		],
	},
];

const SendFileFields: INodeProperties[] = [
	{
		...FileName,
		placeholder: 'n8n_domain_search.csv',
	},
	SendFileInputType,
	...BinaryFileFields.map(addDisplayOptions({ [Fields.SendFileInputType]: [SendFileInputFieldType.FILE] })),
	...ItemInputFields.map(addDisplayOptions({ [Fields.SendFileInputType]: [SendFileInputFieldType.ITEMS] })),
].map(
	addDisplayOptions({
		resource: [Resources.DomainSearch],
		operation: [Operations.BulkDomainSearchSendFile],
	}),
);

const GetFileFields: INodeProperties[] = [
	FileId,
	{
		...FileName,
		placeholder: 'n8n_domain_search_results.csv',
	},
	GetFileOutputType,
	...[Batch].map(addDisplayOptions({ [Fields.GetFileOutputType]: [GetFileOutputFieldType.FIELDS] })),
].map(
	addDisplayOptions({
		resource: [Resources.DomainSearch],
		operation: [Operations.BulkDomainSearchGetFile],
	}),
);

const FileStatusFields: INodeProperties[] = [
	// prettier-ignore
	FileId,
].map(
	addDisplayOptions({
		resource: [Resources.DomainSearch],
		operation: [Operations.BulkDomainSearchFileStatus],
	}),
);

const DeleteFileFields: INodeProperties[] = [
	// prettier-ignore
	FileId,
].map(
	addDisplayOptions({
		resource: [Resources.DomainSearch],
		operation: [Operations.BulkDomainSearchDeleteFile],
	}),
);

export const DomainSearchOperations: INodeProperties[] = [
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [Resources.DomainSearch],
			},
		},
		options: [
			{
				value: Operations.DomainSearch,
				name: 'Search Domain',
				action: 'Search domain',
				description:
					'Domain search is functionally similar to email address inquiry but instead attempts to detect possible patterns a specific company uses. ' +
					'You can use detected patterns to help you approximate the correct email for a specific person you’re attempting to contact at a business. ' +
					'Privacy and security note – Domain Search API searches are performed in real time and do not use stored or processed customer data. Customer privacy and security are and will always remain our top priority.',
			},
			{
				value: Operations.BulkDomainSearchSendFile,
				name: 'Bulk Domain Search Send File',
				action: 'Send domain search file',
				description: 'Send a file to ZeroBounce for bulk domain searching',
			},
			{
				value: Operations.BulkDomainSearchGetFile,
				name: 'Bulk Domain Search Get File',
				action: 'Get domain search results file',
				description: 'Get the results file for a submitted domain search file',
			},
			{
				value: Operations.BulkDomainSearchFileStatus,
				name: 'Bulk Domain Search File Status',
				action: 'Get domain search file status',
				description: 'Get the status of a submitted domain search file',
			},
			{
				value: Operations.BulkDomainSearchDeleteFile,
				name: 'Bulk Domain Search Delete File',
				action: 'Delete domain search file',
				description: 'Delete a previously submitted domain search file',
			},
		],
		default: Operations.DomainSearch,
	},
	...FindFields,
	...SendFileFields,
	...GetFileFields,
	...FileStatusFields,
	...DeleteFileFields,
];

// prettier-ignore
export const DomainSearchOperationHints: NodeHint[] = [
	multipleInputItemsHint(Operations.BulkDomainSearchSendFile),
	combineItemsHint(Operations.BulkDomainSearchSendFile),
	documentationHint(Operations.DomainSearch, 'Domain Search', Documentation.DomainSearch),
	documentationHint(Operations.BulkDomainSearchSendFile, 'Bulk Domain Search: Send File', Documentation.BulkDomainSearchSendFile),
	documentationHint(Operations.BulkDomainSearchGetFile, 'Bulk Domain Search: Get File', Documentation.BulkDomainSearchGetFile),
	documentationHint(Operations.BulkDomainSearchFileStatus, 'Bulk Domain Search: File Status',Documentation.BulkDomainSearchFileStatus),
	documentationHint(Operations.BulkDomainSearchDeleteFile, 'Bulk Domain Search: Delete File', Documentation.BulkDomainSearchDeleteFile),
];
