import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
	IDataObject,
} from 'n8n-workflow';

const BASE_API_URL = 'https://api.telli.com/v1';

export class Telli implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'telli',
		name: 'telli',
		icon: 'file:telli.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with the telli API',
		defaults: {
			name: 'telli',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'telliApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Add Contact',
						value: 'add-telli-contact',
						description: 'Add a new contact to telli',
						action: 'Add a new contact to telli',
					},
					{
						name: 'Schedule Call',
						value: 'schedule-telli-call',
						description: 'Schedule a call with telli',
						action: 'Schedule a call with telli',
					},
				],
				default: 'add-telli-contact',
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
				displayName: 'Agent ID',
				name: 'agentId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['schedule-telli-call'],
					},
				},
				required: true,
				description: 'Optional agent ID to use for the call. If not set, the default agent will be used.',
			},
			{
				displayName: 'Max Retry Days',
				name: 'maxRetryDays',
				type: 'number',
				default: 3,
				displayOptions: {
					show: {
						operation: ['schedule-telli-call'],
					},
				},
				description: 'Optional number of days to retry the call. Defaults to the account\'s max retry days.',
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
			}
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const outputData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				switch (operation) {
					case 'add-telli-contact':
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
								url: `${BASE_API_URL}/add-contact`,
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

					case 'schedule-telli-call':
						const contactId = this.getNodeParameter('contactId', i) as string;
						const agentId = this.getNodeParameter('agentId', i) as string;
						const maxRetryDays = this.getNodeParameter('maxRetryDays', i) as number;
						const overrideFromNumber = this.getNodeParameter('overrideFromNumber', i) as string;
						
						const callData: IDataObject = {
							contact_id: contactId,
						};
						
						// optional fields
						if (agentId) callData.agent_id = agentId;
						if (maxRetryDays !== undefined) callData.max_retry_days = maxRetryDays;
						if (overrideFromNumber) callData.override_from_number = overrideFromNumber;

						const callResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'telliApi',
							{
								method: 'POST',
								url: `${BASE_API_URL}/schedule-call`,
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