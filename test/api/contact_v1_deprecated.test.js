const { describeIfApiKey, request } = require('./helpers');

describeIfApiKey('api.contact_v1_deprecated', () => {
  const uniqueExternalId = `n8n-v1-test-${Date.now()}`;
  let contactId;

  afterAll(async () => {
    if (contactId) {
      await request(`/v2/contacts/${contactId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  });

  it('adds a contact (v1)', async () => {
    const { response, data } = await request('/v1/add-contact', {
      method: 'POST',
      body: {
        external_contact_id: uniqueExternalId,
        first_name: 'V1Test',
        last_name: 'Contact',
        phone_number: '+4915700000002',
      },
    });

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.contact_id).toBeDefined();
    contactId = data.contact_id;
  });

  it('gets the contact by ID (v1)', async () => {
    expect(contactId).toBeDefined();

    const { response, data } = await request(`/v1/get-contact/${contactId}`);

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.contact_id).toBe(contactId);
    expect(data.first_name).toBe('V1Test');
  });

  it('gets the contact by external ID (v1)', async () => {
    expect(contactId).toBeDefined();

    const { response, data } = await request(
      `/v1/get-contact-by-external-id/${encodeURIComponent(uniqueExternalId)}`,
    );

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.external_contact_id).toBe(uniqueExternalId);
  });

  it('updates the contact (v1)', async () => {
    expect(contactId).toBeDefined();

    const { response, data } = await request('/v1/update-contact', {
      method: 'PATCH',
      body: {
        contact_id: contactId,
        first_name: 'V1Updated',
      },
    });

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.contact_id).toBe(contactId);
  });

  it('gets contacts batch (v1)', async () => {
    expect(contactId).toBeDefined();

    const { response, data } = await request('/v1/get-contacts-batch', {
      method: 'POST',
      body: {
        contact_ids: [contactId],
      },
    });

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    expect(data[0].status).toBe('success');
    expect(data[0].contact).toBeDefined();
    expect(data[0].contact.contact_id).toBe(contactId);
  });

  it('updates contacts batch (v1)', async () => {
    expect(contactId).toBeDefined();

    const { response, data } = await request('/v1/update-contacts-batch', {
      method: 'PATCH',
      body: {
        contacts: [
          {
            contact_id: contactId,
            first_name: 'V1BatchUpdated',
          },
        ],
      },
    });

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    expect(data[0].status).toBe('success');
  });
});
