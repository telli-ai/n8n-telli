const { describeIfApiKey, request } = require('./helpers');

describeIfApiKey('api.list_contact_properties', () => {
  it('lists contact properties', async () => {
    const { response, data } = await request('/v2/properties/contacts');

    expect(response.status).toBe(200);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
