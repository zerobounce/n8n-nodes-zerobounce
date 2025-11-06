// Email Batch Types
import { INodeProperties } from 'n8n-workflow';
import { Fields } from '../enums';

export enum NameTypeOptions {
	PARTIAL = 'partial',
	FULL = 'full',
}

// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
export const NameType: INodeProperties = {
	displayName: 'Name Type',
	name: Fields.NameType,
	type: 'options',
	allowArbitraryValues: false,
	noDataExpression: true,
	description: 'Type of name to use to find the email format',
	options: [
		{ name: 'Partial', value: NameTypeOptions.PARTIAL },
		{ name: 'Full', value: NameTypeOptions.FULL },
	],
	default: NameTypeOptions.PARTIAL,
};
