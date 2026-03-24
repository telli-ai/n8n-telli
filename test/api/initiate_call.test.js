const { describeIfApiKey, request } = require('./helpers');

const contactId = process.env.TELLI_TEST_CONTACT_ID;
const agentId = process.env.TELLI_TEST_AGENT_ID;
const describeIfInitiateInputs = contactId ? describeIfApiKey : describe.skip;

describeIfInitiateInputs('api.initiate_call', () => {
  it('initiates a call', async () => {
    const body = {
      contact_id: contactId,
    };

    if (agentId) {
      body.agent_id = agentId;
    }

    const { response, data } = await request('/v1/initiate-call', {
      method: 'POST',
      body,
    });

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
  });
});
