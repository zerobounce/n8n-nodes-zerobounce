import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const VerifyPlus: INodeProperties = {
	displayName: 'Verify+',
	name: Fields.VerifyPlus,
	type: 'boolean',
	default: false,
	noDataExpression: true,
	description:
		'Whether Verify+ validation method will be used to get the validation result. It overrides the account settings made regarding Verify+.',
};
