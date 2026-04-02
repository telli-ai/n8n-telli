const { describeIfApiKey, request } = require('./helpers');

describeIfApiKey('api.contact_crud_v2', () => {
  const uniqueId = `n8n-test-${Date.now()}`;
  let contactId;
  let deleted = false;

  afterAll(async () => {
    if (contactId && !deleted) {
      await request(`/v2/contacts/${contactId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  });

  it('creates a contact', async () => {
    const { response, data } = await request('/v2/contacts', {
      method: 'POST',
      body: {
        firstName: 'N8NTest',
        lastName: 'Contact',
        phoneNumber: '+4915700000001',
        externalId: uniqueId,
      },
    });

    expect(response.status).toBe(201);
    expect(data).toBeDefined();
    expect(data.id).toBeDefined();
    expect(data.firstName).toBe('N8NTest');
    expect(data.lastName).toBe('Contact');
    expect(data.externalId).toBe(uniqueId);
    contactId = data.id;
  });

  it('gets the created contact by ID', async () => {
    expect(contactId).toBeDefined();

    const { response, data } = await request(`/v2/contacts/${contactId}`);

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.id).toBe(contactId);
    expect(data.firstName).toBe('N8NTest');
  });

  it('gets contact by external ID', async () => {
    expect(contactId).toBeDefined();

    const { response, data } = await request(
      `/v2/external/contacts/${encodeURIComponent(uniqueId)}`,
    );

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.externalId).toBe(uniqueId);
  });

  it('updates the contact', async () => {
    expect(contactId).toBeDefined();

    const { response, data } = await request(`/v2/contacts/${contactId}`, {
      method: 'PATCH',
      body: {
        firstName: 'N8NUpdated',
      },
    });

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.firstName).toBe('N8NUpdated');
  });

  it('deletes the contact', async () => {
    expect(contactId).toBeDefined();

    const { response } = await request(`/v2/contacts/${contactId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'text/plain' },
    });

    expect(response.status).toBe(204);
    deleted = true;
  });

  it('confirms deletion (get returns 404)', async () => {
    expect(contactId).toBeDefined();

    const { response } = await request(`/v2/contacts/${contactId}`);
    expect(response.status).toBe(404);
  });
});
