import { IDataObject, IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { IErrorResponse, IOperationHandler, isErrorResponse } from '../utils/handler.utils';
import { IRequestParams, zbGetRequest } from '../utils/request.utils';
import { BaseUrl, Endpoint, Mode, Operations } from '../enums';
import { Email } from '../fields/email.field';
import { ApiEndpoint } from '../fields/api-endpoint.field';
import { deleteFile, fileStatus, getFile, sendFile } from '../utils/bulk.utils';

interface IScoreRequest extends IRequestParams {
	email: string; // The email address that you want to retrieve Scoring data for
}

interface IScoreResult extends IDataObject {
	email: string; //	The email address you are scoring.
	score: number; // [1-10]
}

async function score(context: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData[]> {
	const baseUrl = context.getNodeParameter(ApiEndpoint.name, itemIndex) as BaseUrl;
	const email = context.getNodeParameter(Email.name, itemIndex) as string;

	const request: IScoreRequest = {
		email: email,
	};

	const fullResponse = await zbGetRequest(context, baseUrl, Endpoint.Scoring, request);
	const response = fullResponse.body as IScoreResult | IErrorResponse;

	if (isErrorResponse(response)) {
		throw new NodeOperationError(context.getNode(), 'Scoring failed: ' + response.error);
	}

	return [
		{
			json: response,
			pairedItem: itemIndex,
		},
	] as INodeExecutionData[];
}

export class ScoringHandler implements IOperationHandler {
	handle(context: IExecuteFunctions, operation: string, itemIndex: number): Promise<INodeExecutionData[]> {
		switch (operation) {
			case Operations.ScoringScore:
				return score(context, itemIndex);
			case Operations.BulkScoringSendFile:
				return sendFile(context, itemIndex, Mode.SCORING);
			case Operations.BulkScoringGetFile:
				return getFile(context, itemIndex, Mode.SCORING);
			case Operations.BulkScoringFileStatus:
				return fileStatus(context, itemIndex, Mode.SCORING);
			case Operations.BulkScoringDeleteFile:
				return deleteFile(context, itemIndex, Mode.SCORING);
			default:
				throw new NodeOperationError(context.getNode(), `Operation ${operation} not supported`, {
					itemIndex: itemIndex,
					description: 'Please select an operation from the list',
				});
		}
	}
}
