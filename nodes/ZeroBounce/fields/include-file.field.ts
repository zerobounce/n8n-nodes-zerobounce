import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const IncludeFile: INodeProperties = {
	displayName: 'Include File In Output',
	name: Fields.IncludeFile,
	type: 'boolean',
	default: false,
	noDataExpression: true,
	description: 'Whether the file is included in the output as binary',
};
