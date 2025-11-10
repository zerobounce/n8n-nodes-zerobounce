import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { IOperationHandler } from '../utils/handler.utils';
import { Mode, Operations } from '../enums';
import { deleteFile, fileStatus, getFile, sendFile } from '../utils/bulk.utils';
import { find } from '../utils/finder.utils';

export class DomainSearchHandler implements IOperationHandler {
	handle(context: IExecuteFunctions, operation: string, i: number): Promise<INodeExecutionData[]> {
		switch (operation) {
			case Operations.DomainSearch:
				return find(context, i, Mode.DOMAIN_SEARCH);
			case Operations.BulkDomainSearchSendFile:
				return sendFile(context, i, Mode.DOMAIN_SEARCH);
			case Operations.BulkDomainSearchGetFile:
				return getFile(context, i, Mode.DOMAIN_SEARCH);
			case Operations.BulkDomainSearchFileStatus:
				return fileStatus(context, i, Mode.DOMAIN_SEARCH);
			case Operations.BulkDomainSearchDeleteFile:
				return deleteFile(context, i, Mode.DOMAIN_SEARCH);
			default:
				throw new NodeOperationError(context.getNode(), `Operation ${operation} not supported`);
		}
	}
}
