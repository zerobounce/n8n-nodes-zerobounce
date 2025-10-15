import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const StartDate: INodeProperties = {
	displayName: 'Start Date',
	name: Fields.StartDate,
	type: 'dateTime',
	required: true,
	default: '={{$today}}',
	description: 'Only the date part will be used (time is ignored)',
};
