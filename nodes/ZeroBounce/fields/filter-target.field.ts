import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export enum Target {
	EMAIL = 'email',
	DOMAIN = 'domain',
	MX = 'mx',
	TLD = 'tld',
}

// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
export const FilterTarget: INodeProperties = {
	displayName: 'Target',
	name: Fields.FilterTarget,
	type: 'options',
	required: true,
	description: 'Choose which target the filter is set for',
	options: [
		{
			name: 'Email',
			value: Target.EMAIL,
		},
		{
			name: 'Domain',
			value: Target.DOMAIN,
		},
		{
			name: 'MX',
			value: Target.MX,
		},
		{
			name: 'TLD',
			value: Target.TLD,
		},
	],
	default: Target.EMAIL,
};
