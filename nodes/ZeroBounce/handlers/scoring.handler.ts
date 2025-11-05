import { ApplicationError, IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
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

async function score(context: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const email = context.getNodeParameter(Email.name, i) as string;
	const baseUrl = context.getNodeParameter(ApiEndpoint.name, i) as BaseUrl;

	const request: IScoreRequest = {
		email: email,
	};

	const fullResponse = await zbGetRequest(context, baseUrl, Endpoint.Scoring, request);
	const response = fullResponse.body as IScoreResult | IErrorResponse;

	if (isErrorResponse(response)) {
		throw new ApplicationError('Scoring failed: ' + response.error);
	}

	return [
		{
			json: response,
		} as INodeExecutionData,
	] as INodeExecutionData[];
}

export class ScoringHandler implements IOperationHandler {
	handle(context: IExecuteFunctions, operation: string, i: number): Promise<INodeExecutionData[]> {
		switch (operation) {
			case Operations.ScoringScore:
				return score(context, i);
			case Operations.BulkScoringSendFile:
				return sendFile(context, i, Mode.SCORING);
			case Operations.BulkScoringGetFile:
				return getFile(context, i, Mode.SCORING);
			case Operations.BulkScoringFileStatus:
				return fileStatus(context, i, Mode.SCORING);
			case Operations.BulkScoringDeleteFile:
				return deleteFile(context, i, Mode.SCORING);
			default:
				throw new ApplicationError(`Operation ${operation} not supported`);
		}
	}
}
