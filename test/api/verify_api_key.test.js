const { describeIfApiKey, request } = require('./helpers');

describeIfApiKey('api.verify_api_key', () => {
  it('verifies the configured API key', async () => {
    const { response, data } = await request('/v1/verify-api-key');

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
  });
});
