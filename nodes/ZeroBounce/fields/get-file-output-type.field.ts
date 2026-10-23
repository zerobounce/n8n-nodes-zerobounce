import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

// Input Selection Types
export enum GetFileOutputFieldType {
	FILE = 'file',
	FIELDS = 'fields',
}

export const GetFileOutputType: INodeProperties = {
	displayName: 'Output Type',
	name: Fields.GetFileOutputType,
	type: 'options',
	allowArbitraryValues: false,
	noDataExpression: true,
	description: 'Type of output for the retrieved file. As a file, or fields.',
	options: [
		{ name: 'File', value: GetFileOutputFieldType.FILE },
		{ name: 'Fields', value: GetFileOutputFieldType.FIELDS },
	],
	default: `${GetFileOutputFieldType.FILE}`,
};
