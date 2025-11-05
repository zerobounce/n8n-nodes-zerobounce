import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const Timeout: INodeProperties = {
	displayName: 'Timeout (Seconds)',
	name: Fields.Timeout,
	type: 'number',
	default: null,
	placeholder: '10',
	description:
		'The duration (3 - 60 seconds) allowed for the validation. If exceeded, the API will return unknown / greylisted. Leave empty if not required.',
};