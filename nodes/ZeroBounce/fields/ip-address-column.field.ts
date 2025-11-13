import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const IpAddressColumnNumber: INodeProperties = {
	displayName: 'IP Address Column Number',
	name: Fields.IpAddressColumnNumber,
	type: 'number',
	default: null,
	placeholder: 'e.g. 2',
	typeOptions: {
		minValue: 1,
		maxValue: 99,
	},
	description: 'The column number position of the email address in the file (1..n)',
};
