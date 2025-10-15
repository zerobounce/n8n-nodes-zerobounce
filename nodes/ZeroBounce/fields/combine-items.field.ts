import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const CombineItems: INodeProperties = {
	displayName: 'Combine Items',
	name: Fields.CombineItems,
	type: 'boolean',
	default: true,
	placeholder: 'true',
	noDataExpression: true,
	description: 'Whether the input items are combined into a single file',
};
