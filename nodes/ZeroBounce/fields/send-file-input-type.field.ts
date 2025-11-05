import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

// Input Selection Types
export enum SendFileInputFieldType {
	FILE = 'file',
	EMAIL_BATCH = 'emailBatch',
}

// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
export const SendFileInputType: INodeProperties = {
	displayName: 'Input Type',
	name: Fields.SendFileInputType,
	type: 'options',
	allowArbitraryValues: false,
	noDataExpression: true,
	description:
		'Type of input for the file to send. An existing file, or email batch fields to use to create a new file.',
	options: [
		{ name: 'File', value: SendFileInputFieldType.FILE },
		{ name: 'Email Batch', value: SendFileInputFieldType.EMAIL_BATCH },
	],
	default: SendFileInputFieldType.FILE,
};
