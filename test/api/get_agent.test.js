const { describeIfApiKey, request } = require('./helpers');

const agentId = process.env.TELLI_TEST_AGENT_ID;
const describeIfAgentId = agentId ? describeIfApiKey : describe.skip;

describeIfAgentId('api.get_agent', () => {
  it('gets a specific agent', async () => {
    const { response, data } = await request(`/v2/agents/${agentId}`);

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.id).toBe(agentId);
  });
});
