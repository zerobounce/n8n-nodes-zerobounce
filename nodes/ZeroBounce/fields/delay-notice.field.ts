import { INodeProperties } from 'n8n-workflow';
import { Fields } from '../enums';

export const DelayNotice: INodeProperties = {
	displayName: 'Please allow up to 1 minute for changes to propagate',
	name: Fields.DelayNotice,
	type: 'notice',
	default: '',
};
