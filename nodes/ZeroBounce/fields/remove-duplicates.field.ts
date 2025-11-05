import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const RemoveDuplicates: INodeProperties = {
	displayName: 'Remove Duplicates',
	name: Fields.RemoveDuplicates,
	type: 'boolean',
	default: true,
	required: true,
	placeholder: 'false',
	noDataExpression: true,
	description:
		'Whether you want the system to remove duplicate emails (true or false, default is true). Please note that if we remove more than 50% of the lines because of duplicates (parameter is true), system will return a 400 bad request error as a safety net to let you know that more than 50% of the file has been modified.',
};
