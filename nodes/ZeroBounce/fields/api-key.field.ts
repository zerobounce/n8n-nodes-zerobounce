import { INodeProperties } from 'n8n-workflow';
import { Fields } from '../enums';

export const ApiKey: INodeProperties = {
	displayName: 'API Key',
	name: Fields.ApiKey,
	type: 'string',
	typeOptions: { password: true },
	default: '',
};
