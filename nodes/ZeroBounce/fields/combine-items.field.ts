import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const CombineItems: INodeProperties = {
	displayName: 'Combine Items',
	name: Fields.CombineItems,
	type: 'boolean',
	default: true,
	noDataExpression: true,
	description: 'Whether multiple input items are combined into a single item or handled separately',
};
