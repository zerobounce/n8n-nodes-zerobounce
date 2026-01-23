![ZeroBounce Logo](https://raw.githubusercontent.com/zerobounce/n8n-nodes-zerobounce/main/icons/zb-logo-purple.svg)

# n8n-nodes-zerobounce

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation
platform.

**This is the [Official ZeroBounce](https://n8n.io/integrations/zerobounce) n8n community node for use in your n8n
workflows.**

* [Key Features](#key-features)
* [About](#about)
* [Installation](#installation)
* [Operations](#operations)
    * [Validation](#-validation)
    * [A.I. Scoring](#-ai-scoring)
    * [Email Finder](#-email-finder)
    * [Domain Search](#-domain-search)
    * [Activity Data](#-activity-data)
    * [Account](#-account)
* [Credentials](#credentials)
* [Usage](#usage)
    * [Workflow Testing](#-workflow-testing)
    * [Single Email Validation](#-single-email-validation)
    * [Bulk File Webhook Integration](#-bulk-file-webhook-integration-wait-node)
* [Support](#support)
* [Compatibility](#compatibility)
* [Resources](#resources)

## 💡Key Features

- 🛡️ **Validation:** Detect invalid, abuse, and spam trap addresses before they impact your sender reputation.
- 🎯 **A.I. Scoring:** Go beyond validation with AI-driven deliverability scores, great for catch-all addresses.
- 🔍 **Lead Discovery:** Integrated Email Finder and Domain Search tools to build and verify your outreach lists.
- 📊 **Usage Analytics:** Monitor API usage and credit balances to ensure uninterrupted and efficient service.

---

## About

Validate and score email addresses with the official **ZeroBounce** node to improve email deliverability and protect
your domain reputation.

### About ZeroBounce

**[ZeroBounce](https://www.zerobounce.net)** is an award-winning email verification and deliverability platform designed
to help businesses maintain high-quality email lists and improve their inbox placement.

Trusted by over 500,000 clients—including major brands like Samsung, Coca-Cola, and LinkedIn; we specialize in
identifying risky email addresses to reduce bounce rates and increase engagement.

#### Core Services & Features

- **Email Validation:** Offers 99.6% accurate real-time and bulk email verification to identify invalid, disposable,
  abuse, and spam trap addresses.
- **A.I. Email Scoring:** Uses artificial intelligence to analyze "catch-all" or valid addresses and assign a score (
  1–10) based on the likelihood of reaching a real person.
- **Email Activity Data:** Provides insights into a subscriber’s recent behavior (opens, clicks, unsubscribes) to help
  with list segmentation.
- **Deliverability Tools:** Includes DMARC monitoring, 24/7 blacklist monitoring, inbox placement testing, and email
  server testing.
- **Email Finder & Warmup:** A B2B search tool to find professional contacts and an automated service to build or repair
  a domain’s sender reputation.

#### Security & Performance

ZeroBounce maintains high standards for security and reliability, featuring:

- **Compliance:** The platform is SOC 2 Type 2 and ISO-27001 certified, and fully compliant with GDPR, HIPAA, and CCPA.
- **Reliability:** Guarantees 99.99% API reliability with one of the industry's lowest "unknown" result rates (averaging
  1.69% in 2024).
- **24/7 Support:** Provides round-the-clock live chat and email support with an average response time of under 20
  seconds for chat.

---

## Installation

The ZeroBounce node can be found in the n8n nodes list.

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community
nodes documentation.

---

## Operations

### 🛡️ Validation

| Operation         | Description                                                  |
|:------------------|:-------------------------------------------------------------|
| Validate Email    | Check a single email for validity, sub-status, and metadata. |
| Validate Batch    | Validate up to 200 email addresses in a single request.      |
| Bulk: Send File   | Upload a CSV or TXT file for large-scale list cleaning.      |
| Bulk: Get File    | Download the processed results of a bulk validation job.     |
| Bulk: File Status | Monitor the real-time progress of a file being validated.    |
| Bulk: Delete File | Permanently remove a processed file from ZeroBounce servers. |

### 🤖 A.I. Scoring

| Operation         | Description                                                 |
|:------------------|:------------------------------------------------------------|
| Score Email       | Get an AI-driven quality score (1-10) for a single email.   |
| Bulk: Send File   | Upload a file to score multiple "catch-all" or valid leads. |
| Bulk: Get File    | Download the AI scoring results for your uploaded file.     |
| Bulk: File Status | Check the percentage completion of an AI scoring job.       |
| Bulk: Delete File | Delete an AI scoring file once processing is finished.      |

### 🔍 Email Finder

| Operation          | Description                                                               |
|:-------------------|:--------------------------------------------------------------------------|
| Find Email Address | Discover professional emails using a person's name and domain or company. |
| Bulk: Send File    | Upload a list of names and domains to find emails at scale.               |
| Bulk: Get File     | Retrieve the results of a bulk email finder operation.                    |
| Bulk: File Status  | Track the status of a bulk email finding request.                         |
| Bulk: Delete File  | Remove a bulk email finder file from your dashboard.                      |

### 🌐 Domain Search

| Operation         | Description                                                   |
|:------------------|:--------------------------------------------------------------|
| Domain Search     | Find email address formats associated with a specific domain. |
| Bulk: Send File   | Submit a file of domains to perform a bulk search.            |
| Bulk: Get File    | Download the results of a bulk domain search.                 |
| Bulk: File Status | Monitor the progress of a bulk domain search job.             |
| Bulk: Delete File | Clean up your domain search history by deleting files.        |

## 📊 Activity Data

| Operation         | Description                                                   |
|:------------------|:--------------------------------------------------------------|
| Get Activity Data | Retrieve metadata regarding a user's recent email engagement. |

### 💳 Account

| Operation       | Description                                                    |
|:----------------|:---------------------------------------------------------------|
| Credits Balance | Check the remaining credits in your ZeroBounce account.        |
| API Usage       | Get a breakdown of your API usage over a specific time period. |
| List Filters    | View all active allow/block filters.                           |
| Add Filter      | Add a filter to your allow/block lists.                        |
| Delete Filter   | Remove a filter from your allow/block lists.                   |

---

## Credentials

You need a ZeroBounce API Key to use this node. Follow the steps below to generate one for free.

### 🔑 API Key

1. Open your ZeroBounce API dashboard [ZeroBounce API](https://www.zerobounce.net/members/API).
2. Click 'Create a new API Key'.
3. Enter a descriptive name for your key in the API Key Name field, like 'n8n integration'.
4. Set the key to active and optionally configure the IP address(es) it can be used from.
5. Toggle the API Keys' visibility and copy the value shown.

For more information, see [API Keys Management](https://www.zerobounce.net/docs/api-dashboard/#API_keys_management)

---

## Usage

### 🧪 Workflow Testing

Use [API Sandbox Mode](https://www.zerobounce.net/docs/email-validation-api-quickstart/#sandbox_mode__v2__)
data to test workflows without using your ZeroBounce credits.

---

### 🛡 Single Email Validation

The Validate Email operation allows you to verify a single email address in real-time.
This is ideal for cleaning leads from signup forms, chat interfaces, or individual CRM entries.

#### 🛠️ Step-by-Step Setup

1. **Add the Node:** Add the **ZeroBounce** node to your n8n canvas and select the **Validate** operation.
2. **Enter Email:** In the Email field, provide the address you wish to check.
   Use an expression to pull data from a previous node (e.g., `{{ $json.email }}` or
   `{{ $('Shopify customer created').item.json.email }}`).
3. **Add Options:** Use the `Add option` button to add optional fields
4. **Execute:** Run the node to receive the validation results.

#### ⚙️ Parameters

While only the email address is required, you can refine your results using the following optional parameters found in
the node's settings:

| Parameter             | Optional | Description                                                                                                                                                                                                                                                                                |
|:----------------------|:---------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Email                 |          | The email address you want to validate                                                                                                                                                                                                                                                     |
| IP Address            | ✔️       | Provide the user's IP address (IPv4) to gain location metadata (Country, City, Zip) and check if the IP is associated with known proxy/VPN usage.                                                                                                                                          |
| Include Activity Data | ✔️       | Provides metadata about the user's recent engagement, such as the last time they opened, clicked, or forwarded an email (e.g., within 30, 90, or 180 days).                                                                                                                                |
| Verify+               | ✔️       | Read before enabling: [Verify+](https://www.zerobounce.net/docs/email-list-validation/verify-plus#Verify_Plus). Significantly reduces "Catch-all" results. It uses proprietary technology to provide a definitive valid or invalid status for many domains that normally return catch-all. |
| Timeout (Seconds)     | ✔️       | Adjust the maximum time (in seconds) the node should wait for a response from the API. Default is typically sufficient for most workflows. When a request exceeds this timeout, the API will return unknown / greylisted.                                                                  |

#### 📊 Understanding the Response

A successful execution returns a JSON object with the following key fields:

- **Status:** The core result (e.g., `valid`, `invalid`, `catch-all`, `spamtrap`, `abuse`, `do_not_mail`, `unknown`).
- **Sub Status:** Detailed reasoning for the status (e.g., `mailbox_not_found`, `global_suppression`, `possible_trap`).
- **Account / Domain:** Parsed components of the email address.
- **Did You Mean:** A suggestion if the API detects a common typo (e.g., `john@gnail.com` suggests `john@gmail.com`).
- **Flags:** Boolean flags for `free_email`, `disposable`, and `role_based` accounts.
- **Metadata:** Information such as the domain's MX records, SMTP provider, and (if IP was provided) geographic data.

##### ✨ Example Response:

```json
{
  "address": "support@zerobounce.net",
  "status": "do_not_mail",
  "sub_status": "role_based_catch_all",
  "free_email": false,
  "did_you_mean": null,
  "account": "support",
  "domain": "zerobounce.net",
  "domain_age_days": "3286",
  "smtp_provider": "g-suite",
  "mx_found": "true",
  "mx_record": "aspmx.l.google.com",
  "firstname": null,
  "lastname": null,
  "gender": null,
  "country": "United States",
  "region": "Florida",
  "city": "Boca Raton",
  "zipcode": "33428",
  "processed_at": "2026-01-23 14:50:00.159"
}
```

#### 💡 Pro Tip: Logic Routing

After this node, use a Switch or If node to route your workflow:

- **If Status = `valid`:** Route to your "Valid" path, e.g. create a CRM contact
- **If Status = `catch-all`:** Route to the AI Scoring node for further vetting
- **If Status = `invalid` (or fallback):** Route to "Rejected" path, e.g. add entry to a table for manual review

As used in
this [Example Template: Single Validation Lead Vetting](https://n8n.io/workflows/12601-vet-new-shopify-leads-with-zerobounce-and-sync-qualified-contacts-to-hubspot/)

---

### 🛡 Batch Email Validation

The Batch Validate Email operation allows you to verify up to 200 email addresses in real-time.
This is ideal for processing small lists of leads retrieved from a database, an API, or a previous n8n node without the
overhead of file uploads.

This request is rate limited,
see [Batch Email Validation API Documentation](https://www.zerobounce.net/docs/email-validation-api-quickstart/v2-batch-validate-emails).

#### 🛠️ Step-by-Step Setup

1. **Add the Node:** Add the **ZeroBounce** node to your n8n canvas and select the **Validate Batch** operation.
2. **Combine Items:** Enabled by default,
    - **Enabled (default):** Combines multiple input items into a single request.
    - **Disabled:** Handles each input item as a batch request. The data should already be batched.
3. **Split Items:**
    - **Enabled (default):** Splits the response into individual items for individual processing.
    - **Disabled:** The response is returned as-is with an array of results and an array of errors.
4. **Enter Data:** Data is intelligently extracted from one of the three **Item Input Types** (scanning for email and
   IP address fields, e.g. `email`, `email_address`, `ip`, `ip_address` etc.):
    - **Field Assignment:** Drag and drop fields from previous node outputs to map a field, object or array from input
      items which already contain the email/IP fields.
        - **Object/Field:** Use with 'Combine Items' enabled, an email from each item will be combined into an
          array in a single batch request.
        - **Array:** The values will be extracted from this array and sent in the batch request.If 'Combine Items'
          is enabled, arrays will be joined)
    - **JSON Input:** Freeform JSON to be used as the input. Useful when you already have JSON in the correct format.
        - **Expected format:** ```{ "data": [ {"email_address": "valid@example.com", "ip_address": "99.110.204.1" } ] }```
    - **Mapped:** Map individual email/IP fields from input items
        - With 'Combine Items' enabled the values from each input item will be combined into a single array in the batch
          request.
5. **Add Options:** Use the `Add option` button to add optional fields
6. **Execute:** Run the node to receive the validation results.

#### ⚙️ Parameters

While only the input data containing email addresses is required, you can refine your results using the following
optional parameters found in
the node's settings:

| Parameter                  | Optional | Description                                                                                                                                                                                                                                                                                |
|:---------------------------|:---------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Item Input: Email(s)       |          | The email address(es) you want to validate. This can be a field, object or array from your input items, optionally combined to create a single batch request.                                                                                                                              |
| Item Input: IP Address(es) | ✔️       | Pair an email address with an IP address (IPv4) to gain location metadata (Country, City, Zip) and check if the IP is associated with known proxy/VPN usage.                                                                                                                               |
| Include Activity Data      | ✔️       | Provides metadata about the user's recent engagement, such as the last time they opened, clicked, or forwarded an email (e.g., within 30, 90, or 180 days).                                                                                                                                |
| Verify+                    | ✔️       | Read before enabling: [Verify+](https://www.zerobounce.net/docs/email-list-validation/verify-plus#Verify_Plus). Significantly reduces "Catch-all" results. It uses proprietary technology to provide a definitive valid or invalid status for many domains that normally return catch-all. |
| Timeout (Seconds)          | ✔️       | Adjust the maximum time (3 - 60 seconds) the node should wait for a response from the API. Default is typically sufficient for most workflows. When a request exceeds this timeout, the API will return unknown / greylisted.                                                              |

#### 📊 Understanding the Response

A successful execution returns a JSON object with the following fields:

- **Split Items Enabled (default):**
    - An output item per email containing validation results.
      See [Example Validation Response](#-example-response)
- **Split Items Disabled:**
    - `email_batch`: An array of validation results.
      See [Example Validation Response](#-example-response)
    - `errors`: An array of errors

#### 💡 Pro Tip: Handling Large Lists (> 200 items)

If your workflow needs to validate more than 200 emails at once, you should implement a Looping & Merging pattern:

- **Split into Batches:** Use the **Loop** node to chunk your data into batches of 200.
- **Loop:** Connect the 'loop' output of the **Loop** node to the **Validate Email Batch** node.
- **Validate:** Connect the **Validate Email Batch** node output to the **Loop** node input.
- **Results:** Connect the 'done' output of the **Loop** node to the rest of your workflow.

#### ⚡ Optional enhancement: Merge Validation Results

- **Merge Results:** After the loop, you can use a **Merge** node to join the validation results with your original
  items using the email address as the unique identifier.
    - This enriches your original data with the new validation results for easier handling in the rest of your workflow.
    - Connect the output of the node before the loop to 'Input 1' of your **Merge** node.
    - Connect the 'done' output of the **Loop** node to 'Input 2' of your **Merge** node.
    - Configure the **Merge** node to 'Combine By: Matching Fields' and choose `email_address` for Input 1 and `address`
      for Input 2.

---

### ⏳ Bulk File Webhook Integration (Wait Node)

See our
[Example Template: Bulk Validation](https://n8n.io/workflows/11538-bulk-email-validation-and-ai-scoring-with-zerobounce/)

To efficiently handle bulk files without manual polling:

1. Add a [Wait node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait/#on-webhook-call)
   to your workflow.
2. Set it to 'On Webhook Call' with the HTTP Method set to 'POST'.
3. Optional: Add a webhook suffix with the options dropdown e.g. `zerobounce`.
4. In the **Send File** node, set the `Return URL` field to the auto-generated webhook URL e.g.
   `{{$execution.resumeUrl}}` or `{{$execution.resumeUrl}}/zerobounce`
5. The workflow will pause and automatically resume when ZeroBounce sends the completion notification.
6. Optional: The status of webhook calls can be viewed
   here [API Callback Status](https://www.zerobounce.net/members/API/status)

#### ⚡ Optional enhancement: Add Timeout and Status Checks

Adding a wait timeout and manual status check can prevent delayed or abandoned executions when there is an issue with a
callback, e.g. network connectivity issues.

1. Add a timeout to the **Wait** node (e.g. 5 minutes) using the `Limit Wait Time` field and `Limit Type` set to
   `After Time Interval`
2. Add a **File Status** node to check on the processing status of the file
3. Add a **Switch** node with 3 branches checking `{{ $json.file_status }}`:
    1. **`Complete`:** Completed, get the processed file
    2. **`Processing`:** In progress, loop back into your wait node
    3. **`Failed` (or fallback):** The file failed to process, exit and review the reason it failed

---

## Support

If you encounter an issue with this node, please [Contact Us](https://www.zerobounce.net/contact-us/).

---

## Compatibility

Compatible with n8n@1.60.0 or later

---

## Resources

* [ZeroBounce Website](https://zerobounce.net)
* [ZeroBounce API Developer Documentation](https://www.zerobounce.net/docs)
* [ZeroBounce API Dashboard](https://www.zerobounce.net/members/API)
* [ZeroBounce API Callback Status](https://www.zerobounce.net/members/API/status)
* [Example Template: Bulk Validation](https://n8n.io/workflows/11538-bulk-email-validation-and-ai-scoring-with-zerobounce/)
* [Example Template: Single Validation](https://n8n.io/workflows/11498-validate-and-score-email-addresses-with-zerobounce-ai/)
* [Example Template: Single Validation Lead Vetting](https://n8n.io/workflows/12601-vet-new-shopify-leads-with-zerobounce-and-sync-qualified-contacts-to-hubspot/)
* [Example Template: Validate & score leads with ZeroBounce AI before sending Gmail emails](https://n8n.io/workflows/11902-validate-and-score-leads-with-zerobounce-ai-before-sending-gmail-emails/)
* [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/#community-nodes)
