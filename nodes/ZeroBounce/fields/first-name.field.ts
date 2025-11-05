import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const FirstName: INodeProperties = {
	displayName: 'First Name',
	name: Fields.FirstName,
	type: 'string',
	default: '',
	description: '(Optional) The first name of the person whose email format is being searched',
};
