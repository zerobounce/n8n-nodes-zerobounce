import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const EndDate: INodeProperties = {
	displayName: 'End Date',
	name: Fields.EndDate,
	type: 'dateTime',
	required: true,
	default: '={{$today}}',
	description: 'Only the date part will be used (time is ignored)',
};
