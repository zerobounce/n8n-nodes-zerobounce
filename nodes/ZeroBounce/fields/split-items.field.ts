import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const SplitItems: INodeProperties = {
	displayName: 'Split Items',
	name: Fields.SplitItems,
	type: 'boolean',
	default: true,
	noDataExpression: true,
	description: 'Whether the results are returned as multiple items or a single item batch',
};
