import { IDataObject, IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { IErrorResponse, IOperationHandler, isErrorResponse } from '../utils/handler.utils';
import { BaseUrl, Endpoint, Operations } from '../enums';
import { IRequestParams, zbGetRequest } from '../utils/request.utils';
import { Email } from '../fields/email.field';
import { ApiEndpoint } from '../fields/api-endpoint.field';

interface IGetActivityDataRequest extends IRequestParams {
	email: string;
}

interface IGetActivityDataResponse extends IDataObject {
	found: boolean;
	active_in_days?: string; //	The last activity date that is less than [30/60/90/180/365/365+]
}

async function getActivityData(context: IExecuteFunctions, itemIndex: number) {
	const baseUrl = context.getNodeParameter(ApiEndpoint.name, itemIndex) as BaseUrl;
	const email = context.getNodeParameter(Email.name, itemIndex) as string;

	const request: IGetActivityDataRequest = { email: email };

	const fullResponse = await zbGetRequest(context, baseUrl, Endpoint.ActivityData, request);
	const response = fullResponse.body as IGetActivityDataResponse | IErrorResponse;

	if (isErrorResponse(response)) {
		throw new NodeOperationError(context.getNode(), 'Get Activity Data failed: ' + response.error);
	}

	return [
		{
			json: response,
			pairedItem: itemIndex,
		},
	] as INodeExecutionData[];
}

export class ActivityDataHandler implements IOperationHandler {
	handle(context: IExecuteFunctions, operation: string, itemIndex: number): Promise<INodeExecutionData[]> {
		if (operation === Operations.ActivityData) {
			return getActivityData(context, itemIndex);
		} else {
			throw new NodeOperationError(context.getNode(), `Operation ${operation} not supported`);
		}
	}
}
