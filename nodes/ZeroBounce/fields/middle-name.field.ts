import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const MiddleName: INodeProperties = {
	displayName: 'Middle Name',
	name: Fields.MiddleName,
	type: 'string',
	default: '',
	description: '(Optional) The middle name of the person whose email format is being searched',
};