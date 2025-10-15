import { ApplicationError, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { IOperationHandler } from '../utils/handler.utils';
import { Mode, Operations } from '../enums';
import { deleteFile, fileStatus, getFile, sendFile } from '../utils/bulk.utils';

export class BulkScoringHandler implements IOperationHandler {
	handle(context: IExecuteFunctions, operation: string, i: number): Promise<INodeExecutionData[]> {
		switch (operation) {
			case Operations.BulkScoringSendFile:
				return sendFile(context, i, Mode.SCORING);
			case Operations.BulkScoringGetFile:
				return getFile(context, i, Mode.SCORING);
			case Operations.BulkScoringFileStatus:
				return fileStatus(context, i, Mode.SCORING);
			case Operations.BulkScoringDeleteFile:
				return deleteFile(context, i, Mode.SCORING);
			default:
				throw new ApplicationError(`Operation ${operation} not supported`);
		}
	}
}
