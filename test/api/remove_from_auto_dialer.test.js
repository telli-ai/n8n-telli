const { describeIfApiKey, request } = require('./helpers');

// These tests require a contact that is actively in an auto-dialer queue.
// Set TELLI_TEST_AUTODIALER_CONTACT_ID to a contact currently in the dialer.
const autoDialerContactId = process.env.TELLI_TEST_AUTODIALER_CONTACT_ID;
const describeIfAutoDialer = autoDialerContactId ? describeIfApiKey : describe.skip;

describeIfAutoDialer('api.remove_from_auto_dialer', () => {
  it('removes a contact from the auto-dialer', async () => {
    const { response, data } = await request('/v1/remove-from-auto-dialer', {
      method: 'POST',
      body: {
        contact_id: autoDialerContactId,
      },
    });

    // 200 if successfully removed, 400 if not in a dialer queue
    expect([200, 400]).toContain(response.status);
    expect(data).toBeDefined();
  });
});

describeIfAutoDialer('api.remove_from_auto_dialer_batch', () => {
  it('removes contacts from the auto-dialer in batch', async () => {
    const { response, data } = await request('/v1/remove-from-auto-dialer/batch', {
      method: 'POST',
      body: {
        contact_ids: [autoDialerContactId],
      },
    });

    // 200 if successfully removed, 400 if not in a dialer queue
    expect([200, 400]).toContain(response.status);
    expect(data).toBeDefined();
  });
});
