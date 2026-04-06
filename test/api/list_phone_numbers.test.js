const { describeIfApiKey, request } = require('./helpers');

describeIfApiKey('api.list_phone_numbers', () => {
  it('lists phone numbers', async () => {
    const { response, data } = await request('/v1/phone-numbers');

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
  });
});
