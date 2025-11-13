import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const FileId: INodeProperties = {
	displayName: 'ID of Validation File',
	name: Fields.FileId,
	type: 'string',
	default: '={{ $json.file_id }}',
	placeholder: 'e.g. 9f559670-0202-46e9-ab65-7aa1917f12ca',
	required: true,
	description: 'The ID which was returned was returned when submitting a file for validation',
};
