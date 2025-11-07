import { ApplicationError, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { IOperationHandler } from '../utils/handler.utils';
import { Mode, Operations } from '../enums';
import { deleteFile, fileStatus, getFile, sendFile } from '../utils/bulk.utils';
import { find } from '../utils/finder.utils';

export class EmailFinderHandler implements IOperationHandler {
	handle(context: IExecuteFunctions, operation: string, i: number): Promise<INodeExecutionData[]> {
		switch (operation) {
			case Operations.EmailFinderFind:
				return find(context, i, Mode.EMAIL_FINDER);
			case Operations.BulkEmailFinderSendFile:
				return sendFile(context, i, Mode.EMAIL_FINDER);
			case Operations.BulkEmailFinderGetFile:
				return getFile(context, i, Mode.EMAIL_FINDER);
			case Operations.BulkEmailFinderFileStatus:
				return fileStatus(context, i, Mode.EMAIL_FINDER);
			case Operations.BulkEmailFinderDeleteFile:
				return deleteFile(context, i, Mode.EMAIL_FINDER);
			default:
				throw new ApplicationError(`Operation ${operation} not supported`);
		}
	}
}
