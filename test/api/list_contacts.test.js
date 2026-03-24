const { describeIfApiKey, request } = require('./helpers');

describeIfApiKey('api.list_contacts', () => {
  it('lists contacts', async () => {
    const { response, data } = await request('/v2/contacts?limit=10');

    expect(response.status).toBe(200);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
