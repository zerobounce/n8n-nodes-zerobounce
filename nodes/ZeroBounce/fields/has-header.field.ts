import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const HasHeader: INodeProperties = {
	displayName: 'Has Header',
	name: Fields.HasHeader,
	type: 'boolean',
	default: true,
	required: true,
	noDataExpression: true,
	description: 'Whether the file has a header row or not',
};
