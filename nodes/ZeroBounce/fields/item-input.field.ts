import { IDataObject, INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';
import { Email } from './email.field';

// Item Input Types
export enum ItemInputOptions {
	ASSIGNMENT = 'assignment',
	JSON = 'json',
	MAPPED = 'mapped',
}

// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
export const ItemInputType: INodeProperties = {
	displayName: 'Item Input Type',
	name: Fields.ItemInputType,
	type: 'options',
	allowArbitraryValues: false,
	noDataExpression: true,
	description: 'Type of input used to populate the request',
	options: [
		{
			name: 'Field Assignment',
			value: ItemInputOptions.ASSIGNMENT,
			description: 'Assign fields from input items. Useful when mapping arrays from input items.',
		},
		{
			name: 'JSON Input',
			value: ItemInputOptions.JSON,
			description: 'Enter JSON to parse as input',
		},
		{
			name: 'Mapped',
			value: ItemInputOptions.MAPPED,
			description: "Map fields from input items. Useful when 'Combine Items' is enabled.",
		},
	],
	default: ItemInputOptions.ASSIGNMENT,
};

export const ItemInputAssignment: INodeProperties = {
	displayName: 'Item Input',
	name: Fields.ItemInputAssignment,
	type: 'assignmentCollection',
	default: {},
	displayOptions: {
		show: {
			[Fields.ItemInputType]: [ItemInputOptions.ASSIGNMENT],
		},
	},
};

export const ItemInputJson: INodeProperties = {
	displayName: 'Item Input',
	name: Fields.ItemInputJson,
	type: 'json',
	default: '',
	displayOptions: {
		show: {
			[Fields.ItemInputType]: [ItemInputOptions.JSON],
		},
	},
};

export interface IMappedValues {
	mappedValues: IDataObject[];
}

export const ItemInputMapped: INodeProperties = {
	displayName: 'Item Input',
	name: Fields.ItemInputMapped,
	type: 'fixedCollection',
	default: {},
	typeOptions: {
		multipleValues: true,
	},
	displayOptions: {
		show: {
			[Fields.ItemInputType]: [ItemInputOptions.MAPPED],
		},
	},
	options: [
		{
			displayName: 'Mapped Values',
			name: 'mappedValues',
			values: [{ ...Email, name: 'email_address' }],
		},
	],
};
