import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const CompanyName: INodeProperties = {
	displayName: 'Company Name',
	name: Fields.CompanyName,
	type: 'string',
	required: true,
	default: '',
	placeholder: 'Example Company LLC',
	description: 'The company name for which to find the email format',
};