import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const FileName: INodeProperties = {
	displayName: 'File Name',
	name: Fields.FileName,
	type: 'string',
	default: '',
	placeholder: 'e.g. n8n.csv',
	description: '(Optional) The name to use for the file',
};
