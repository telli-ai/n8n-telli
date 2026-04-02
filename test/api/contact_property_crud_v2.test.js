const { describeIfApiKey, request } = require('./helpers');

describeIfApiKey('api.contact_property_crud_v2', () => {
  const uniqueKey = `n8ntest${Date.now()}`;
  let created = false;

  afterAll(async () => {
    // There is no delete endpoint for contact properties in v2 API,
    // so we cannot clean up. Use a unique key to avoid conflicts.
  });

  it('creates a contact property', async () => {
    const { response, data } = await request('/v2/properties/contacts', {
      method: 'POST',
      body: {
        key: uniqueKey,
        dataType: 'select',
        label: 'N8N Test Property',
        description: 'Created by n8n API test',
        options: [
          { value: 'opt_a', label: 'Option A' },
          { value: 'opt_b', label: 'Option B' },
        ],
      },
    });

    expect(response.status).toBe(201);
    expect(data).toBeDefined();
    expect(data.key).toBe(uniqueKey);
    expect(data.dataType).toBe('select');
    expect(data.label).toBe('N8N Test Property');
    expect(Array.isArray(data.options)).toBe(true);
    expect(data.options.length).toBe(2);
    created = true;
  });

  it('gets the contact property by key', async () => {
    expect(created).toBe(true);

    const { response, data } = await request(`/v2/properties/contacts/${uniqueKey}`);

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.key).toBe(uniqueKey);
    expect(data.dataType).toBe('select');
  });

  it('updates the contact property', async () => {
    expect(created).toBe(true);

    const { response, data } = await request(`/v2/properties/contacts/${uniqueKey}`, {
      method: 'PATCH',
      body: {
        label: 'N8N Updated Property',
        options: [
          { value: 'opt_a', label: 'Option A' },
          { value: 'opt_b', label: 'Option B' },
          { value: 'opt_c', label: 'Option C' },
        ],
      },
    });

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.label).toBe('N8N Updated Property');
    expect(data.options.length).toBe(3);
  });
});
