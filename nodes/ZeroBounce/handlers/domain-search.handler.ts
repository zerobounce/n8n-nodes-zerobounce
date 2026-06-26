import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { IOperationHandler } from '../utils/handler.utils';
import { Mode, Operations } from '../enums';
import { deleteFile, fileStatus, getFile, sendFile } from '../utils/bulk.utils';
import { find } from '../utils/finder.utils';

export class DomainSearchHandler implements IOperationHandler {
	handle(context: IExecuteFunctions, operation: string, itemIndex: number): Promise<INodeExecutionData[]> {
		switch (operation) {
			case Operations.DomainSearch:
				return find(context, itemIndex, Mode.DOMAIN_SEARCH);
			case Operations.BulkDomainSearchSendFile:
				return sendFile(context, itemIndex, Mode.DOMAIN_SEARCH);
			case Operations.BulkDomainSearchGetFile:
				return getFile(context, itemIndex, Mode.DOMAIN_SEARCH);
			case Operations.BulkDomainSearchFileStatus:
				return fileStatus(context, itemIndex, Mode.DOMAIN_SEARCH);
			case Operations.BulkDomainSearchDeleteFile:
				return deleteFile(context, itemIndex, Mode.DOMAIN_SEARCH);
			default:
				throw new NodeOperationError(context.getNode(), `Operation ${operation} not supported`, {
					itemIndex: itemIndex,
					description: 'Please select an operation from the list',
				});
		}
	}
}
