const { describeIfApiKey, request } = require('./helpers');

const externalId = process.env.TELLI_TEST_CONTACT_EXTERNAL_ID;
const describeIfExternalId = externalId ? describeIfApiKey : describe.skip;

describeIfExternalId('api.get_contact_by_external_id_v2', () => {
  it('gets a contact by external ID', async () => {
    const { response, data } = await request(`/v2/external/contacts/${encodeURIComponent(externalId)}`);

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.externalId).toBe(externalId);
  });
});
