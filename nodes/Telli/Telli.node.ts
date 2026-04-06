import {
	GenericValue,
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

const API_ROOT_URL = 'https://api.telli.com';
const V1_API_URL = `${API_ROOT_URL}/v1`;
const V2_API_URL = `${API_ROOT_URL}/v2`;

export class Telli implements INodeType {

	methods = {
		loadOptions: {
			async getAgents(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
					method: 'GET',
					url: `${V2_API_URL}/agents`,
					headers: {
						'Content-Type': 'text/plain',
					},
					qs: {
						limit: 100,
					},
				});

				if (!response || typeof response !== 'object' || !('data' in response)) {
					return [];
				}

				const agents = (response as IDataObject).data;

				if (!Array.isArray(agents)) {
					return [];
				}

				return agents
					.filter((agent): agent is IDataObject => !!agent && typeof agent === 'object' && !Array.isArray(agent))
					.map((agent) => {
						const id = typeof agent.id === 'string' ? agent.id : '';
						const title = typeof agent.title === 'string' && agent.title ? agent.title : 'Untitled Agent';

						return {
							name: id ? `${title} (${id})` : title,
							value: id,
						};
					})
					.filter((agent) => !!agent.value);
			},
		},
	};

	description: INodeTypeDescription = {
		displayName: 'telli',
		name: 'telli',
		icon: 'file:telli.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with the telli API',
		defaults: {
			name: 'telli',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'telliApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Agent', value: 'agent' },
					{ name: 'Call', value: 'call' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Contact Property', value: 'contactProperty' },
					{ name: 'Deprecated', value: 'deprecated' },
					{ name: 'Phone Number', value: 'phoneNumber' },
				],
				default: 'contact',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['agent'] } },
				options: [
					{ name: 'Get Agent', value: 'get-agent-v2', action: 'Get an agent', description: 'Get an agent by ID' },
					{ name: 'List Agents', value: 'list-agents-v2', action: 'List agents' },
				],
				default: 'list-agents-v2',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['call'] } },
				options: [
					{ name: 'Get Call', value: 'get-call-v1', action: 'Get a call', description: 'Get call details by call ID' },
					{ name: 'Initiate Call', value: 'initiate-call-v1', action: 'Initiate a call', description: 'Immediately initiate an outbound call' },
					{ name: 'Remove From Auto Dialer', value: 'remove-from-auto-dialer', action: 'Remove a contact from auto dialer', description: 'Remove a contact from the auto dialer queue' },
					{ name: 'Remove From Auto Dialer (Batch)', value: 'remove-from-auto-dialer-batch-v1', action: 'Remove contacts from auto dialer in batch' },
					{ name: 'Schedule Call', value: 'schedule-telli-call', action: 'Schedule a call with telli', description: 'Schedule a call with telli' },
					{ name: 'Schedule Calls (Batch)', value: 'schedule-calls-batch-v1', action: 'Schedule calls in batch', description: 'Schedule multiple calls in one request' },
				],
				default: 'schedule-telli-call',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['contact'] } },
				options: [
					{ name: 'Create Contact', value: 'create-contact-v2', action: 'Create a contact', description: 'Create a contact using the v2 API' },
					{ name: 'Delete Contact', value: 'delete-contact-v2', action: 'Delete a contact', description: 'Delete a contact using the v2 API' },
					{ name: 'Get Contact', value: 'get-contact-v2', action: 'Get a contact', description: 'Get a contact by ID using the v2 API' },
					{ name: 'Get Contact by External ID', value: 'get-contact-by-external-id-v2', action: 'Get a contact by external ID', description: 'Get a contact by external ID using the v2 API' },
					{ name: 'List Contacts', value: 'list-contacts-v2', action: 'List contacts', description: 'List contacts using the v2 API' },
					{ name: 'Update Contact', value: 'update-contact-v2', action: 'Update a contact', description: 'Update a contact using the v2 API' },
				],
				default: 'list-contacts-v2',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['contactProperty'] } },
				options: [
					{ name: 'Create Contact Property', value: 'create-contact-property-v2', action: 'Create a contact property', description: 'Create a contact property' },
					{ name: 'Get Contact Property', value: 'get-contact-property-v2', action: 'Get a contact property', description: 'Get a contact property by key' },
					{ name: 'List Contact Properties', value: 'list-contact-properties-v2', action: 'List contact properties' },
					{ name: 'Update Contact Property', value: 'update-contact-property-v2', action: 'Update a contact property', description: 'Update a contact property' },
				],
				default: 'list-contact-properties-v2',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['deprecated'] } },
				options: [
					{ name: 'Add Contact', value: 'add-telli-contact', action: 'Add a new contact to telli', description: 'Add a contact using the v1 endpoint' },
					{ name: 'Add Contacts (Batch)', value: 'add-telli-contacts-batch', action: 'Add contacts in batch', description: 'Add multiple contacts using the v1 batch endpoint' },
					{ name: 'Get Contact', value: 'get-telli-contact', action: 'Get a contact', description: 'Get a contact by ID using the v1 endpoint' },
					{ name: 'Get Contact by External ID', value: 'get-contact-by-external-id', action: 'Get contact by external ID', description: 'Get a contact by external ID using the v1 endpoint' },
					{ name: 'Get Contacts (Batch)', value: 'get-telli-contacts-batch', action: 'Get contacts in batch', description: 'Get multiple contacts using the v1 batch endpoint' },
					{ name: 'Update Contact', value: 'update-telli-contact', action: 'Update a contact in telli', description: 'Update a contact using the v1 endpoint' },
					{ name: 'Update Contacts (Batch)', value: 'update-telli-contacts-batch', action: 'Update contacts in batch', description: 'Update multiple contacts using the v1 batch endpoint' },
				],
				default: 'add-telli-contact',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['phoneNumber'] } },
				options: [
					{ name: 'Delete Phone Number', value: 'delete-phone-number-v1', action: 'Delete a phone number', description: 'Delete a phone number' },
					{ name: 'Import Phone Number', value: 'import-phone-number-v1', action: 'Import a phone number', description: 'Import a phone number via SIP trunk' },
					{ name: 'List Phone Numbers', value: 'list-phone-numbers-v1', action: 'List phone numbers', description: 'List active phone numbers' },
					{ name: 'Replace Phone Number', value: 'replace-phone-number-v1', action: 'Replace a phone number', description: 'Replace a phone number with a new one' },
				],
				default: 'list-phone-numbers-v1',
			},

			// add-contact
            {
                displayName: 'External Contact ID',
                name: 'externalContactId',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        operation: ['add-telli-contact'],
                    },
                },
                description: 'Your unique internal identifier for the contact',
                required: true,
            },
			{
                displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				placeholder: 'John',
				displayOptions: {
                    show: {
                        operation: ['add-telli-contact'],
					},
				},
				required: true,
				description: 'The first name of the contact',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				placeholder: 'Doe',
				displayOptions: {
					show: {
						operation: ['add-telli-contact'],
					},
				},
				required: true,
				description: 'The last name of the contact',
			},
			{
                displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				default: '',
				placeholder: '+1 (234) 567-8901',
				displayOptions: {
                    show: {
                        operation: ['add-telli-contact'],
					},
				},
                required: true,
				description: 'Contact\'s phone number in E.164 format (e.g. +4917642048466)',
			},
            {
                displayName: 'Email',
                name: 'email',
                type: 'string',
                placeholder: 'name@email.com',
                default: '',
                displayOptions: {
                    show: {
                        operation: ['add-telli-contact'],
                    },
                },
                description: 'The email of the contact',
            },
			{
				displayName: 'Salutation',
				name: 'salutation',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['add-telli-contact'],
					},
				},
				description: 'Formal title or greeting (e.g. "Mr.", "Ms.", "Herr", "Frau"). If empty, will auto guess based on first name for German calls.',
			},
			{
				displayName: 'Timezone',
				name: 'timezone',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['add-telli-contact'],
					},
				},
				description: 'IANA timezone identifier (e.g. Europe/Berlin). Defaults to account timezone if not set.',
			},
			{
				displayName: 'Contact Details',
				name: 'contactDetails',
				placeholder: 'Add Contact Detail',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						operation: ['add-telli-contact'],
					},
				},
                description: 'Custom variables passed to the AI agent (should be discussed in advance). Please send variables in lowercase snake_case. This used to be called dynamic_variables, which still works but is deprecated and should be replaced with contact_details. Alternatively, you can send contact_details_&lt;key&gt; in the body instead of an object.',
				default: {},
				options: [
					{
						name: 'details',
						displayName: 'Detail',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'Key of the detail',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the detail',
							},
						],
					},
				],
			},

			// update-contact
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				default: '',
				placeholder: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
				displayOptions: {
					show: {
						operation: ['update-telli-contact'],
					},
				},
				required: true,
				description: 'The telli contact ID to update',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				placeholder: 'John',
				displayOptions: {
					show: {
						operation: ['update-telli-contact'],
					},
				},
				description: 'The first name of the contact',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				placeholder: 'Doe',
				displayOptions: {
					show: {
						operation: ['update-telli-contact'],
					},
				},
				description: 'The last name of the contact',
			},
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				default: '',
				placeholder: '+1 (234) 567-8901',
				displayOptions: {
					show: {
						operation: ['update-telli-contact'],
					},
				},
				description: 'Contact\'s phone number in E.164 format (e.g. +4917642048466)',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				displayOptions: {
					show: {
						operation: ['update-telli-contact'],
					},
				},
				description: 'The email of the contact',
			},
			{
				displayName: 'External Contact ID',
				name: 'externalContactId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['update-telli-contact'],
					},
				},
				description: 'Your unique internal identifier for the contact',
			},
			{
				displayName: 'External URL',
				name: 'externalUrl',
				type: 'string',
				default: '',
				placeholder: 'https://crm.example.com/contact/123',
				displayOptions: {
					show: {
						operation: ['update-telli-contact'],
					},
				},
				description: 'External URL linking to the contact in your CRM or external system',
			},
			{
				displayName: 'Salutation',
				name: 'salutation',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['update-telli-contact'],
					},
				},
				description: 'Formal title or greeting (e.g. "Mr.", "Ms.", "Herr", "Frau"). If empty, will auto guess based on first name for German calls.',
			},
			{
				displayName: 'Timezone',
				name: 'timezone',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['update-telli-contact'],
					},
				},
				description: 'IANA timezone identifier (e.g. Europe/Berlin). Defaults to account timezone if not set.',
			},
			{
				displayName: 'Contact Details',
				name: 'contactDetails',
				placeholder: 'Add Contact Detail',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						operation: ['update-telli-contact'],
					},
				},
				description: 'Custom variables passed to the AI agent. The entire object will be overwritten. Please send variables in lowercase snake_case.',
				default: {},
				options: [
					{
						name: 'details',
						displayName: 'Detail',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'Key of the detail',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the detail',
							},
						],
					},
				],
			},

			// remove-from-auto-dialer
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				default: '',
				placeholder: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
				displayOptions: {
					show: {
						operation: ['remove-from-auto-dialer'],
					},
				},
				required: true,
				description: 'The telli contact ID to remove from the auto dialer queue',
			},

			// schedule-call
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				default: '',
				placeholder: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
				displayOptions: {
					show: {
						operation: ['schedule-telli-call'],
					},
				},
				required: true,
				description: 'ID of the contact to schedule call with',
			},
			{
				displayName: 'Agent Name or ID',
				name: 'agentId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getAgents',
				},
				options: [],
				default: '',
				displayOptions: {
					show: {
						operation: ['schedule-telli-call'],
					},
				},
				required: true,
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Max Retry Days',
				name: 'maxRetryDays',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						operation: ['schedule-telli-call'],
					},
				},
				description: 'Number of days to retry the call. Leave at 0 to use the account default.',
			},
			{
				displayName: 'Override From Number',
				name: 'overrideFromNumber',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['schedule-telli-call'],
					},
				},
				description: 'Override the from number for the call',
			},

			// get-contact-by-external-id
			{
				displayName: 'External Contact ID',
				name: 'externalContactId',
				type: 'string',
				default: '',
				placeholder: 'your-internal-contact-ID-123',
				displayOptions: {
					show: {
						operation: ['get-contact-by-external-id'],
					},
				},
				required: true,

				description: 'Your unique internal identifier for the contact',
			},

			// v2 contacts and agents list limits
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['list-contacts-v2', 'list-agents-v2'],
					},
				},
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'listLimit',
				type: 'number',
				default: 50,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				displayOptions: {
					show: {
						operation: ['list-contacts-v2', 'list-agents-v2'],
						returnAll: [false],
					},
				},
				description: 'Maximum number of results to return',
			},

			{
				displayName: 'Agent Name or ID',
				name: 'agentResourceId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getAgents',
				},
				options: [],
				default: '',
				displayOptions: {
					show: {
						operation: ['get-agent-v2'],
					},
				},
				required: true,
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			// shared UUID identifier
			{
				displayName: 'ID',
				name: 'resourceId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'get-contact-v2',
							'update-contact-v2',
							'delete-contact-v2',
							'get-call-v1',
							'replace-phone-number-v1',
							'delete-phone-number-v1',
						],
					},
				},
				required: true,
				description: 'Resource identifier',
			},

			// v2 contact fields
			{
				displayName: 'First Name',
				name: 'v2FirstName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['create-contact-v2', 'update-contact-v2'],
					},
				},
				description: 'Contact first name',
			},
			{
				displayName: 'Last Name',
				name: 'v2LastName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['create-contact-v2', 'update-contact-v2'],
					},
				},
				description: 'Contact last name',
			},
			{
				displayName: 'Phone Number',
				name: 'v2PhoneNumber',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['create-contact-v2', 'update-contact-v2'],
					},
				},
				description: 'Contact phone number in E.164 format',
			},
			{
				displayName: 'External ID',
				name: 'v2ExternalId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['create-contact-v2', 'update-contact-v2', 'get-contact-by-external-id-v2'],
					},
				},
				description: 'External contact identifier',
			},
			{
				displayName: 'External URL',
				name: 'v2ExternalUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['create-contact-v2', 'update-contact-v2'],
					},
				},
				description: 'Link to contact in external system',
			},
			{
				displayName: 'Salutation',
				name: 'v2Salutation',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['create-contact-v2', 'update-contact-v2'],
					},
				},
				description: 'Formal greeting',
			},
			{
				displayName: 'Timezone (IANA)',
				name: 'v2TimezoneIana',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['create-contact-v2', 'update-contact-v2'],
					},
				},
				description: 'IANA timezone identifier (for example Europe/Berlin)',
			},
			{
				displayName: 'Email',
				name: 'v2Email',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['create-contact-v2', 'update-contact-v2'],
					},
				},
				description: 'Contact email address',
			},
			// v2 properties mode toggle + fields
			{
				displayName: 'Properties Mode',
				name: 'v2PropertiesMode',
				type: 'options',
				options: [
					{ name: 'Using Fields Below', value: 'fields' },
					{ name: 'Using JSON', value: 'json' },
				],
				default: 'fields',
				displayOptions: {
					show: {
						operation: ['create-contact-v2', 'update-contact-v2'],
					},
				},
				description: 'How to specify custom contact properties',
			},
			{
				displayName: 'Properties',
				name: 'v2PropertiesCollection',
				placeholder: 'Add Property',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				displayOptions: {
					show: {
						operation: ['create-contact-v2', 'update-contact-v2'],
						v2PropertiesMode: ['fields'],
					},
				},
				description: 'Custom contact properties as key/value pairs',
				options: [
					{
						name: 'items',
						displayName: 'Property',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'Property key',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Property value. For multi-select use a JSON array e.g. ["opt1","opt2"]. Numbers and booleans are auto-detected.',
							},
						],
					},
				],
			},
			{
				displayName: 'Properties (JSON)',
				name: 'v2Properties',
				type: 'json',
				default: '[]',
				displayOptions: {
					show: {
						operation: ['create-contact-v2', 'update-contact-v2'],
						v2PropertiesMode: ['json'],
					},
				},
				description: 'Custom properties as a JSON array of {key, value} objects. Example: [{"key": "company", "value": "Acme"}].',
			},

			// old v1 get contact
			{
				displayName: 'Contact ID',
				name: 'deprecatedContactId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['get-telli-contact'],
					},
				},
				required: true,
				description: 'The telli contact ID to retrieve',
			},

			// batch payloads
			{
				displayName: 'Contacts (JSON)',
				name: 'contactsBatch',
				type: 'json',
				default: '[]',
				displayOptions: {
					show: {
						operation: ['add-telli-contacts-batch', 'update-telli-contacts-batch'],
					},
				},
				description: 'Array of contacts for batch operations',
			},
			{
				displayName: 'Contact IDs (JSON)',
				name: 'contactIdsBatch',
				type: 'json',
				default: '[]',
				displayOptions: {
					show: {
						operation: ['get-telli-contacts-batch', 'remove-from-auto-dialer-batch-v1'],
					},
				},
				description: 'JSON array of telli contact IDs (UUIDs). Example: ["3c90c3cc-0d44-4b50-8888-8dd25736052a", "4d01d4dd-..."].',
			},
			{
				displayName: 'Limit',
				name: 'batchLimit',
				type: 'number',
				default: 10,
				typeOptions: {
					minValue: 1,
				},
				displayOptions: {
					show: {
						operation: ['get-telli-contacts-batch'],
					},
				},
				description: 'Max number of returned contacts for batch get',
			},
			{
				displayName: 'Calls (JSON)',
				name: 'scheduleCallsBatch',
				type: 'json',
				default: '[]',
				displayOptions: {
					show: {
						operation: ['schedule-calls-batch-v1'],
					},
				},
				description: 'JSON array of call objects. Each object requires contact_id and agent_id. Example: [{"contact_id": "uuid", "agent_id": "uuid", "max_retry_days": 3}]. Max 50 per request.',
			},

			// call operations
			{
				displayName: 'Contact ID',
				name: 'callContactId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['initiate-call-v1'],
					},
				},
				required: true,
				description: 'Contact identifier',
			},
			{
				displayName: 'Agent Name or ID',
				name: 'callAgentId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getAgents',
				},
				options: [],
				default: '',
				displayOptions: {
					show: {
						operation: ['initiate-call-v1'],
					},
				},
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Max Retry Days',
				name: 'callMaxRetryDays',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 0,
				},
				displayOptions: {
					show: {
						operation: ['initiate-call-v1'],
					},
				},
				description: 'Optional max retry days',
			},
			{
				displayName: 'Override From Number',
				name: 'callOverrideFromNumber',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['initiate-call-v1'],
					},
				},
				description: 'Optional phone number override',
			},

			// contact property operations
			{
				displayName: 'Property Key',
				name: 'contactPropertyKey',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['get-contact-property-v2', 'update-contact-property-v2', 'create-contact-property-v2'],
					},
				},
				description: 'Unique key of the contact property',
			},
			{
				displayName: 'Data Type',
				name: 'contactPropertyDataType',
				type: 'options',
				options: [
					{ name: 'Boolean', value: 'boolean' },
					{ name: 'Date', value: 'date' },
					{ name: 'Datetime', value: 'datetime' },
					{ name: 'Email', value: 'email' },
					{ name: 'Multi Select', value: 'multi_select' },
					{ name: 'Number', value: 'number' },
					{ name: 'Phone Number', value: 'phone_number' },
					{ name: 'Select', value: 'select' },
					{ name: 'String', value: 'string' },
				],
				default: 'string',
				displayOptions: {
					show: {
						operation: ['create-contact-property-v2'],
					},
				},
				required: true,
				description: 'Property data type',
			},
			{
				displayName: 'Label',
				name: 'contactPropertyLabel',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['create-contact-property-v2', 'update-contact-property-v2'],
					},
				},
				description: 'Human readable label',
			},
			{
				displayName: 'Description',
				name: 'contactPropertyDescription',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['create-contact-property-v2', 'update-contact-property-v2'],
					},
				},
				description: 'Property description',
			},

			// contact property options - mode toggle for create (only select/multi_select)
			{
				displayName: 'Options Mode',
				name: 'contactPropertyOptionsMode',
				type: 'options',
				options: [
					{ name: 'Using Fields Below', value: 'fields' },
					{ name: 'Using JSON', value: 'json' },
				],
				default: 'fields',
				displayOptions: {
					show: {
						operation: ['create-contact-property-v2'],
						contactPropertyDataType: ['select', 'multi_select'],
					},
				},
				description: 'How to specify options for select/multi_select properties',
			},
			// contact property options - mode toggle for update (always visible)
			{
				displayName: 'Options Mode',
				name: 'contactPropertyOptionsMode',
				type: 'options',
				options: [
					{ name: 'Using Fields Below', value: 'fields' },
					{ name: 'Using JSON', value: 'json' },
				],
				default: 'fields',
				displayOptions: {
					show: {
						operation: ['update-contact-property-v2'],
					},
				},
				description: 'How to specify options for select/multi_select properties',
			},
			// contact property options - fixedCollection for create
			{
				displayName: 'Options',
				name: 'contactPropertyOptionsCollection',
				placeholder: 'Add Option',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				displayOptions: {
					show: {
						operation: ['create-contact-property-v2'],
						contactPropertyDataType: ['select', 'multi_select'],
						contactPropertyOptionsMode: ['fields'],
					},
				},
				description: 'Options for select/multi_select properties',
				options: [
					{
						name: 'items',
						displayName: 'Option',
						values: [
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								required: true,
								description: 'Option value',
							},
							{
								displayName: 'Label',
								name: 'label',
								type: 'string',
								default: '',
								required: true,
								description: 'Option display label',
							},
							{
								displayName: 'Description',
								name: 'description',
								type: 'string',
								default: '',
								description: 'Option description',
							},
						],
					},
				],
			},
			// contact property options - fixedCollection for update
			{
				displayName: 'Options',
				name: 'contactPropertyOptionsCollection',
				placeholder: 'Add Option',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				displayOptions: {
					show: {
						operation: ['update-contact-property-v2'],
						contactPropertyOptionsMode: ['fields'],
					},
				},
				description: 'Options for select/multi_select properties',
				options: [
					{
						name: 'items',
						displayName: 'Option',
						values: [
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								required: true,
								description: 'Option value',
							},
							{
								displayName: 'Label',
								name: 'label',
								type: 'string',
								default: '',
								required: true,
								description: 'Option display label',
							},
							{
								displayName: 'Description',
								name: 'description',
								type: 'string',
								default: '',
								description: 'Option description',
							},
						],
					},
				],
			},
			// contact property options - JSON for create
			{
				displayName: 'Options (JSON)',
				name: 'contactPropertyOptions',
				type: 'json',
				default: '[]',
				displayOptions: {
					show: {
						operation: ['create-contact-property-v2'],
						contactPropertyDataType: ['select', 'multi_select'],
						contactPropertyOptionsMode: ['json'],
					},
				},
				description: 'Options array as JSON. Each object: {value, label, description?}. Example: [{"value": "a", "label": "Option A"}]',
			},
			// contact property options - JSON for update
			{
				displayName: 'Options (JSON)',
				name: 'contactPropertyOptions',
				type: 'json',
				default: '[]',
				displayOptions: {
					show: {
						operation: ['update-contact-property-v2'],
						contactPropertyOptionsMode: ['json'],
					},
				},
				description: 'Options array as JSON. Each object: {value, label, description?}. Example: [{"value": "a", "label": "Option A"}]',
			},

			// phone number operations
			{
				displayName: 'Phone Number',
				name: 'importPhoneNumber',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['import-phone-number-v1'],
					},
				},
				required: true,
				description: 'Phone number to import in E.164 format',
			},
			{
				displayName: 'Termination URI',
				name: 'importTerminationUri',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['import-phone-number-v1'],
					},
				},
				required: true,
				description: 'SIP trunk termination URI',
			},
			{
				displayName: 'Auth Username',
				name: 'importAuthUsername',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['import-phone-number-v1'],
					},
				},
				required: true,
				description: 'SIP trunk auth username',
			},
			{
				displayName: 'Auth Password',
				name: 'importAuthPassword',
				type: 'string',
				default: '',
				typeOptions: {
					password: true,
				},
				displayOptions: {
					show: {
						operation: ['import-phone-number-v1'],
					},
				},
				required: true,
				description: 'SIP trunk auth password',
			},
		],

	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const outputData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		const parseJsonInput = (value: unknown): GenericValue | GenericValue[] | undefined => {
			if (typeof value === 'string') {
				const trimmed = value.trim();
				if (!trimmed) return undefined;
				return JSON.parse(trimmed) as GenericValue | GenericValue[];
			}
			return value as GenericValue | GenericValue[] | undefined;
		};

		// Attempt to parse a string value as JSON so that arrays, numbers and booleans
		// are sent with the correct type instead of as plain strings.
		const coercePropertyValue = (raw: unknown): GenericValue | GenericValue[] => {
			if (typeof raw !== 'string') return raw as GenericValue;
			try {
				return JSON.parse(raw) as GenericValue | GenericValue[];
			} catch {
				return raw;
			}
		};

		for (let i = 0; i < items.length; i++) {
			try {
				switch (operation) {
					case 'add-telli-contact': {
						const firstName = this.getNodeParameter('firstName', i) as string;
						const lastName = this.getNodeParameter('lastName', i) as string;
						const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
						const externalContactId = this.getNodeParameter('externalContactId', i) as string;
						const email = this.getNodeParameter('email', i, '') as string;
						const contactDetailsCollection = this.getNodeParameter('contactDetails', i, { details: [] }) as IDataObject;
						const timezone = this.getNodeParameter('timezone', i, '') as string;
						const salutation = this.getNodeParameter('salutation', i, '') as string;
						
						if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
							throw new NodeOperationError(
								this.getNode(), 
								`Invalid phone number format. Please use E.164 format (e.g., +12125551234)`,
								{ itemIndex: i }
							);
						}
						
						const contactDetailsObj: IDataObject = {};
						if (contactDetailsCollection && contactDetailsCollection.details) {
							const details = contactDetailsCollection.details as IDataObject[];
							for (const detail of details) {
								contactDetailsObj[detail.key as string] = detail.value;
							}
						}

						const contactData: IDataObject = {
							first_name: firstName,
							last_name: lastName,
							phone_number: phoneNumber,
							external_contact_id: externalContactId,
						};
	
						if (email) contactData.email = email;
						if (salutation) contactData.salutation = salutation;
						if (timezone) contactData.timezone = timezone;
						if (Object.keys(contactDetailsObj).length > 0) contactData.contact_details = contactDetailsObj;
	

						const contactResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'telliApi',
							{
								method: 'POST',
								url: `${V1_API_URL}/add-contact`,
								headers: {
									'Content-Type': 'application/json',
								},
								body: contactData,
							},
						);

						outputData.push({
							json: contactResponse,
						});
						break;
					}

					case 'update-telli-contact': {
						const updateContactId = this.getNodeParameter('contactId', i) as string;
						const updateFirstName = this.getNodeParameter('firstName', i, '') as string;
						const updateLastName = this.getNodeParameter('lastName', i, '') as string;
						const updatePhoneNumber = this.getNodeParameter('phoneNumber', i, '') as string;
						const updateEmail = this.getNodeParameter('email', i, '') as string;
						const updateExternalContactId = this.getNodeParameter('externalContactId', i, '') as string;
						const updateExternalUrl = this.getNodeParameter('externalUrl', i, '') as string;
						const updateSalutation = this.getNodeParameter('salutation', i, '') as string;
						const updateTimezone = this.getNodeParameter('timezone', i, '') as string;
						const updateContactDetailsCollection = this.getNodeParameter('contactDetails', i, { details: [] }) as IDataObject;

						// Validate phone number format if provided
						if (updatePhoneNumber && !updatePhoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
							throw new NodeOperationError(
								this.getNode(), 
								`Invalid phone number format. Please use E.164 format (e.g., +12125551234)`,
								{ itemIndex: i }
							);
						}

						// Build contact details object
						const updateContactDetailsObj: IDataObject = {};
						if (updateContactDetailsCollection && updateContactDetailsCollection.details) {
							const details = updateContactDetailsCollection.details as IDataObject[];
							for (const detail of details) {
								updateContactDetailsObj[detail.key as string] = detail.value;
							}
						}

						// Build update data object with only provided fields
						const updateData: IDataObject = {
							contact_id: updateContactId,
						};

						// Only include fields that have values
						if (updateFirstName) updateData.first_name = updateFirstName;
						if (updateLastName) updateData.last_name = updateLastName;
						if (updatePhoneNumber) updateData.phone_number = updatePhoneNumber;
						if (updateEmail) updateData.email = updateEmail;
						if (updateExternalContactId) updateData.external_contact_id = updateExternalContactId;
						if (updateExternalUrl) updateData.external_url = updateExternalUrl;
						if (updateSalutation) updateData.salutation = updateSalutation;
						if (updateTimezone) updateData.timezone = updateTimezone;
						if (Object.keys(updateContactDetailsObj).length > 0) updateData.contact_details = updateContactDetailsObj;

						const updateResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'telliApi',
							{
								method: 'PATCH',
								url: `${V1_API_URL}/update-contact`,
								headers: {
									'Content-Type': 'application/json',
								},
								body: updateData,
							},
						);

						outputData.push({
							json: updateResponse,
						});
						break;
					}

					case 'delete-telli-contact': {
						const deleteContactId = this.getNodeParameter('contactId', i) as string;

						const deleteResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'telliApi',
							{
								method: 'DELETE',
								url: `${V2_API_URL}/contacts/${deleteContactId}`,
								headers: {
									'Content-Type': 'text/plain',
								},
							},
						);

						outputData.push({
							json: deleteResponse,
						});
						break;
					}

					case 'remove-from-auto-dialer': {
						const removeContactId = this.getNodeParameter('contactId', i) as string;

						const removeData: IDataObject = {
							contact_id: removeContactId,
						};

						const removeResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'telliApi',
							{
								method: 'POST',
								url: `${V1_API_URL}/remove-from-auto-dialer`,
								headers: {
									'Content-Type': 'application/json',
								},
								body: removeData,
							},
						);

						outputData.push({
							json: removeResponse,
						});
						break;
					}

					case 'schedule-telli-call': {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const agentId = this.getNodeParameter('agentId', i) as string;
						const maxRetryDays = this.getNodeParameter('maxRetryDays', i) as number;
						const overrideFromNumber = this.getNodeParameter('overrideFromNumber', i) as string;
						
						const callData: IDataObject = {
							contact_id: contactId,
							agent_id: agentId,
						};
						
						if (maxRetryDays > 0) callData.max_retry_days = maxRetryDays;
						if (overrideFromNumber) callData.override_from_number = overrideFromNumber;

						const callResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'telliApi',
							{
								method: 'POST',
								url: `${V1_API_URL}/schedule-call`,
								headers: {
									'Content-Type': 'application/json',
								},
								body: callData,
							},
						);

						outputData.push({
							json: callResponse,
						});
						break;
					}

					case 'get-contact-by-external-id': {
						const getExternalContactId = this.getNodeParameter('externalContactId', i) as string;

						const getContactResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'telliApi',
							{
								method: 'GET',
								url: `${V1_API_URL}/get-contact-by-external-id/${getExternalContactId}`,
								headers: {
									'Content-Type': 'text/plain',
								},
							},
						);

						outputData.push({
							json: getContactResponse,
						});
						break;
					}


					case 'create-contact-v2': {
						const createContactData: IDataObject = {
							firstName: this.getNodeParameter('v2FirstName', i, '') as string,
							lastName: this.getNodeParameter('v2LastName', i, '') as string,
							phoneNumber: this.getNodeParameter('v2PhoneNumber', i, '') as string,
						};
						if (!createContactData.firstName || !createContactData.lastName || !createContactData.phoneNumber) {
							throw new NodeOperationError(this.getNode(), 'First Name, Last Name and Phone Number are required for Create Contact', { itemIndex: i });
						}
						const v2ExternalId = this.getNodeParameter('v2ExternalId', i, '') as string;
						const v2ExternalUrl = this.getNodeParameter('v2ExternalUrl', i, '') as string;
						const v2Salutation = this.getNodeParameter('v2Salutation', i, '') as string;
						const v2TimezoneIana = this.getNodeParameter('v2TimezoneIana', i, '') as string;
						const v2Email = this.getNodeParameter('v2Email', i, '') as string;
						if (v2ExternalId) createContactData.externalId = v2ExternalId;
						if (v2ExternalUrl) createContactData.externalUrl = v2ExternalUrl;
						if (v2Salutation) createContactData.salutation = v2Salutation;
						if (v2TimezoneIana) createContactData.timezoneIana = v2TimezoneIana;
						if (v2Email) createContactData.email = v2Email;

						// read properties based on mode
						const createPropsMode = this.getNodeParameter('v2PropertiesMode', i, 'fields') as string;
						let createProperties: IDataObject[] | undefined;
						if (createPropsMode === 'fields') {
							const propsCollection = this.getNodeParameter('v2PropertiesCollection', i, { items: [] }) as IDataObject;
							const propItems = (propsCollection.items as IDataObject[]) || [];
							if (propItems.length > 0) {
								createProperties = propItems.map((item) => ({
									key: item.key as string,
									value: coercePropertyValue(item.value),
								}));
							}
						} else {
							const parsed = parseJsonInput(this.getNodeParameter('v2Properties', i, '[]'));
							if (Array.isArray(parsed) && parsed.length > 0) {
								createProperties = parsed as IDataObject[];
							}
						}
						if (createProperties && createProperties.length > 0) createContactData.properties = createProperties;

						const createContactResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'POST',
							url: `${V2_API_URL}/contacts`,
							headers: { 'Content-Type': 'application/json' },
							body: createContactData,
						});
						outputData.push({ json: createContactResponse });
						break;
					}

					case 'update-contact-v2': {
						const updateV2Id = this.getNodeParameter('resourceId', i) as string;
						const updateContactV2Data: IDataObject = {};
						const updateV2FirstName = this.getNodeParameter('v2FirstName', i, '') as string;
						const updateV2LastName = this.getNodeParameter('v2LastName', i, '') as string;
						const updateV2PhoneNumber = this.getNodeParameter('v2PhoneNumber', i, '') as string;
						const updateV2ExternalId = this.getNodeParameter('v2ExternalId', i, '') as string;
						const updateV2ExternalUrl = this.getNodeParameter('v2ExternalUrl', i, '') as string;
						const updateV2Salutation = this.getNodeParameter('v2Salutation', i, '') as string;
						const updateV2TimezoneIana = this.getNodeParameter('v2TimezoneIana', i, '') as string;
						const updateV2Email = this.getNodeParameter('v2Email', i, '') as string;
						if (updateV2FirstName) updateContactV2Data.firstName = updateV2FirstName;
						if (updateV2LastName) updateContactV2Data.lastName = updateV2LastName;
						if (updateV2PhoneNumber) updateContactV2Data.phoneNumber = updateV2PhoneNumber;
						if (updateV2ExternalId) updateContactV2Data.externalId = updateV2ExternalId;
						if (updateV2ExternalUrl) updateContactV2Data.externalUrl = updateV2ExternalUrl;
						if (updateV2Salutation) updateContactV2Data.salutation = updateV2Salutation;
						if (updateV2TimezoneIana) updateContactV2Data.timezoneIana = updateV2TimezoneIana;
						if (updateV2Email) updateContactV2Data.email = updateV2Email;

						// read properties based on mode
						const updatePropsMode = this.getNodeParameter('v2PropertiesMode', i, 'fields') as string;
						let updateProperties: IDataObject[] | undefined;
						if (updatePropsMode === 'fields') {
							const propsCollection = this.getNodeParameter('v2PropertiesCollection', i, { items: [] }) as IDataObject;
							const propItems = (propsCollection.items as IDataObject[]) || [];
							if (propItems.length > 0) {
								updateProperties = propItems.map((item) => ({
									key: item.key as string,
									value: coercePropertyValue(item.value),
								}));
							}
						} else {
							const parsed = parseJsonInput(this.getNodeParameter('v2Properties', i, '[]'));
							if (Array.isArray(parsed) && parsed.length > 0) {
								updateProperties = parsed as IDataObject[];
							}
						}
						if (updateProperties && updateProperties.length > 0) updateContactV2Data.properties = updateProperties;

						const updateContactV2Response = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'PATCH',
							url: `${V2_API_URL}/contacts/${updateV2Id}`,
							headers: { 'Content-Type': 'application/json' },
							body: updateContactV2Data,
						});
						outputData.push({ json: updateContactV2Response });
						break;
					}

					case 'delete-contact-v2': {
						const deleteContactV2Id = this.getNodeParameter('resourceId', i) as string;
						const deleteContactV2Response = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'DELETE',
							url: `${V2_API_URL}/contacts/${deleteContactV2Id}`,
							headers: { 'Content-Type': 'text/plain' },
						});
						outputData.push({ json: deleteContactV2Response });
						break;
					}

					case 'list-contacts-v2': {
						const contactsReturnAll = this.getNodeParameter('returnAll', i, false) as boolean;

						if (contactsReturnAll) {
							const allContacts: IDataObject[] = [];
							let hasNextPage = false;
							let nextCursor: string | null = null;

							do {
								const contactsQs: IDataObject = { limit: 100 };

								if (nextCursor) {
									contactsQs.cursor = nextCursor;
								}

								const listContactsResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
									method: 'GET',
									url: `${V2_API_URL}/contacts`,
									headers: { 'Content-Type': 'application/json' },
									qs: contactsQs,
								}) as IDataObject;

								const contactsData = Array.isArray(listContactsResponse.data)
									? (listContactsResponse.data as IDataObject[])
									: [];
								allContacts.push(...contactsData);

								const pageInfo = (listContactsResponse.pageInfo ?? {}) as IDataObject;
								hasNextPage = pageInfo.hasNextPage === true;
								nextCursor = typeof pageInfo.nextCursor === 'string' ? pageInfo.nextCursor : null;
							} while (hasNextPage && nextCursor !== null);

							outputData.push({ json: { data: allContacts } });
						} else {
							const contactsLimit = this.getNodeParameter('listLimit', i, 50) as number;
							const contactsQs: IDataObject = { limit: contactsLimit };

							const listContactsResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
								method: 'GET',
								url: `${V2_API_URL}/contacts`,
								headers: { 'Content-Type': 'application/json' },
								qs: contactsQs,
							});
							outputData.push({ json: listContactsResponse });
						}

						break;
					}

					case 'get-contact-v2': {
						const getContactV2Id = this.getNodeParameter('resourceId', i) as string;
						const getContactV2Response = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'GET',
							url: `${V2_API_URL}/contacts/${getContactV2Id}`,
							headers: { 'Content-Type': 'application/json' },
						});
						outputData.push({ json: getContactV2Response });
						break;
					}

					case 'get-contact-by-external-id-v2': {
						const externalIdV2 = this.getNodeParameter('v2ExternalId', i) as string;
						const getContactByExternalIdV2Response = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'GET',
							url: `${V2_API_URL}/external/contacts/${externalIdV2}`,
							headers: { 'Content-Type': 'application/json' },
						});
						outputData.push({ json: getContactByExternalIdV2Response });
						break;
					}

					case 'list-agents-v2': {
						const agentsReturnAll = this.getNodeParameter('returnAll', i, false) as boolean;

						if (agentsReturnAll) {
							const allAgents: IDataObject[] = [];
							let hasNextPage = false;
							let nextCursor: string | null = null;

							do {
								const agentsQs: IDataObject = { limit: 100 };

								if (nextCursor) {
									agentsQs.cursor = nextCursor;
								}

								const listAgentsResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
									method: 'GET',
									url: `${V2_API_URL}/agents`,
									headers: { 'Content-Type': 'application/json' },
									qs: agentsQs,
								}) as IDataObject;

								const agentsData = Array.isArray(listAgentsResponse.data)
									? (listAgentsResponse.data as IDataObject[])
									: [];
								allAgents.push(...agentsData);

								const pageInfo = (listAgentsResponse.pageInfo ?? {}) as IDataObject;
								hasNextPage = pageInfo.hasNextPage === true;
								nextCursor = typeof pageInfo.nextCursor === 'string' ? pageInfo.nextCursor : null;
							} while (hasNextPage && nextCursor !== null);

							outputData.push({ json: { data: allAgents } });
						} else {
							const agentsLimit = this.getNodeParameter('listLimit', i, 50) as number;
							const agentsQs: IDataObject = { limit: agentsLimit };

							const listAgentsResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
								method: 'GET',
								url: `${V2_API_URL}/agents`,
								headers: { 'Content-Type': 'application/json' },
								qs: agentsQs,
							});
							outputData.push({ json: listAgentsResponse });
						}

						break;
					}

					case 'get-agent-v2': {
						const getAgentId = this.getNodeParameter('agentResourceId', i) as string;
						const getAgentResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'GET',
							url: `${V2_API_URL}/agents/${getAgentId}`,
							headers: { 'Content-Type': 'application/json' },
						});
						outputData.push({ json: getAgentResponse });
						break;
					}

					case 'get-call-v1': {
						const callId = this.getNodeParameter('resourceId', i) as string;
						const getCallResponseV1 = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'GET',
							url: `${V1_API_URL}/get-call/${callId}`,
						});
						outputData.push({ json: getCallResponseV1 });
						break;
					}

					case 'initiate-call-v1': {
						const initiateCallPayload: IDataObject = {
							contact_id: this.getNodeParameter('callContactId', i) as string,
						};
						const callAgentId = this.getNodeParameter('callAgentId', i, '') as string;
						const callOverrideFromNumberV1 = this.getNodeParameter('callOverrideFromNumber', i, '') as string;
						const callMaxRetryDaysV1 = this.getNodeParameter('callMaxRetryDays', i, 0) as number;
						if (callAgentId) initiateCallPayload.agent_id = callAgentId;
						if (callOverrideFromNumberV1) initiateCallPayload.override_from_number = callOverrideFromNumberV1;
						if (callMaxRetryDaysV1 > 0) initiateCallPayload.max_retry_days = callMaxRetryDaysV1;
						const initiateCallResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'POST',
							url: `${V1_API_URL}/initiate-call`,
							headers: { 'Content-Type': 'application/json' },
							body: initiateCallPayload,
						});
						outputData.push({ json: initiateCallResponse });
						break;
					}

					case 'schedule-calls-batch-v1': {
						const scheduleCalls = parseJsonInput(this.getNodeParameter('scheduleCallsBatch', i, '[]'));
						const scheduleCallsBatchResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'POST',
							url: `${V1_API_URL}/schedule-calls-batch`,
							headers: { 'Content-Type': 'application/json' },
							body: { contacts: scheduleCalls },
						});
						outputData.push({ json: scheduleCallsBatchResponse });
						break;
					}

					case 'list-contact-properties-v2': {
						const listContactPropertiesResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'GET',
							url: `${V2_API_URL}/properties/contacts`,
							headers: { 'Content-Type': 'application/json' },
						});
						outputData.push({ json: listContactPropertiesResponse });
						break;
					}

					case 'get-contact-property-v2': {
						const getPropertyKey = this.getNodeParameter('contactPropertyKey', i) as string;
						const getContactPropertyResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'GET',
							url: `${V2_API_URL}/properties/contacts/${getPropertyKey}`,
							headers: { 'Content-Type': 'application/json' },
						});
						outputData.push({ json: getContactPropertyResponse });
						break;
					}

					case 'create-contact-property-v2': {
						const createPropertyPayload: IDataObject = {
							key: this.getNodeParameter('contactPropertyKey', i) as string,
							dataType: this.getNodeParameter('contactPropertyDataType', i) as string,
						};
						const createPropertyLabel = this.getNodeParameter('contactPropertyLabel', i, '') as string;
						const createPropertyDescription = this.getNodeParameter('contactPropertyDescription', i, '') as string;
						if (createPropertyLabel) createPropertyPayload.label = createPropertyLabel;
						if (createPropertyDescription) createPropertyPayload.description = createPropertyDescription;

						// only read options for select/multi_select
						const createDataType = createPropertyPayload.dataType as string;
						if (createDataType === 'select' || createDataType === 'multi_select') {
							const optionsMode = this.getNodeParameter('contactPropertyOptionsMode', i, 'fields') as string;
							let propertyOptions: IDataObject[] | undefined;
							if (optionsMode === 'fields') {
								const optionsCollection = this.getNodeParameter('contactPropertyOptionsCollection', i, { items: [] }) as IDataObject;
								const optionItems = (optionsCollection.items as IDataObject[]) || [];
								if (optionItems.length > 0) {
									propertyOptions = optionItems.map((item) => {
										const opt: IDataObject = {
											value: item.value as string,
											label: item.label as string,
										};
										if (item.description) opt.description = item.description as string;
										return opt;
									});
								}
							} else {
								const parsed = parseJsonInput(this.getNodeParameter('contactPropertyOptions', i, '[]'));
								if (Array.isArray(parsed) && parsed.length > 0) {
									propertyOptions = parsed as IDataObject[];
								}
							}
							if (propertyOptions && propertyOptions.length > 0) createPropertyPayload.options = propertyOptions;
						}

						const createContactPropertyResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'POST',
							url: `${V2_API_URL}/properties/contacts`,
							headers: { 'Content-Type': 'application/json' },
							body: createPropertyPayload,
						});
						outputData.push({ json: createContactPropertyResponse });
						break;
					}

					case 'update-contact-property-v2': {
						const updatePropertyKey = this.getNodeParameter('contactPropertyKey', i) as string;
						const updatePropertyPayload: IDataObject = {};
						const updatePropertyLabel = this.getNodeParameter('contactPropertyLabel', i, '') as string;
						const updatePropertyDescription = this.getNodeParameter('contactPropertyDescription', i, '') as string;
						if (updatePropertyLabel) updatePropertyPayload.label = updatePropertyLabel;
						if (updatePropertyDescription) updatePropertyPayload.description = updatePropertyDescription;

						// always try to read options for update (we don't know the dataType)
						const updateOptionsMode = this.getNodeParameter('contactPropertyOptionsMode', i, 'fields') as string;
						let updatePropertyOptions: IDataObject[] | undefined;
						if (updateOptionsMode === 'fields') {
							const optionsCollection = this.getNodeParameter('contactPropertyOptionsCollection', i, { items: [] }) as IDataObject;
							const optionItems = (optionsCollection.items as IDataObject[]) || [];
							if (optionItems.length > 0) {
								updatePropertyOptions = optionItems.map((item) => {
									const opt: IDataObject = {
										value: item.value as string,
										label: item.label as string,
									};
									if (item.description) opt.description = item.description as string;
									return opt;
								});
							}
						} else {
							const parsed = parseJsonInput(this.getNodeParameter('contactPropertyOptions', i, '[]'));
							if (Array.isArray(parsed) && parsed.length > 0) {
								updatePropertyOptions = parsed as IDataObject[];
							}
						}
						if (updatePropertyOptions && updatePropertyOptions.length > 0) updatePropertyPayload.options = updatePropertyOptions;

						const updateContactPropertyResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'PATCH',
							url: `${V2_API_URL}/properties/contacts/${updatePropertyKey}`,
							headers: { 'Content-Type': 'application/json' },
							body: updatePropertyPayload,
						});
						outputData.push({ json: updateContactPropertyResponse });
						break;
					}

					case 'list-phone-numbers-v1': {
						const listPhoneNumbersResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'GET',
							url: `${V1_API_URL}/phone-numbers`,
						});
						outputData.push({ json: listPhoneNumbersResponse });
						break;
					}

					case 'replace-phone-number-v1': {
						const replacePhoneNumberId = this.getNodeParameter('resourceId', i) as string;
						const replacePhoneNumberResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'POST',
							url: `${V1_API_URL}/phone-numbers/${replacePhoneNumberId}/replace`,
							headers: { 'Content-Type': 'application/json' },
							body: {},
						});
						outputData.push({ json: replacePhoneNumberResponse });
						break;
					}

					case 'import-phone-number-v1': {
						const importPhoneNumberPayload = {
							phoneNumber: this.getNodeParameter('importPhoneNumber', i) as string,
							terminationUri: this.getNodeParameter('importTerminationUri', i) as string,
							authUsername: this.getNodeParameter('importAuthUsername', i) as string,
							authPassword: this.getNodeParameter('importAuthPassword', i) as string,
						};
						const importPhoneNumberResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'POST',
							url: `${V1_API_URL}/phone-numbers/import`,
							headers: { 'Content-Type': 'application/json' },
							body: importPhoneNumberPayload,
						});
						outputData.push({ json: importPhoneNumberResponse });
						break;
					}

					case 'delete-phone-number-v1': {
						const deletePhoneNumberId = this.getNodeParameter('resourceId', i) as string;
						const deletePhoneNumberResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'DELETE',
							url: `${V1_API_URL}/phone-numbers/${deletePhoneNumberId}`,
							headers: { 'Content-Type': 'text/plain' },
						});
						outputData.push({ json: deletePhoneNumberResponse });
						break;
					}

					case 'remove-from-auto-dialer-batch-v1': {
						const removeBatchIds = parseJsonInput(this.getNodeParameter('contactIdsBatch', i, '[]'));
						const removeBatchResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'POST',
							url: `${V1_API_URL}/remove-from-auto-dialer-batch`,
							headers: { 'Content-Type': 'application/json' },
							body: { contact_ids: removeBatchIds },
						});
						outputData.push({ json: removeBatchResponse });
						break;
					}

					case 'add-telli-contacts-batch': {
						const addContactsBatch = parseJsonInput(this.getNodeParameter('contactsBatch', i, '[]'));
						const addContactsBatchResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'POST',
							url: `${V1_API_URL}/add-contacts-batch`,
							headers: { 'Content-Type': 'application/json' },
							body: { contacts: addContactsBatch },
						});
						outputData.push({ json: addContactsBatchResponse });
						break;
					}

					case 'update-telli-contacts-batch': {
						const updateContactsBatch = parseJsonInput(this.getNodeParameter('contactsBatch', i, '[]'));
						const updateContactsBatchResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'PATCH',
							url: `${V1_API_URL}/update-contacts-batch`,
							headers: { 'Content-Type': 'application/json' },
							body: { contacts: updateContactsBatch },
						});
						outputData.push({ json: updateContactsBatchResponse });
						break;
					}

					case 'get-telli-contact': {
						const getContactIdV1 = this.getNodeParameter('deprecatedContactId', i) as string;
						const getContactV1Response = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'GET',
							url: `${V1_API_URL}/get-contact/${getContactIdV1}`,
						});
						outputData.push({ json: getContactV1Response });
						break;
					}

					case 'get-telli-contacts-batch': {
						const getContactsBatchIds = parseJsonInput(this.getNodeParameter('contactIdsBatch', i, '[]'));
						const getContactsBatchLimit = this.getNodeParameter('batchLimit', i, 10) as number;
						const getContactsBatchResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'telliApi', {
							method: 'POST',
							url: `${V1_API_URL}/get-contacts-batch`,
							headers: { 'Content-Type': 'application/json' },
							body: { contact_ids: getContactsBatchIds },
						});
						if (Array.isArray(getContactsBatchResponse)) {
							for (const contact of getContactsBatchResponse.slice(0, getContactsBatchLimit)) {
								if (contact && typeof contact === 'object' && !Array.isArray(contact)) {
									outputData.push({ json: contact as IDataObject });
								} else {
									outputData.push({ json: { value: contact as GenericValue } });
								}
							}
						} else {
							outputData.push({ json: getContactsBatchResponse });
						}
						break;
					}

					default:
						throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`);
				}
			} catch (error) {
				if (error.response) {
					const errorData = error.response.data || {};
					const statusCode = error.response.status;
					const errorMessage = errorData.message || error.message || 'Unknown API error';
					
					throw new NodeOperationError(
						this.getNode(),
						`API error (${statusCode}): ${errorMessage}`,
						{ itemIndex: i, description: `Operation: ${operation}` }
					);
				}
				
				if (this.continueOnFail()) {
					outputData.push({
						json: {
							error: error.message,
							operation,
							itemIndex: i,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [outputData];
	}
}
