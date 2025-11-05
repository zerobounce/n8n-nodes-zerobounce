import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const LastName: INodeProperties = {
	displayName: 'Last Name',
	name: Fields.LastName,
	type: 'string',
	default: '',
	description: '(Optional) The last name of the person whose email format is being searched',
};
