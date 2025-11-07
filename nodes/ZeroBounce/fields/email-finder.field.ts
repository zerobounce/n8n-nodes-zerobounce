import type { INodeProperties } from 'n8n-workflow';
import { Fields } from '../enums';

export enum FindByType {
	DOMAIN = 'domain',
	COMPANY_NAME = 'companyName',
}

// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
export const FindBy: INodeProperties = {
	displayName: 'Find By',
	name: Fields.FindBy,
	type: 'options',
	allowArbitraryValues: false,
	noDataExpression: true,
	description: 'Type of search to perform to find the email format',
	options: [
		{ name: 'Domain', value: FindByType.DOMAIN },
		{ name: 'Company Name', value: FindByType.COMPANY_NAME },
	],
	default: FindByType.DOMAIN,
};

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

export const FirstNameColumnNumber: INodeProperties = {
	displayName: 'First Name Column Number',
	name: Fields.EmailFinderColumnsFirstName,
	type: 'number',
	default: 2,
	placeholder: '2',
	required: true,
	typeOptions: {
		minValue: 1,
		maxValue: 99,
	},
	description: 'The column number position of the first name in the file (1..n)',
	displayOptions: {
		show: {
			[NameType.name]: [NameTypeOptions.PARTIAL],
		},
	},
};

export const LastNameColumnNumber: INodeProperties = {
	displayName: 'Last Name Column Number',
	name: Fields.EmailFinderColumnsLastName,
	type: 'number',
	default: null,
	placeholder: '3',
	typeOptions: {
		minValue: 1,
		maxValue: 99,
	},
	description: 'The column number position of the last name in the file (1..n)',
	displayOptions: {
		show: {
			[NameType.name]: [NameTypeOptions.PARTIAL],
		},
	},
};

export const MiddleNameColumnNumber: INodeProperties = {
	displayName: 'Middle Name Column Number',
	name: Fields.EmailFinderColumnsMiddleName,
	type: 'number',
	default: null,
	placeholder: '4',
	typeOptions: {
		minValue: 1,
		maxValue: 99,
	},
	description: 'The column number position of the middle name in the file (1..n)',
	displayOptions: {
		show: {
			[NameType.name]: [NameTypeOptions.PARTIAL],
		},
	},
};

export const FullNameColumnNumber: INodeProperties = {
	displayName: 'Full Name Column Number',
	name: Fields.EmailFinderColumnsFullName,
	type: 'number',
	default: 2,
	placeholder: '2',
	required: true,
	typeOptions: {
		minValue: 1,
		maxValue: 99,
	},
	description: 'The column number position of the full name in the file (1..n)',
	displayOptions: {
		show: {
			[NameType.name]: [NameTypeOptions.FULL],
		},
	},
};
