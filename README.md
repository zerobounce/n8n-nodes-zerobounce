![ZeroBounce Logo](https://raw.githubusercontent.com/zerobounce/n8n-nodes-zerobounce/main/icons/zerobounce-logo.svg)

# n8n-nodes-zerobounce

This is an n8n community node for integrating with the ZeroBounce API in your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

* [About](#about)
* [Installation](#installation)
* [Operations](#operations)
* [Credentials](#credentials)
* [Usage](#usage)
* [Support](#support)
* [Compatibility](#compatibility)
* [Resources](#resources)

## About

[ZeroBounce](https://www.zerobounce.net) is an award-winning email verification and deliverability platform trusted by more than 185,000 customers.

It detects invalid, abuse, spam trap other risky email addresses to improve inbox placement.

The company is GDPR and SOC 2 Type 2 compliant, validating over 13 billion emails to date. Some of the companies it serves are Amazon, Disney, Netflix, LinkedIn and Sephora.

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
  - Bulk Validate Get File
  - Bulk Validate File Status
  - Bulk Validate Delete File


- A.I. Scoring
  - Score Email
  - Bulk A.I. Scoring Send File
  - Bulk A.I. Scoring Get File
  - Bulk A.I. Scoring File Status
  - Bulk A.I. Scoring Delete File


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

You need a ZeroBounce API Key to use this node.

### API Key

1. Open your ZeroBounce API dashboard [ZeroBounce API](https://www.zerobounce.net/members/API).
2. Click 'Create a new API Key'.
3. Enter a descriptive name for your key in the API Key Name field, like 'n8n integration'.
4. Set the key to active and optionally configure the IP address(es) it can be used from.
5. Toggle the API Keys' visibility and copy the value shown.

For more information, see [API Keys Management](https://www.zerobounce.net/docs/api-dashboard/#API_keys_management)

## Usage

### Workflow Testing

When testing your workflows, use [API Sandbox Mode](https://www.zerobounce.net/docs/email-validation-api-quickstart/#sandbox_mode__v2__) data.

### Send File Wait Webhook
  - Use a [Wait node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait/#on-webhook-call) to wait for a webhook confirming completion of a file
  - Set the resume mode to 'On Webhook Call'
  - Set the HTTP Method to 'POST'
  - Optional: Add a webhook suffix with the options dropdown e.g. `zerobounce`
  - Set the 'return_url' parameter in the Send File node to the webhook URL e.g. `{{$execution.resumeUrl}}/zerobounce`
  - On execution, the URL is generated and the 'Wait' node will wait until the notification is received from ZeroBounce
  - If the webhook is never called, check the HTTP Method on the wait node is set to 'POST' and view the status of the callback here [API Callback Status](https://www.zerobounce.net/members/API/status)

## Support

If you encounter an issue with this node, please [Contact Us](https://www.zerobounce.net/contact-us/).

## Compatibility

Compatible with n8n@1.60.0 or later

## Resources

* [ZeroBounce developer documentation](https://www.zerobounce.net/docs)
* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
