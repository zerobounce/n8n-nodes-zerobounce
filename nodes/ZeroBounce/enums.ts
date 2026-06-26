export enum Credentials {
	ZeroBounceApi = 'zeroBounceApi',
}

export enum Resources {
	Account = 'account',
	Validation = 'validation',
	Scoring = 'scoring',
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
	BulkValidationSendFile = 'sendFile',
	BulkValidationGetFile = 'getFile',
	BulkValidationFileStatus = 'fileStatus',
	BulkValidationDeleteFile = 'deleteFile',

	// Scoring
	ScoringScore = 'score',
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

	// Domain Search
	DomainSearch = 'search',
	BulkDomainSearchSendFile = 'domainSearchSendFile',
	BulkDomainSearchGetFile = 'domainSearchGetFile',
	BulkDomainSearchFileStatus = 'domainSearchFileStatus',
	BulkDomainSearchDeleteFile = 'domainSearchDeleteFile',

	// Activity Data
	ActivityData = 'getActivityData',
}

export enum Fields {
	AddOptions = 'addOptions',
	ApiKey = 'apiKey',
	ActivityData = 'activityData',
	ApiEndpoint = 'apiEndpoint',
	BinaryKey = 'binaryKey',
	CombineItems = 'combineItems',
	CompanyName = 'companyName',
	CreditsRequired = 'creditsRequired',
	DelayNotice = 'delayNotice',
	DocumentationNotice = 'documentationNotice',
	Domain = 'domain',
	DomainColumnNumber = 'domainColumnNumber',
	Email = 'email',
	EmailColumnNumber = 'emailColumnNumber',
	EmailFinderColumnsFirstName = 'emailFinderColumnsFirstName',
	EmailFinderColumnsFullName = 'emailFinderColumnsFullName',
	EmailFinderColumnsLastName = 'emailFinderColumnsLastName',
	EmailFinderColumnsMiddleName = 'emailFinderColumnsMiddleName',
	EndDate = 'endDate',
	FileId = 'fileId',
	FileName = 'fileName',
	FilterRule = 'filterRule',
	FilterTarget = 'filterTarget',
	FilterValue = 'filterValue',
	FindBy = 'findBy',
	FirstName = 'firstName',
	FullName = 'fullName',
	GetFileOutputType = 'getFileOutputType',
	HasHeader = 'hasHeader',
	IncludeFile = 'includeFile',
	IpAddress = 'ipAddress',
	IpAddressColumnNumber = 'ipAddressColumnNumber',
	ItemInputType = 'itemInputType',
	ItemInputAssignment = 'itemInputAssignment',
	ItemInputJson = 'itemInputJson',
	ItemInputMapped = 'itemInputMapped',
	LastName = 'lastName',
	MiddleName = 'middleName',
	NameType = 'nameType',
	RemoveDuplicates = 'removeDuplicates',
	ReturnUrl = 'returnUrl',
	SendFileInputType = 'sendFileInputType',
	SplitItems = 'splitItems',
	StartDate = 'startDate',
	Timeout = 'timeout',
	VerifyPlus = 'verifyPlus',
}

export enum BaseUrl {
	DEFAULT = 'https://api.zerobounce.net/v2',
	US = 'https://api-us.zerobounce.net/v2',
	EU = 'https://api-eu.zerobounce.net/v2',
	BULK_V2 = 'https://bulkapi.zerobounce.net/v2',
	BULK = 'https://bulkapi.zerobounce.net',
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
	ActivityData = '/activity',
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
	EmailFinderSendFile = '/email-finder/sendfile',
	EmailFinderGetFile = '/email-finder/getfile',
	EmailFinderFileStatus = '/email-finder/filestatus',
	EmailFinderDeleteFile = '/email-finder/deletefile',
	DomainSearchSendFile = '/domain-search/sendfile',
	DomainSearchGetFile = '/domain-search/getfile',
	DomainSearchFileStatus = '/domain-search/filestatus',
	DomainSearchDeleteFile = '/domain-search/deletefile',
}

export enum Mode {
	VALIDATION = 'validation',
	SCORING = 'scoring',
	EMAIL_FINDER = 'email_finder',
	DOMAIN_SEARCH = 'domain_search',
}

export enum Documentation {
	GetCreditsBalance = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/v2-credit-balance',
	GetApiUsage = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/v2-get-api-usage',
	AllowlistAndBlocklist = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/v2-allowlist-and-blocklist',
	ValidationValidate = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/v2-validate-emails',
	ValidationBatchValidate = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/v2-batch-validate-emails',
	BulkValidationSendFile = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/v2-send-file',
	BulkValidationGetFile = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/v2-get-file',
	BulkValidationFileStatus = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/v2-file-status',
	BulkValidationDeleteFile = 'https://www.zerobounce.net/docs/email-validation-api-quickstart/v2-delete-file',
	ScoringScore = 'https://www.zerobounce.net/docs/ai-scoring-api/single-email-scoring',
	BulkScoringSendFile = 'https://www.zerobounce.net/docs/ai-scoring-api/ai-scoring-api__send-file',
	BulkScoringGetFile = 'https://www.zerobounce.net/docs/ai-scoring-api/ai_scoring_get_file',
	BulkScoringFileStatus = 'https://www.zerobounce.net/docs/ai-scoring-api/ai-scoring-api__file-status',
	BulkScoringDeleteFile = 'https://www.zerobounce.net/docs/ai-scoring-api/ai_scoring_delete_file',
	EmailFinderFind = 'https://www.zerobounce.net/docs/email-finder-api',
	BulkEmailFinderSendFile = 'https://www.zerobounce.net/docs/email-finder-api/bulk-email-finder-api/bulk-send-file',
	BulkEmailFinderGetFile = 'https://www.zerobounce.net/docs/email-finder-api/bulk-email-finder-api/bulk-get-file',
	BulkEmailFinderFileStatus = 'https://www.zerobounce.net/docs/email-finder-api/bulk-email-finder-api/bulk-file-status',
	BulkEmailFinderDeleteFile = 'https://www.zerobounce.net/docs/email-finder-api/bulk-email-finder-api/bulk-delete-file',
	DomainSearch = 'https://www.zerobounce.net/docs/domain-search-api',
	BulkDomainSearchSendFile = 'https://www.zerobounce.net/docs/domain-search-api/bulk-domain-search-api/send-file',
	BulkDomainSearchGetFile = 'https://www.zerobounce.net/docs/domain-search-api/bulk-domain-search-api/get-file',
	BulkDomainSearchFileStatus = 'https://www.zerobounce.net/docs/domain-search-api/bulk-domain-search-api/file-status',
	BulkDomainSearchDeleteFile = 'https://www.zerobounce.net/docs/domain-search-api/bulk-domain-search-api/delete-file',
	ActivityData = 'https://www.zerobounce.net/docs/activity-data-api',
}
