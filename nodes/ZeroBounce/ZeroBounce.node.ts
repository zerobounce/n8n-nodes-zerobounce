import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';
import { AccountOperationHints, AccountOperations } from './operations/account.operations';
import { ValidationOperationHints, ValidationOperations } from './operations/validation.operations';
import { getHandler, IOperationHandler } from './utils/handler.utils';
import { Credentials, Resources } from './enums';
import { ScoringOperationHints, ScoringOperations } from './operations/scoring.operations';
import { EmailFinderOperationHints, EmailFinderOperations } from './operations/email-finder.operations';
import { DomainSearchOperationHints, DomainSearchOperations } from './operations/domain-search.operations';
import { ActivityDataOperationHints, ActivityDataOperations } from './operations/activity-data.operations';

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
		defaults: {
			name: 'ZeroBounce',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		documentationUrl: 'https://www.zerobounce.net/docs/',
		credentials: [
			{
				name: Credentials.ZeroBounceApi,
				required: true,
			},
		],
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
					{
						name: 'Activity Data',
						value: Resources.ActivityData,
						description: 'Activity Data allows you to gather insights into your subscribers’ overall email engagement',
					},
				],
				default: Resources.Validation,
			},
			...AccountOperations,
			...ValidationOperations,
			...ScoringOperations,
			...EmailFinderOperations,
			...DomainSearchOperations,
			...ActivityDataOperations,
		],
		hints: [
			...AccountOperationHints,
			...ValidationOperationHints,
			...ScoringOperationHints,
			...EmailFinderOperationHints,
			...DomainSearchOperationHints,
			...ActivityDataOperationHints,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const handlers = new Map<string, IOperationHandler>();
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex);
				const operation = this.getNodeParameter('operation', itemIndex);
				const operationHandler = getHandler(this, itemIndex, handlers, resource);

				const responseData = await operationHandler.handle(this, operation, itemIndex);

				returnData.push(...responseData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: error, error, pairedItem: itemIndex });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, { itemIndex });
				}
			}
		}

		return [returnData];
	}
}
