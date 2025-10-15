import { ApplicationError, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { IOperationHandler } from '../utils/handler.utils';
import { Mode, Operations } from '../enums';
import { deleteFile, fileStatus, getFile, sendFile } from '../utils/bulk.utils';

export class BulkValidationHandler implements IOperationHandler {
	handle(context: IExecuteFunctions, operation: string, i: number): Promise<INodeExecutionData[]> {
		switch (operation) {
			case Operations.BulkValidationSendFile:
				return sendFile(context, i, Mode.VALIDATION);
			case Operations.BulkValidationGetFile:
				return getFile(context, i, Mode.VALIDATION);
			case Operations.BulkValidationFileStatus:
				return fileStatus(context, i, Mode.VALIDATION);
			case Operations.BulkValidationDeleteFile:
				return deleteFile(context, i, Mode.VALIDATION);
			default:
				throw new ApplicationError(`Operation ${operation} not supported`);
		}
	}
}
