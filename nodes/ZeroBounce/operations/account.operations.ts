import { ApiEndpoint } from '../fields/api-endpoint.field';
import { StartDate } from '../fields/start-date.field';
import { EndDate } from '../fields/end-date.field';
import { addDisplayOptions, documentationHint } from '../utils/field.utils';
import { Documentation, Operations, Resources } from '../enums';
import { CreditsRequired } from '../fields/credits-required.field';
import { FilterRule } from '../fields/filter-rule.field';
import { FilterTarget } from '../fields/filter-target.field';
import { FilterValue } from '../fields/filter-value.field';
import { DelayNotice } from '../fields/delay-notice.field';
import { INodeProperties, NodeHint } from 'n8n-workflow';

const GetCreditsFields: INodeProperties[] = [
	// prettier-ignore
	ApiEndpoint,
	CreditsRequired,
].map(
	addDisplayOptions({
		resource: [Resources.Account],
		operation: [Operations.AccountGetCredits],
	}),
);

const GetApiUsageFields: INodeProperties[] = [
	// prettier-ignore
	ApiEndpoint,
	StartDate,
	EndDate,
].map(
	addDisplayOptions({
		resource: [Resources.Account],
		operation: [Operations.AccountGetApiUsage],
	}),
);

const ListFiltersFields: INodeProperties[] = [
	// prettier-ignore
	ApiEndpoint,
].map(
	addDisplayOptions({
		resource: [Resources.Account],
		operation: [Operations.AccountListFilters],
	}),
);

const AddOrDeleteFilterFields: INodeProperties[] = [
	DelayNotice,
	ApiEndpoint,
	FilterRule,
	FilterTarget,
	FilterValue,
].map(
	addDisplayOptions({
		resource: [Resources.Account],
		operation: [Operations.AccountAddFilter, Operations.AccountDeleteFilter],
	}),
);

export const AccountOperations: INodeProperties[] = [
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [Resources.Account],
			},
		},
		options: [
			{
				value: Operations.AccountGetCredits,
				name: 'Credits Balance',
				action: 'Get credits balance',
				description: 'Tells you how many credits you have left on your account',
			},
			{
				value: Operations.AccountGetApiUsage,
				name: 'API Usage',
				action: 'Get API usage',
				description: 'Retrieves a summary of your API usage',
			},
			{
				value: Operations.AccountListFilters,
				name: 'List Filters',
				action: 'List filters',
				description: 'Lists all the existing filter rules',
			},
			{
				value: Operations.AccountAddFilter,
				name: 'Add Filter',
				action: 'Add a filter',
				description: 'Adds or updates a filter rule',
			},
			{
				value: Operations.AccountDeleteFilter,
				name: 'Delete Filter',
				action: 'Delete a filter',
				description: 'Deletes a filter rule',
			},
		],
		default: Operations.AccountGetCredits,
	},
	...GetCreditsFields,
	...GetApiUsageFields,
	...ListFiltersFields,
	...AddOrDeleteFilterFields,
];

// prettier-ignore
export const AccountOperationHints: NodeHint[] = [
	documentationHint(Operations.AccountGetCredits, 'ZeroBounce Account: Get Credit Balance', Documentation.GetCreditsBalance),
	documentationHint(Operations.AccountGetApiUsage, 'ZeroBounce Account: Get API Usage', Documentation.GetApiUsage),
	documentationHint(Operations.AccountListFilters, 'ZeroBounce Account: Allowlist and Blocklist', Documentation.AllowlistAndBlocklist),
	documentationHint(Operations.AccountAddFilter, 'ZeroBounce Account: Allowlist and Blocklist', Documentation.AllowlistAndBlocklist),
	documentationHint(Operations.AccountDeleteFilter, 'ZeroBounce Account: Allowlist and Blocklist', Documentation.AllowlistAndBlocklist),
];
