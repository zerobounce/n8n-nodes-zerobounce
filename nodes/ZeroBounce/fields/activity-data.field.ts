import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const ActivityData: INodeProperties = {
	displayName: 'Activity Data',
	name: Fields.ActivityData,
	type: 'boolean',
	default: false,
	noDataExpression: true,
	description: 'Whether Activity Data information will be appended to the validation result',
};
