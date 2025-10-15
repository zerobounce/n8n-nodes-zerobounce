// Email Batch Types
import { INodeProperties } from 'n8n-workflow';
import { Fields } from '../enums';

export enum FindByType {
	COMPANY_NAME = 'companyName',
	DOMAIN = 'domain',
}

// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
export const FindBy: INodeProperties = {
	displayName: 'Find By',
	name: Fields.FindBy,
	type: 'options',
	allowArbitraryValues: false,
	noDataExpression: true,
	description: 'Type of input used to populate the email_batch to validate',
	options: [
		{ name: 'Company Name', value: FindByType.COMPANY_NAME },
		{ name: 'Domain', value: FindByType.DOMAIN },
	],
	default: FindByType.COMPANY_NAME,
};
