import type { INodeProperties } from 'n8n-workflow';

import { Fields } from '../enums';

export const BinaryKey: INodeProperties = {
	displayName: 'Binary Key of Input File',
	name: Fields.BinaryKey,
	type: 'string',
	default: 'data',
	placeholder: 'data',
	required: true,
	description: 'The key which identifies which binary data to send as a file, usually \'data\'',
};
