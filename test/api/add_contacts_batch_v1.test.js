const { describeIfApiKey, request } = require('./helpers');

describeIfApiKey('api.add_contacts_batch_v1', () => {
  const contactIds = [];

  afterAll(async () => {
    for (const id of contactIds) {
      await request(`/v2/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  });

  it('adds multiple contacts in batch (v1)', async () => {
    const ts = Date.now();
    const { response, data } = await request('/v1/add-contacts-batch', {
      method: 'POST',
      body: {
        contacts: [
          {
            external_contact_id: `n8n-batch-a-${ts}`,
            first_name: 'BatchA',
            last_name: 'Test',
            phone_number: '+4915700000010',
          },
          {
            external_contact_id: `n8n-batch-b-${ts}`,
            first_name: 'BatchB',
            last_name: 'Test',
            phone_number: '+4915700000011',
          },
        ],
      },
    });

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.total_processed).toBe(2);
    expect(data.total_success).toBe(2);
    expect(Array.isArray(data.result)).toBe(true);
    expect(data.result.length).toBe(2);

    for (const item of data.result) {
      expect(item.status).toBe('success');
      expect(item.contact_id).toBeDefined();
      contactIds.push(item.contact_id);
    }
  });
});
