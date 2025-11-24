import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
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
						name: 'Delete Contact',
						value: 'delete-telli-contact',
						description: 'Permanently delete a contact from telli',
						action: 'Delete a contact from telli',
					},
					{
						name: 'Get Contact By External ID',
						value: 'get-contact-by-external-id',
						description: 'Retrieve detailed contact information using external contact ID',
						action: 'Get contact by external ID',
					},
					{
						name: 'Remove From Auto Dialer',
						value: 'remove-from-auto-dialer',
						description: 'Remove a contact from the auto dialer queue',
						action: 'Remove a contact from auto dialer',
					},
					{
						name: 'Schedule Call',
						value: 'schedule-telli-call',
						description: 'Schedule a call with telli',
						action: 'Schedule a call with telli',
					},
					{
						name: 'Update Contact',
						value: 'update-telli-contact',
						description: 'Update an existing contact in telli',
						action: 'Update a contact in telli',
					},
                    {
						name: 'List Contacts',
						value: 'list-telli-contacts',
						description: 'Retrieve all contacts from telli',
						action: 'List all contacts',
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

			// delete-contact
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				default: '',
				placeholder: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
				displayOptions: {
					show: {
						operation: ['delete-telli-contact'],
					},
				},
				required: true,
				description: 'The telli contact ID to delete',
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
					case 'list-telli-contacts':
						const listResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'telliApi',
							{
								method: 'GET',
								url: `${BASE_API_URL}/list-contacts`,
								headers: {
									'Content-Type': 'application/json',
								},
							},
						);

						outputData.push({
							json: listResponse,
						});
						break;
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

					case 'update-telli-contact':
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
								url: `${BASE_API_URL}/update-contact`,
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

					case 'delete-telli-contact':
						const deleteContactId = this.getNodeParameter('contactId', i) as string;

						const deleteResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'telliApi',
							{
								method: 'DELETE',
								url: `${BASE_API_URL}/delete-contact/${deleteContactId}`,
								headers: {
									'Content-Type': 'application/json',
								},
							},
						);

						outputData.push({
							json: deleteResponse,
						});
						break;

					case 'remove-from-auto-dialer':
						const removeContactId = this.getNodeParameter('contactId', i) as string;

						const removeData: IDataObject = {
							contact_id: removeContactId,
						};

						const removeResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'telliApi',
							{
								method: 'POST',
								url: `${BASE_API_URL}/remove-from-auto-dialer`,
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

					case 'get-contact-by-external-id':
						const getExternalContactId = this.getNodeParameter('externalContactId', i) as string;

						const getContactResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'telliApi',
							{
								method: 'GET',
								url: `${BASE_API_URL}/get-contact-by-external-id/${getExternalContactId}`,
								headers: {
									'Content-Type': 'application/json',
								},
							},
						);

						outputData.push({
							json: getContactResponse,
						});
						break;

					default:
						throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`);
				}
			} catch (error: any) {
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