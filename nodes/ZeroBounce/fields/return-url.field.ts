import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const ReturnUrl: INodeProperties = {
	displayName: 'Return URL',
	name: Fields.ReturnUrl,
	type: 'string',
	default: '={{$execution.resumeUrl}}/zerobounce',
	placeholder: 'e.g. {{$execution.resumeUrl}}/zerobounce',
	description: 'The public Webhook URL ZeroBounce will call when file validation is complete (Optional)',
};
