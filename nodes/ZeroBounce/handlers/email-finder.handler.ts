import { ApplicationError, IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { IErrorResponse, IOperationHandler } from '../utils/handler.utils';
import { IRequestParams, zbGetRequest } from '../utils/request.utils';
import { BaseUrl, Endpoint, Operations } from '../enums';
import { ApiEndpoint } from '../fields/api-endpoint.field';
import { CompanyName } from '../fields/company-name.field';
import { Domain } from '../fields/domain.field';
import { FirstName } from '../fields/first-name.field';
import { MiddleName } from '../fields/middle-name.field';
import { LastName } from '../fields/last-name.field';
import { FindBy, FindByType } from '../fields/finder-type.field';

interface IFindRequest extends IRequestParams {
	domain?: string; // The email domain for which to find the email format. [conditional]
	company_name?: string; // The company name for which to find the email format. [conditional]
	first_name?: string; // The first name of the person whose email format is being searched. [optional]
	middle_name?: string; // The middle name of the person whose email format is being searched. [optional]
	last_name?: string; // The last name of the person whose email format is being searched. [optional]
}

interface IFindResponse extends IDataObject {
	email?: string; // The resulting email address identified by the API.
	email_confidence?: string; // The level of confidence we have that the email exists. Possible values: HIGH, MEDIUM, LOW.
	domain: string; // provided domain name.
	company_name: string; // The company associated with the domain.
	did_you_mean: string; // e.g. a suggestion in case a firstname is used in the lastname field
	failure_reason: string; // A reason for the unknown result. Possible values can be found in the "Possible reasons for unknown status" section below.
	other_domain_formats?: IOtherDomainFormat[];
}

interface IOtherDomainFormat {
	format: string;
	confidence: FormatConfidence;
}

enum FormatConfidence {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
}

interface IFindUnsuccessfulResponse extends IDataObject {
	Message: string;
}

function isUnsuccessfulResponse(response: unknown): response is IFindUnsuccessfulResponse {
	return (
		typeof response === 'object' && response !== null && 'Message' in response && typeof response.Message === 'string'
	);
}

async function find(context: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const baseUrl = context.getNodeParameter(ApiEndpoint.name, i) as BaseUrl;
	const findBy = context.getNodeParameter(FindBy.name, i) as FindByType;

	let companyName: string | undefined;
	let domain: string | undefined;

	switch (findBy) {
		case FindByType.COMPANY_NAME:
			companyName = context.getNodeParameter(CompanyName.name, i) as string;
			break;
		case FindByType.DOMAIN:
			domain = context.getNodeParameter(Domain.name, i) as string;
			break;
	}

	const firstName = context.getNodeParameter(FirstName.name, i) as string | undefined;
	const middleName = context.getNodeParameter(MiddleName.name, i) as string | undefined;
	const lastName = context.getNodeParameter(LastName.name, i) as string | undefined;

	const request: IFindRequest = {
		company_name: companyName,
		domain: domain,
		first_name: firstName,
		middle_name: middleName,
		last_name: lastName,
	};

	const fullResponse = await zbGetRequest(context, baseUrl, Endpoint.GuessFormat, request);
	const response = fullResponse.body as IFindResponse | IErrorResponse;

	if (isUnsuccessfulResponse(response)) {
		throw new ApplicationError('Email Finder failed: ' + response.Message);
	}

	return [
		{
			json: response,
		} as INodeExecutionData,
	] as INodeExecutionData[];
}

export class EmailFinderHandler implements IOperationHandler {
	handle(context: IExecuteFunctions, operation: string, i: number): Promise<INodeExecutionData[]> {
		switch (operation) {
			case Operations.EmailFinderFind:
				return find(context, i);
			case Operations.BulkEmailFinderSendFile:
			case Operations.BulkEmailFinderGetFile:
			case Operations.BulkEmailFinderFileStatus:
			case Operations.BulkEmailFinderDeleteFile:
			default:
				throw new ApplicationError(`Operation ${operation} not supported`);
		}
	}
}
