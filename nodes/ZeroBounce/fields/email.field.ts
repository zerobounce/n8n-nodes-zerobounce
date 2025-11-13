import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const Email: INodeProperties = {
	displayName: 'Email',
	name: Fields.Email,
	type: 'string',
	required: true,
	default: '',
	placeholder: 'e.g. name@email.com',
	description: 'The email address you want to validate',
};
