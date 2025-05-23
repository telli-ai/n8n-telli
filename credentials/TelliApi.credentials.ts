import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TelliApi implements ICredentialType {
	name = 'telliApi';
	displayName = 'telli API';
	documentationUrl = 'https://docs.telli.com/api';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			required: true,
		}
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.telli.com/v1',
			url: '/verify-api-key',
			method: 'GET',
		},
	};
} 