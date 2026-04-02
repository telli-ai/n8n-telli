const { describeIfApiKey, request } = require('./helpers');

const contactId = process.env.TELLI_TEST_CONTACT_ID;
const agentId = process.env.TELLI_TEST_AGENT_ID;
const describeIfInputs = contactId && agentId ? describeIfApiKey : describe.skip;

describeIfInputs('api.schedule_calls_batch', () => {
  it('schedules multiple calls in batch', async () => {
    const { response, data } = await request('/v1/schedule-calls-batch', {
      method: 'POST',
      body: {
        contacts: [
          {
            contact_id: contactId,
            agent_id: agentId,
          },
        ],
      },
    });

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
  });
});
