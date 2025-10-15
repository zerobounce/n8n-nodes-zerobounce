import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const EmailColumnNumber: INodeProperties = {
	displayName: 'Email Address Column Number',
	name: Fields.EmailColumnNumber,
	type: 'number',
	default: 1,
	placeholder: '1',
	required: true,
	typeOptions: {
		minValue: 1,
		maxValue: 99,
	},
	description:
		'The column number position of the email address in the file (1..n)',
};