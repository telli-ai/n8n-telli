const { describeIfApiKey, request } = require('./helpers');

describeIfApiKey('api.list_agents', () => {
  it('lists agents', async () => {
    const { response, data } = await request('/v2/agents?limit=10');

    expect(response.status).toBe(200);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
