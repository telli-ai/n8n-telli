const { describeIfApiKey, request } = require('./helpers');

const contactId = process.env.TELLI_TEST_CONTACT_ID;
const agentId = process.env.TELLI_TEST_AGENT_ID;
const describeIfScheduleInputs = contactId && agentId ? describeIfApiKey : describe.skip;

describeIfScheduleInputs('api.schedule_call', () => {
  it('schedules a call', async () => {
    const { response, data } = await request('/v1/schedule-call', {
      method: 'POST',
      body: {
        contact_id: contactId,
        agent_id: agentId,
      },
    });

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
  });
});
