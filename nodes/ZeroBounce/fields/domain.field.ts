import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const Domain: INodeProperties = {
	displayName: 'Domain',
	name: Fields.Domain,
	type: 'string',
	required: true,
	default: '',
	placeholder: 'e.g. example.com',
	description: 'The email domain for which to find the email format',
};
