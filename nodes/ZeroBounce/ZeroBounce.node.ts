import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { AccountOperationHints, AccountOperations } from './operations/account.operations';
import { ValidationOperationHints, ValidationOperations } from './operations/validation.operations';
import { getHandler, IOperationHandler } from './utils/handler.utils';
import { Credentials, Resources } from './enums';
import { ScoringOperationHints, ScoringOperations } from './operations/scoring.operations';
import { EmailFinderOperationHints, EmailFinderOperations } from './operations/email-finder.operations';
import { DomainSearchOperationHints, DomainSearchOperations } from './operations/domain-search.operations';

export class ZeroBounce implements INodeType {
	readonly description: INodeTypeDescription = {
		displayName: 'ZeroBounce',
		name: 'zeroBounce',
		icon: {
			light: 'file:../../icons/zerobounce.svg',
			dark: 'file:../../icons/zerobounce.dark.svg',
		},
		group: ['transform', 'output'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Validate and verify emails using the ZeroBounce API.',
		codex: {
			categories: ['Data Validation', 'Email Verification'],
			subcategories: { 'Data Validation': ['Email'] },
		},
		documentationUrl: 'https://www.zerobounce.net/docs/',
		defaults: {
			name: 'ZeroBounce',
		},
		usableAsTool: true,
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: Credentials.ZeroBounceApi,
				required: true,
			},
		],
		requestDefaults: {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				required: true,
				noDataExpression: true,
				description: 'Choose the ZeroBounce API you wish to use',
				options: [
					{
						name: 'Account',
						value: Resources.Account,
						description: 'Retrieve details from your ZeroBounce account',
					},
					{
						name: 'Validation',
						value: Resources.Validation,
						description: 'Email validation',
					},
					{
						name: 'A.I. Scoring',
						value: Resources.Scoring,
						description: 'Email scoring',
					},
					{
						name: 'Email Finder',
						value: Resources.EmailFinder,
						description:
							'Email Finder allows you to search for new business email addresses using our proprietary technologies',
					},
					{
						name: 'Domain Search',
						value: Resources.DomainSearch,
						description:
							'Domain Search allows you to search for new business email formats using our proprietary technologies',
					},
				],
				default: Resources.Validation,
			},
			...AccountOperations,
			...ValidationOperations,
			...ScoringOperations,
			...EmailFinderOperations,
			...DomainSearchOperations,
		],
		hints: [
			...AccountOperationHints,
			...ValidationOperationHints,
			...ScoringOperationHints,
			...EmailFinderOperationHints,
			...DomainSearchOperationHints,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const handlers = new Map<string, IOperationHandler>();
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i);
			const operation = this.getNodeParameter('operation', i);
			const operationHandler = getHandler(handlers, resource);

			const responseData = await operationHandler.handle(this, operation, i);

			returnData.push(...responseData);
		}

		return [returnData];
	}
}
