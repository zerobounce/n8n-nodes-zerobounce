import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export enum Rule {
	ALLOW = 'allow',
	BLOCK = 'block',
}

// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
export const FilterRule: INodeProperties = {
	displayName: 'Rule',
	name: Fields.FilterRule,
	type: 'options',
	required: true,
	description: 'Choose which action the filter should take',
	options: [
		{
			name: 'Allow',
			value: Rule.ALLOW,
		},
		{
			name: 'Block',
			value: Rule.BLOCK,
		},
	],
	default: Rule.ALLOW,
};
