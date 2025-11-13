import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const Batch: INodeProperties = {
	displayName: 'Batch',
	name: Fields.Batch,
	type: 'boolean',
	default: true,
	noDataExpression: true,
	description: 'Whether the results are returned as a single item batch or multiple items',
};
