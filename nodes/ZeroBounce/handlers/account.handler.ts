import { IRequestParams, zbGetRequest, zbPostRequest } from '../utils/request.utils';
import {
	getNumberParameter,
	IAltErrorResponse,
	IErrorResponse,
	IOperationHandler,
	isAltErrorResponse,
	isErrorResponse,
	toDate,
} from '../utils/handler.utils';
import { ApplicationError, IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { BaseUrl, Endpoint, Operations } from '../enums';
import { ApiEndpoint } from '../fields/api-endpoint.field';
import { StartDate } from '../fields/start-date.field';
import { EndDate } from '../fields/end-date.field';
import { CreditsRequired } from '../fields/credits-required.field';
import { FilterRule, Rule } from '../fields/filter-rule.field';
import { FilterTarget, Target } from '../fields/filter-target.field';
import { FilterValue } from '../fields/filter-value.field';

interface IGetCreditsResponse extends IDataObject {
	Credits: number | string;
}

interface IGetApiUsageRequest extends IRequestParams {
	start_date: string; // The start date of when you want to view API usage. (format: yyyy-mm-dd)
	end_date: string; // The end date of when you want to view API usage. (format: yyyy-mm-dd)
}

interface IGetApiUsageResponse extends IDataObject {
	total: number; // Total number of times the API has been called
	status_valid: number; // Total valid email addresses returned by the API
	status_invalid: number; // Total invalid email addresses returned by the API
	status_catch_all: number; // Total catch-all email addresses returned by the API
	status_do_not_mail: number; // Total do not mail email addresses returned by the API
	status_spamtrap: number; // Total spamtrap email addresses returned by the API
	status_unknown: number; // Total unknown email addresses returned by the API
	sub_status_toxic: number; // Total number of times the API has a sub status of "toxic"
	sub_status_disposable: number; // Total number of times the API has a sub status of "disposable"
	sub_status_role_based: number; // Total number of times the API has a sub status of "role_based"
	sub_status_possible_trap: number; // Total number of times the API has a sub status of "possible_trap"
	sub_status_global_suppression: number; // Total number of times the API has a sub status of "global_suppression"
	sub_status_timeout_exceeded: number; // Total number of times the API has a sub status of "timeout_exceeded"
	sub_status_mail_server_temporary_error: number; // Total number of times the API has a sub status of "mail_server_temporary_error"
	sub_status_mail_server_did_not_respond: number; // Total number of times the API has a sub status of "mail_server_did_not_respond"
	sub_status_greylisted: number; // Total number of times the API has a sub status of "greylisted"
	sub_status_antispam_system: number; // Total number of times the API has a sub status of "antispam_system"
	sub_status_does_not_accept_mail: number; // Total number of times the API has a sub status of "does_not_accept_mail"
	sub_status_exception_occurred: number; // Total number of times the API has a sub status of "exception_occurred"
	sub_status_failed_syntax_check: number; // Total number of times the API has a sub status of "failed_syntax_check"
	sub_status_mailbox_not_found: number; // Total number of times the API has a sub status of "mailbox_not_found"
	sub_status_unroutable_ip_address: number; // Total number of times the API has a sub status of "unroutable_ip_address"
	sub_status_possible_typo: number; // Total number of times the API has a sub status of "possible_typo"
	sub_status_no_dns_entries: number; // Total number of times the API has a sub status of "no_dns_entries"
	sub_status_role_based_catch_all: number; // Total role based catch alls the API has a sub status of "role_based_catch_all"
	sub_status_mailbox_quota_exceeded: number; // Total number of times the API has a sub status of "mailbox_quota_exceeded"
	sub_status_forcible_disconnect: number; // Total forcible disconnects the API has a sub status of "forcible_disconnect"
	sub_status_failed_smtp_connection: number; // Total failed SMTP connections the API has a sub status of "failed_smtp_connection"
	sub_status_mx_forward: number; // Total number times the API has a sub status "mx_forward"
	start_date: string; // Start date of query. (format: yyyy/mm/dd)
	end_date: string; // End date of query. (format: yyyy/mm/dd)
}

interface IListFiltersResponse extends IDataObject {
	rule: Rule; // Possible values: "allow", "block".,
	target: Target; // e.g. "email". Choose for which target the filter is set for. Possible values: email, domain, mx or tld.
	value: string; // e.g. "test@example.com". The email address, email domain, mx record or tld you wish to filter, based on the selected target.
}

interface IAddFilterResponse extends IDataObject {
	Message: string; // e.g. "Filter successfully updated", "Filter successfully updated", "Filter already exists"
}

interface IDeleteFilterResponse extends IDataObject {
	Message: string; // e.g. "Filter successfully deleted", "Filter does not exist"
}

/**
 * Fetches current credit balance from ZeroBounce and optionally ensures the account has enough credits.
 * Throws if the balance is below the requested threshold.
 */
async function getCredits(context: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const baseUrl = context.getNodeParameter(ApiEndpoint.name, i) as BaseUrl;
	const creditsRequired = getNumberParameter(context, i, CreditsRequired.name, 0);

	const fullResponse = await zbGetRequest(context, baseUrl, Endpoint.GetCredits);
	const response = fullResponse.body as IGetCreditsResponse | IErrorResponse;

	if (isErrorResponse(response)) {
		throw new ApplicationError(`Failed to get credits balance: ${response.error}`);
	}

	const availableCredits = Number(response.Credits);

	if (Number.isNaN(availableCredits)) {
		throw new ApplicationError(
			`Invalid response from API: expected numeric 'Credits' but got ${JSON.stringify(response)}`,
		);
	}

	if (availableCredits === -1) {
		throw new ApplicationError(`Failed to get available credits`);
	}

	if (creditsRequired && creditsRequired > 0 && availableCredits < creditsRequired) {
		throw new ApplicationError(
			`Not enough credits to perform validation. Required '${creditsRequired}' but only have '${availableCredits}' left on the account`,
		);
	}

	return [
		{
			json: response,
		} as INodeExecutionData,
	] as INodeExecutionData[];
}

/**
 * Fetches API usage statistics between start and end dates.
 * Dates are normalized to ISO yyyy-mm-dd.
 */
async function getApiUsage(context: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const startDate = context.getNodeParameter(StartDate.name, i) as string;
	const endDate = context.getNodeParameter(EndDate.name, i) as string;
	const baseUrl = context.getNodeParameter(ApiEndpoint.name, i) as BaseUrl;

	const request = {
		start_date: toDate(startDate),
		end_date: toDate(endDate),
	} as IGetApiUsageRequest;

	const fullResponse = await zbGetRequest(context, baseUrl, Endpoint.GetApiUsage, request);
	const response = fullResponse.body as IGetApiUsageResponse | IErrorResponse;

	if (isErrorResponse(response)) {
		throw new ApplicationError(`Failed to get api usage: ${JSON.stringify(response.error)}`);
	}

	return [
		{
			json: response,
		} as INodeExecutionData,
	] as INodeExecutionData[];
}

async function listFilters(context: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const baseUrl = context.getNodeParameter(ApiEndpoint.name, i) as BaseUrl;

	const fullResponse = await zbGetRequest(context, baseUrl, Endpoint.FiltersList);
	const response = fullResponse.body as IListFiltersResponse[] | IAltErrorResponse;

	if (isAltErrorResponse(response)) {
		throw new ApplicationError(`Failed to get list filters: ${JSON.stringify(response.Error)}`);
	}

	return [
		{
			json: {
				filters: response,
			},
		},
	] as INodeExecutionData[];
}

enum AddOrDelete {
	ADD,
	DELETE,
}

async function addOrDeleteFilter(
	context: IExecuteFunctions,
	i: number,
	mode: AddOrDelete,
): Promise<INodeExecutionData[]> {
	const baseUrl = context.getNodeParameter(ApiEndpoint.name, i) as BaseUrl;
	const rule = context.getNodeParameter(FilterRule.name, i) as Rule;
	const target = context.getNodeParameter(FilterTarget.name, i) as Target;
	const value = context.getNodeParameter(FilterValue.name, i) as string;

	const request = new URLSearchParams();

	request.append('rule', rule);
	request.append('target', target);
	request.append('value', value);

	const endpoint = mode === AddOrDelete.ADD ? Endpoint.FiltersAdd : Endpoint.FiltersDelete;
	const fullResponse = await zbPostRequest(context, baseUrl, endpoint, request);
	const response = fullResponse.body as IAddFilterResponse | IDeleteFilterResponse | IAltErrorResponse;

	if (isAltErrorResponse(response)) {
		throw new ApplicationError(
			`Failed to ${mode === AddOrDelete.ADD ? 'add' : 'delete'} list filter: ${JSON.stringify(response.Error)}`,
		);
	}

	return [
		{
			json: response,
		},
	] as INodeExecutionData[];
}

class AccountHandler implements IOperationHandler {
	async handle(context: IExecuteFunctions, operation: string, i: number): Promise<INodeExecutionData[]> {
		switch (operation) {
			case Operations.AccountGetCredits:
				return getCredits(context, i);
			case Operations.AccountGetApiUsage:
				return getApiUsage(context, i);
			case Operations.AccountListFilters:
				return listFilters(context, i);
			case Operations.AccountAddFilter:
				return addOrDeleteFilter(context, i, AddOrDelete.ADD);
			case Operations.AccountDeleteFilter:
				return addOrDeleteFilter(context, i, AddOrDelete.DELETE);
			default:
				throw new ApplicationError(`Operation ${operation} not supported`);
		}
	}
}

export default AccountHandler;
