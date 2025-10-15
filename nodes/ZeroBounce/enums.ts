export enum Credentials {
	ZeroBounceApi = 'zeroBounceApi',
}

export enum Resources {
	Account = 'account',
	Validation = 'validation',
	Scoring = 'scoring',
	BulkValidation = 'bulkValidation',
	BulkScoring = 'bulkScoring',
	EmailFinder = 'emailFinder',
	DomainSearch = 'domainSearch',
	ActivityData = 'activityData',
	ListEvaluator = 'listEvaluator',
}

export enum Operations {
	// Account
	AccountGetCredits = 'getCredits',
	AccountGetApiUsage = 'getApiUsage',
	AccountListFilters = 'listFilters',
	AccountAddFilter = 'addFilter',
	AccountDeleteFilter = 'deleteFilter',

	// Validation
	ValidationValidate = 'validate',
	ValidationBatchValidate = 'batchValidate',

	// Scoring
	ScoringScore = 'score',

	// Bulk Validation
	BulkValidationSendFile = 'sendFile',
	BulkValidationGetFile = 'getFile',
	BulkValidationFileStatus = 'fileStatus',
	BulkValidationDeleteFile = 'deleteFile',

	// Bulk Scoring
	BulkScoringSendFile = 'scoringSendFile',
	BulkScoringGetFile = 'scoringGetFile',
	BulkScoringFileStatus = 'scoringFileStatus',
	BulkScoringDeleteFile = 'scoringDeleteFile',

	// Email Finder
	EmailFinderFind = 'find',
	BulkEmailFinderSendFile = 'emailFinderSendFile',
	BulkEmailFinderGetFile = 'emailFinderGetFile',
	BulkEmailFinderFileStatus = 'emailFinderFileStatus',
	BulkEmailFinderDeleteFile = 'emailFinderDeleteFile',
}

export enum Fields {
	ApiKey = 'apiKey',
	ActivityData = 'activityData',
	ApiEndpoint = 'apiEndpoint',
	Batch = 'batch',
	BinaryKey = 'binaryKey',
	CombineItems = 'combineItems',
	CompanyName = 'companyName',
	CreditsRequired = 'creditsRequired',
	DelayNotice = 'delayNotice',
	DocumentationNotice = 'documentationNotice',
	Domain = 'domain',
	Email = 'email',
	EmailBatchType = 'emailBatchType',
	EmailBatchAssignment = 'emailBatchAssignment',
	EmailBatchJson = 'emailBatchJson',
	EmailBatchMapped = 'emailBatchMapped',
	EmailColumnNumber = 'emailColumnNumber',
	EndDate = 'endDate',
	FileId = 'fileId',
	FileName = 'fileName',
	FilterRule = 'filterRule',
	FilterTarget = 'filterTarget',
	FilterValue = 'filterValue',
	FindBy = 'findBy',
	FirstName = 'firstName',
	GetFileOutputType = 'getFileOutputType',
	HasHeader = 'hasHeader',
	IpAddress = 'ipAddress',
	IpAddressColumnNumber = 'ipAddressColumnNumber',
	LastName = 'lastName',
	MiddleName = 'middleName',
	RemoveDuplicates = 'removeDuplicates',
	ReturnUrl = 'returnUrl',
	SendFileInputType = 'sendFileInputType',
	StartDate = 'startDate',
	Timeout = 'timeout',
	VerifyPlus = 'verifyPlus',
}

export enum BaseUrl {
	DEFAULT = 'https://api.zerobounce.net/v2',
	US = 'https://api-us.zerobounce.net/v2',
	EU = 'https://api-eu.zerobounce.net/v2',
	BULK = 'https://bulkapi.zerobounce.net/v2',
}

export enum Endpoint {
	GetCredits = '/getcredits',
	GetApiUsage = '/getapiusage',
	FiltersList = '/filters/list',
	FiltersAdd = '/filters/add',
	FiltersDelete = '/filters/delete',
	Validate = '/validate',
	Scoring = '/scoring',
	GuessFormat = '/guessformat',
}

export enum BulkEndpoint {
	ValidateBatch = '/validatebatch',
	SendFile = '/sendfile',
	GetFile = '/getfile',
	FileStatus = '/filestatus',
	DeleteFile = '/deletefile',
	ScoringSendFile = '/scoring/sendfile',
	ScoringGetFile = '/scoring/getfile',
	ScoringFileStatus = '/scoring/filestatus',
	ScoringDeleteFile = '/scoring/deletefile',
}

export enum Mode {
	VALIDATION,
	SCORING,
}

export enum Documentation {
	GetCreditsBalance = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/#get_balance__v2__',
	GetApiUsage = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/#get_aPI_usage__v2__',
	AllowlistAndBlocklist = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/#allow_and_blocklist__v2__',
	ValidationValidate = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/#validate_emails__v2__',
	ValidationBatchValidate = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/#batch_validate_emails__v2__',
	ScoringScore = 'https://www.zerobounce.net/docs/ai-scoring-api/#single_email_scoring',
	EmailFinderFind = 'https://www.zerobounce.net/docs/email-finder-api/',
	BulkValidationSendFile = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/#send_file__v2__',
	BulkValidationGetFile = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/#get_file__v2__',
	BulkValidationFileStatus = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/#file_status__v2__',
	BulkValidationDeleteFile = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/#delete_file__v2__',
	BulkScoringSendFile = 'https://www.zerobounce.net/docs/ai-scoring-api/#ai_scoring_send_file',
	BulkScoringGetFile = 'https://www.zerobounce.net/docs/ai-scoring-api/#ai_scoring_get_file',
	BulkScoringFileStatus = 'https://www.zerobounce.net/docs/ai-scoring-api/#ai_scoring_file_status',
	BulkScoringDeleteFile = 'https://www.zerobounce.net/docs/ai-scoring-api/#ai_scoring_delete_file',
	BulkEmailFinderSendFile = 'emailFinderSendFile',
	BulkEmailFinderGetFile = 'emailFinderGetFile',
	BulkEmailFinderFileStatus = 'emailFinderFileStatus',
	BulkEmailFinderDeleteFile = 'emailFinderDeleteFile',
}