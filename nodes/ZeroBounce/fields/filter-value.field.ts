import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const FilterValue: INodeProperties = {
	displayName: 'Value',
	name: Fields.FilterValue,
	type: 'string',
	required: true,
	default: '',
	placeholder: 'e.g. test@example.com',
	description: 'The email address, email domain, mx record or tld you wish to filter, based on the selected target',
};
