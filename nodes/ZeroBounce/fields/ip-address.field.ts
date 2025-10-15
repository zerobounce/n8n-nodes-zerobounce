import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const IpAddress: INodeProperties = {
	displayName: 'IP Address',
	name: Fields.IpAddress,
	type: 'string',
	default: '',
	placeholder: '99.110.204.1',
	description: 'The IP Address the email signed up from. Leave empty if not required.',
};