import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const CreditsRequired: INodeProperties = {
	displayName: 'Credits Required',
	name: Fields.CreditsRequired,
	type: 'number',
	default: undefined,
	description: 'Number of credits to check the account has as a minimum',
	hint: '(Optional) Checks there are enough credits for this run. Returns an error if there are fewer credits on the account than required.',
};