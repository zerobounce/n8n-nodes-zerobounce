import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { IOperationHandler } from '../utils/handler.utils';
import { Mode, Operations } from '../enums';
import { deleteFile, fileStatus, getFile, sendFile } from '../utils/bulk.utils';
import { find } from '../utils/finder.utils';

export class EmailFinderHandler implements IOperationHandler {
	handle(context: IExecuteFunctions, operation: string, itemIndex: number): Promise<INodeExecutionData[]> {
		switch (operation) {
			case Operations.EmailFinderFind:
				return find(context, itemIndex, Mode.EMAIL_FINDER);
			case Operations.BulkEmailFinderSendFile:
				return sendFile(context, itemIndex, Mode.EMAIL_FINDER);
			case Operations.BulkEmailFinderGetFile:
				return getFile(context, itemIndex, Mode.EMAIL_FINDER);
			case Operations.BulkEmailFinderFileStatus:
				return fileStatus(context, itemIndex, Mode.EMAIL_FINDER);
			case Operations.BulkEmailFinderDeleteFile:
				return deleteFile(context, itemIndex, Mode.EMAIL_FINDER);
			default:
				throw new NodeOperationError(context.getNode(), `Operation ${operation} not supported`, {
					itemIndex: itemIndex,
					description: 'Please select an operation from the list',
				});
		}
	}
}
