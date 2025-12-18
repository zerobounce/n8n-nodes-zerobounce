import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const AddOptions: INodeProperties = {
	displayName: 'Add Options',
	name: Fields.AddOptions,
	type: 'collection',
	default: {},
	placeholder: 'Add option',
	options: [],
};
