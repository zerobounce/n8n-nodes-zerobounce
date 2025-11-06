import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const DomainColumnNumber: INodeProperties = {
	displayName: 'Domain Column Number',
	name: Fields.DomainColumnNumber,
	type: 'number',
	default: 1,
	placeholder: '1',
	required: true,
	typeOptions: {
		minValue: 1,
		maxValue: 99,
	},
	description: 'The column number position of the domain in the file (1..n)',
};
