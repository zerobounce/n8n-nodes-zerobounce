import { IDataObject, IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { ApiEndpoint } from '../fields/api-endpoint.field';
import { BaseUrl, Endpoint, Mode } from '../enums';
import { FindBy, FindByType } from '../fields/email-finder.field';
import { Domain } from '../fields/domain.field';
import { CompanyName } from '../fields/company-name.field';
import { IRequestParams, zbGetRequest } from './request.utils';
import { IErrorResponse, isBlank } from './handler.utils';
import { FirstName } from '../fields/first-name.field';
import { MiddleName } from '../fields/middle-name.field';
import { LastName } from '../fields/last-name.field';

export enum FormatConfidence {
	LOW = 'low', // unlikely to be in use; high-risk
	MEDIUM = 'medium', // medium level of confidence; the format may be in use
	HIGH = 'high', // highest level of confidence, format likely in use based on validation results
	UNKNOWN = 'unknown', // see documentation for possible unknown errors
	UNDETERMINED = 'undetermined', // cannot determine email, so format is unknown. Confidence for an empty email cannot be determined.
}

interface IFindRequest extends IRequestParams {
	domain?: string; // The email domain for which to find the email format. [conditional]
	company_name?: string; // The company name for which to find the email format. [conditional]
	first_name?: string; // The first name of the person whose email format is being searched. [conditional]
	middle_name?: string; // The middle name of the person whose email format is being searched. [optional]
	last_name?: string; // The last name of the person whose email format is being searched. [conditional]
}

interface IFindResponse extends IDataObject {
	email: string; // The resulting email address identified by the API.
	email_confidence: FormatConfidence; // The level of confidence we have that the email exists. Possible values: HIGH, MEDIUM, LOW.
	domain: string; // provided domain name.
	company_name: string; // The company associated with the domain.
	did_you_mean: string; // e.g. a suggestion in case a firstname is used in the lastname field
	failure_reason: string; // A reason for the unknown result. Possible values can be found in the "Possible reasons for unknown status" section below.
}

interface IDomainSearchRequest extends IRequestParams {
	domain?: string; // The email domain for which to find the email format. [conditional]
	company_name?: string; // The company name for which to find the email format. [conditional]
}

interface IDomainSearchResponse extends IDataObject {
	domain: string; // provided domain name.
	company_name: string; // The company associated with the domain.
	format?: string; // The Format of the resulting email addresses.
	confidence?: FormatConfidence; // The level of confidence we have in the provided format based on our engine and database. Possible values: LOW, MEDIUM, HIGH, UNKNOWN.
	did_you_mean: string; // e.g. a suggestion in case a firstname is used in the lastname field
	failure_reason: string; // A reason for the unknown result. Possible values can be found in the "Possible reasons for unknown status" section below.
	other_domain_formats?: IOtherDomainFormat[];
}

interface IOtherDomainFormat {
	format: string;
	confidence: FormatConfidence;
}

export interface IFindUnsuccessfulResponse extends IDataObject {
	Message: string;
}

export function isUnsuccessfulResponse(response: unknown): response is IFindUnsuccessfulResponse {
	return (
		typeof response === 'object' && response !== null && 'Message' in response && typeof response.Message === 'string'
	);
}

export async function find(context: IExecuteFunctions, i: number, mode: Mode): Promise<INodeExecutionData[]> {
	const baseUrl = context.getNodeParameter(ApiEndpoint.name, i) as BaseUrl;
	const findBy = context.getNodeParameter(FindBy.name, i) as FindByType;

	let domain: string | undefined;
	let companyName: string | undefined;

	switch (findBy) {
		case FindByType.DOMAIN:
			domain = context.getNodeParameter(Domain.name, i) as string;
			break;
		case FindByType.COMPANY_NAME:
			companyName = context.getNodeParameter(CompanyName.name, i) as string;
			break;
	}

	let request: IFindRequest | IDomainSearchRequest;

	if (mode === Mode.EMAIL_FINDER) {
		const firstName = context.getNodeParameter(FirstName.name, i) as string | undefined;
		const middleName = context.getNodeParameter(MiddleName.name, i) as string | undefined;
		const lastName = context.getNodeParameter(LastName.name, i) as string | undefined;

		if (isBlank(firstName) && isBlank(lastName)) {
			throw new NodeOperationError(
				context.getNode(),
				`Email Finder requires '${FirstName.displayName}' or '${LastName.displayName}'`,
				{
					itemIndex: i,
					description: `Enter a value for '${FirstName.displayName}', '${LastName.displayName}' or both`,
				},
			);
		}

		request = {
			domain: domain,
			company_name: companyName,
			first_name: firstName,
			middle_name: middleName,
			last_name: lastName,
		} as IFindRequest;
	} else {
		request = {
			domain: domain,
			company_name: companyName,
		};
	}

	const fullResponse = await zbGetRequest(context, baseUrl, Endpoint.GuessFormat, request);
	const response = fullResponse.body as IFindResponse | IDomainSearchResponse | IErrorResponse;

	if (isUnsuccessfulResponse(response)) {
		throw new NodeOperationError(
			context.getNode(),
			`${mode === Mode.EMAIL_FINDER ? 'Email Finder' : 'Domain Search'} failed: ` + response.Message,
		);
	}

	return [
		{
			json: response,
			pairedItem: i,
		} as INodeExecutionData,
	] as INodeExecutionData[];
}
