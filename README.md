# n8n-nodes-telli

This is an n8n community node. It lets you use telli AI phone call platform in your n8n workflows.

telli is an AI phone calling platform that lets you automate phone call operations and perform custom tasks.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

- [Installation](#installation)  
- [Actions](#actions)  
- [Credentials](#credentials)  
- [Compatibility](#compatibility)  
- [Usage](#usage)  
- [Resources](#resources)  
- [Development](#development)  

## Repository Structure

- `credentials/`: Contains credential definitions
  - `TelliApi.credentials.ts`: Defines the API key authentication for telli API

- `nodes/`: Contains the actual node implementations
  - `Telli/`: The telli node folder
    - `Telli.node.ts`: Main implementation of the telli node with all operations
    - `telli.svg`: Icon for the node in n8n

- `dist/`: Generated folder containing compiled JavaScript code (created after running `npm run build`)

- `package.json`: Defines package dependencies and n8n node registration information

## Installation

### Option 1: Install from npm

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

```bash
npm install n8n-nodes-telli
```

### Option 2: Manual installation

1. Clone this repository to your local machine
2. Install dependencies: `npm install`
3. Build the code: `npm run build`
4. Create a custom directory in your n8n installation: `mkdir -p ~/.n8n/custom`
5. Create a package.json file in the custom directory:
```json
{
  "name": "n8n-custom-nodes",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "n8n-nodes-telli": "file:///path/to/cloned/n8n-nodes-telli"
  }
}
```
6. Install the dependency: `cd ~/.n8n/custom && npm install`
7. Restart n8n

## Actions

The telli node provides the following operations, grouped by resource:

### Contact

| Operation | Description | API Docs |
| --- | --- | --- |
| Create Contact | Create a new contact with name, phone number, email, and custom properties | [Docs](https://docs.telli.com/v2/endpoint/create-contact) |
| Get Contact | Retrieve a contact by ID | [Docs](https://docs.telli.com/v2/endpoint/get-contact) |
| Get Contact by External ID | Retrieve a contact using your external system's ID | [Docs](https://docs.telli.com/v2/endpoint/get-contact-by-external-id) |
| List Contacts | List contacts with pagination and optional "Return All" toggle | [Docs](https://docs.telli.com/v2/endpoint/list-contacts) |
| Update Contact | Update an existing contact. Only provided fields are changed | [Docs](https://docs.telli.com/v2/endpoint/update-contact) |
| Delete Contact | Soft-delete a contact and anonymize all PII data | [Docs](https://docs.telli.com/v2/endpoint/delete-contact) |

### Agent

| Operation | Description | API Docs |
| --- | --- | --- |
| Get Agent | Retrieve an agent by selecting from a dropdown or specifying an ID | [Docs](https://docs.telli.com/v2/endpoint/get-agent) |
| List Agents | List agents with pagination and optional "Return All" toggle | [Docs](https://docs.telli.com/v2/endpoint/list-agents) |

### Call

| Operation | Description | API Docs |
| --- | --- | --- |
| Schedule Call | Schedule an AI phone call at the earliest opportunity within the dialer window | [Docs](https://docs.telli.com/endpoint/schedule-call) |
| Schedule Calls (Batch) | Schedule multiple calls in one request (max 50 per request) | [Docs](https://docs.telli.com/endpoint/schedule-calls-batch) |
| Get Call | Retrieve call details including transcript and analysis by call ID | [Docs](https://docs.telli.com/endpoint/get-call) |
| Initiate Call | Immediately initiate an outbound call (not recommended — prefer Schedule Call) | [Docs](https://docs.telli.com/endpoint/initiate-call) |
| Remove From Auto Dialer | Remove a contact from the auto dialer queue | [Docs](https://docs.telli.com/endpoint/remove-from-dialer) |
| Remove From Auto Dialer (Batch) | Remove multiple contacts from the auto dialer queue (max 50 per request) | [Docs](https://docs.telli.com/endpoint/remove-from-dialer-batch) |

### Contact Property

| Operation | Description | API Docs |
| --- | --- | --- |
| Create Contact Property | Define a new custom property for contacts (text, number, select, etc.) | [Docs](https://docs.telli.com/v2/endpoint/create-contact-property) |
| Get Contact Property | Retrieve a contact property by key | [Docs](https://docs.telli.com/v2/endpoint/get-contact-property) |
| List Contact Properties | List all contact properties for the account | [Docs](https://docs.telli.com/v2/endpoint/list-contact-properties) |
| Update Contact Property | Update an existing contact property's label, description, or options | [Docs](https://docs.telli.com/v2/endpoint/update-contact-property) |

### Phone Number

| Operation | Description | API Docs |
| --- | --- | --- |
| List Phone Numbers | List all active phone numbers for the account | [Docs](https://docs.telli.com/endpoint/list-phone-numbers) |
| Import Phone Number | Import a phone number from your own SIP trunk provider | [Docs](https://docs.telli.com/endpoint/import-phone-number) |
| Replace Phone Number | Replace a phone number with a new one (old number stays active for callbacks for 30 days) | [Docs](https://docs.telli.com/endpoint/replace-phone-number) |
| Delete Phone Number | Schedule a phone number for deletion (stays active for callbacks for 30 days) | [Docs](https://docs.telli.com/endpoint/delete-phone-number) |

### Deprecated (v1)

These operations use the legacy v1 API and are kept for backward compatibility with existing workflows. Use the Contact resource above for new workflows.

| Operation | Description | API Docs |
| --- | --- | --- |
| Add Contact | Add a contact using the v1 endpoint | [Docs](https://docs.telli.com/endpoint/add-contact) |
| Add Contacts (Batch) | Add multiple contacts in one request | [Docs](https://docs.telli.com/endpoint/add-contacts-batch) |
| Get Contact | Get a contact by ID using the v1 endpoint | [Docs](https://docs.telli.com/endpoint/get-contact) |
| Get Contact by External ID | Get a contact by external ID using the v1 endpoint | [Docs](https://docs.telli.com/endpoint/get-contact-by-external-id) |
| Get Contacts (Batch) | Get multiple contacts in one request | [Docs](https://docs.telli.com/endpoint/get-contacts-batch) |
| Update Contact | Update a contact using the v1 endpoint | [Docs](https://docs.telli.com/endpoint/update-contact) |
| Update Contacts (Batch) | Update multiple contacts in one request | [Docs](https://docs.telli.com/endpoint/update-contacts-batch) |

## Credentials

To use the telli nodes, you need to authenticate with the telli API:

1. Sign up for an account at [telli.com](https://telli.com/)
2. Navigate to your account settings
3. Create an API key with the necessary permissions
4. Use this API key in the telli API credentials in n8n

## Compatibility

This node has been tested with n8n version 0.171.0 and higher.

## Usage

### Create Contact Example

1. Add the telli node to your workflow
2. Select the **Contact** resource and **Create Contact** operation
3. Fill in the required fields (First Name, Last Name, Phone Number)
4. Optionally add email, external ID, salutation, timezone, and custom properties
5. Properties can be added using the field editor or as a JSON array: `[{"key": "company", "value": "Acme"}]`

### Schedule Call Example

1. Add the telli node to your workflow
2. Select the **Call** resource and **Schedule Call** operation
3. Enter the Contact ID and select an Agent from the dropdown
4. Optionally set max retry days and override the from number
5. The call will be scheduled at the earliest opportunity within the agent's dialer window

### List Contacts with Pagination

1. Add the telli node to your workflow
2. Select the **Contact** resource and **List Contacts** operation
3. Toggle **Return All** to fetch every contact, or set a **Limit** for a single page

### Manage Contact Properties

1. Add the telli node to your workflow
2. Select the **Contact Property** resource
3. Use **Create Contact Property** to define new fields (e.g., a "Company" text field or a "Status" select field)
4. For `select` and `multi_select` types, add options using the field editor or as JSON: `[{"value": "a", "label": "Option A"}]`

### Delete Contact Example

1. Add the telli node to your workflow
2. Select the **Contact** resource and **Delete Contact** operation
3. Enter the Contact ID
4. **Warning**: This soft-deletes the contact and anonymizes all PII data

### Remove from Auto Dialer Example

1. Add the telli node to your workflow
2. Select the **Call** resource and **Remove From Auto Dialer** operation
3. Enter the Contact ID
4. This stops the contact from receiving automated calls without deleting their data

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [telli API documentation](https://docs.telli.com/)
* [telli website](https://telli.com/)

## Development

### Making Changes and Rebuilding Locally

Refer to the n8n docs on how to run nodes locally: [docs](https://docs.n8n.io/integrations/creating-nodes/test/run-node-locally/)

1. Make your changes to the code (e.g., in `nodes/Telli/Telli.node.ts`)

2. Build the project:
```bash
npm run build
```

3. Copy the built files to your n8n custom directory:
```bash
cp -r dist/* ~/.n8n/custom/n8n-nodes-telli/ # or wherever your custom directory is
```

4. Restart n8n to see your changes:
```bash
# First kill the current n8n process (Ctrl+C), then run:
n8n start
```

### Development Workflow Tips

- Use `npm run dev` to continuously build the code as you make changes
- Check for linting errors with `npm run lint`
- Format code with `npm run format`

### Troubleshooting

If you don't see your changes after rebuilding and restarting n8n:

1. Check if there are any errors in the n8n logs
2. Verify that the files were correctly copied to the custom directory
3. Make sure n8n was properly restarted
4. Clear your browser cache or open n8n in an incognito window
