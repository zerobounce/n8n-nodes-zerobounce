# n8n-nodes-zerobounce

This is an n8n community node. It lets you use the ZeroBounce API in your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

- Account
  - Credits Balance
  - API Usage
  - List Filters
  - Add Filter
  - Delete Filter
- Validation
  - Validate Email
  - Validate Batch
  - Bulk Validate Send File
  -	Bulk Validate Get File
  -	Bulk Validate File Status
  -	Bulk Validate Delete File
- A.I. Scoring
  - Score Email
  - Bulk A.I. Scoring Send File
  -	Bulk A.I. Scoring Get File
  -	Bulk A.I. Scoring File Status
  -	Bulk A.I. Scoring Delete File
- Email Finder
  - Find Email Address
  - Bulk Email Finder Send File
  - Bulk Email Finder Get File
  - Bulk Email Finder File Status
  - Bulk Email Finder Delete File
- Domain Search
  - Domain Search
  - Bulk Domain Search Send File
  - Bulk Domain Search Get File
  - Bulk Domain Search File Status
  - Bulk Domain Search Delete File
- Activity Data
  - Get Activity Data

## Credentials

You can use a ZeroBounce API Key to use this node.

### API Key

1. Open your ZeroBounce API dashboard [ZeroBounce API](https://www.zerobounce.net/members/API).
2. Click 'Create a new API Key'.
3. Enter a descriptive name for your key in the API Key Name field, like 'n8n integration'.
4. Set the key to active and optionally configure the IP address(es) it can be used from.
5. Toggle the API Keys' visibility and copy the value shown.

For more information, see [API Keys Management](https://www.zerobounce.net/docs/api-dashboard/#API_keys_management)

## Usage

### Send File
 #### Wait Webhook
  - Use a 'Wait' node to wait for a webhook confirming completion of a file
  - Use Resume mode 'On Webhook Call'
  - Set the HTTP Method to 'POST'
  - Optional: Add a webhook suffix with the options dropdown e.g. `zerobounce`
  - Set the 'return_url' parameter in the Send File node to the webhook URL e.g. `{{$execution.resumeUrl}}/zerobounce`
  - On execution, the URL is generated and the 'Wait' node will wait until the notification is received from ZeroBounce

## Compatibility

Compatible with n8n@1.60.0 or later

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
