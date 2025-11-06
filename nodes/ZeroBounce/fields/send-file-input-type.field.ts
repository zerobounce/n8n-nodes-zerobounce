import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

// Input Selection Types
export enum SendFileInputFieldType {
	FILE = 'file',
	ITEMS = 'items',
}

// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
export const SendFileInputType: INodeProperties = {
	displayName: 'Input Type',
	name: Fields.SendFileInputType,
	type: 'options',
	allowArbitraryValues: false,
	noDataExpression: true,
	description: 'Type of input for the file to send. An existing file, or input fields to create a new file.',
	options: [
		{
			name: 'File',
			value: SendFileInputFieldType.FILE,
			description: 'An existing binary/file',
		},
		{
			name: 'Items',
			value: SendFileInputFieldType.ITEMS,
			description: 'A new file constructed from input items',
		},
	],
	default: SendFileInputFieldType.FILE,
};
