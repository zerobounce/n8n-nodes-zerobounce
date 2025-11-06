import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const FullName: INodeProperties = {
	displayName: 'Full Name',
	name: Fields.FullName,
	type: 'string',
	default: '',
	description: '(Optional) The full name of the person whose email format is being searched',
};
