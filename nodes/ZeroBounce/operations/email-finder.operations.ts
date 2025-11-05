import { ApiEndpoint } from '../fields/api-endpoint.field';
import { addDisplayOptions, documentationHint } from '../utils/field.utils';
import { Documentation, Operations, Resources } from '../enums';
import { INodeProperties, NodeHint } from 'n8n-workflow';
import { Domain } from '../fields/domain.field';
import { CompanyName } from '../fields/company-name.field';
import { FirstName } from '../fields/first-name.field';
import { MiddleName } from '../fields/middle-name.field';
import { LastName } from '../fields/last-name.field';
import { FindBy, FindByType } from '../fields/finder-type.field';

// prettier-ignore
const FindFields: INodeProperties[] = [
	ApiEndpoint,
	FindBy,
	...[CompanyName].map(addDisplayOptions({[FindBy.name]: [FindByType.COMPANY_NAME]})),
	...[Domain].map(addDisplayOptions({[FindBy.name]: [FindByType.DOMAIN]})),
	FirstName,
	MiddleName,
	LastName,
].map(addDisplayOptions({
	resource: [Resources.EmailFinder],
	operation: [Operations.EmailFinderFind],
}));

export const EmailFinderOperations: INodeProperties[] = [
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [Resources.EmailFinder],
			},
		},
		options: [
			{
				value: Operations.EmailFinderFind,
				name: 'Find Email Address',
				action: 'Find email address',
				description:
					'Uses a person’s first and last name and a domain or company name to test a variety of patterns and combinations in real time until it identifies a valid business email. It does not use or process customer data at any point to aid in this search. ' +
					'Privacy and Security Note – Email Finder API searches are performed in real time and do not use stored or processed customer data. Customer privacy and security are and will always remain our top priority.',
				hint: 'Test hint',
			},
		],
		default: Operations.EmailFinderFind,
	},
	...FindFields,
];

export const EmailFinderOperationHints: NodeHint[] = [
	documentationHint(Operations.EmailFinderFind, 'Email Finder', Documentation.EmailFinderFind),
];
