import type { INodeProperties } from 'n8n-workflow';
import { Email } from './email.field';
import { IpAddress } from './ip-address.field';

import { Fields } from '../enums';

// Email Batch Types
export enum EmailBatchFieldType {
	ASSIGNMENT = 'assignment',
	JSON = 'json',
	MAPPED = 'mapped',
}

// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
export const EmailBatchType: INodeProperties = {
	displayName: 'Email Batch Type',
	name: Fields.EmailBatchType,
	type: 'options',
	allowArbitraryValues: false,
	noDataExpression: true,
	description: 'Type of input used to populate the email_batch to validate',
	options: [
		{ name: 'Field Assignment', value: EmailBatchFieldType.ASSIGNMENT },
		{ name: 'JSON Input', value: EmailBatchFieldType.JSON },
		{ name: 'Mapped', value: EmailBatchFieldType.MAPPED },
	],
	default: EmailBatchFieldType.ASSIGNMENT,
};

export const EmailBatchAssignment: INodeProperties = {
	displayName: 'Email Batch',
	name: Fields.EmailBatchAssignment,
	type: 'assignmentCollection',
	default: {
		email_batch: [{ email_address: 'valid@example.com' }],
	},
	displayOptions: {
		show: {
			[Fields.EmailBatchType]: [EmailBatchFieldType.ASSIGNMENT],
		},
	},
	description:
		'Array of emails (and optional IPs) to validate in batch. Expects the format [{"email_address": "..."}, {"email_address": "...", "ip_address": "..."}].',
};

export const EmailBatchJson: INodeProperties = {
	displayName: 'Email Batch',
	name: Fields.EmailBatchJson,
	type: 'json',
	default: '[\n  {"email_address": "valid@example.com", "ip_address": ""}\n]',
	displayOptions: {
		show: {
			[Fields.EmailBatchType]: [EmailBatchFieldType.JSON],
		},
	},
	description:
		'JSON array of emails (and optional IPs) to validate in batch. Expects the format [{"email_address": "..."}, {"email_address": "...", "ip_address": "..."}].',
};

export const EmailBatchMapped: INodeProperties = {
	displayName: 'Email Batch',
	name: Fields.EmailBatchMapped,
	type: 'fixedCollection',
	default: { emailBatch: [] },
	description: 'List of emails (and optional IPs) to validate in batch',
	typeOptions: {
		multipleValues: true,
		maxItems: 200,
	},
	displayOptions: {
		show: {
			[Fields.EmailBatchType]: [EmailBatchFieldType.MAPPED],
		},
	},
	options: [
		{
			displayName: 'Email Batch',
			name: 'emailBatch',
			values: [
				{ ...Email, name: 'email_address' },
				{ ...IpAddress, name: 'ip_address' },
			],
		},
	],
};
