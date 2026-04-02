const { describeIfApiKey, request } = require('./helpers');

// Phone number operations are destructive / cost-sensitive.
// Only run when explicitly opted in via env vars.
const importNumber = process.env.TELLI_TEST_IMPORT_PHONE_NUMBER; // e.g. +4915700000099
const replacePhoneId = process.env.TELLI_TEST_REPLACE_PHONE_ID;
const replaceNumber = process.env.TELLI_TEST_REPLACE_PHONE_NUMBER;
const deletePhoneId = process.env.TELLI_TEST_DELETE_PHONE_ID;

const describeIfImport = importNumber ? describeIfApiKey : describe.skip;
const describeIfReplace = replacePhoneId && replaceNumber ? describeIfApiKey : describe.skip;
const describeIfDelete = deletePhoneId ? describeIfApiKey : describe.skip;

describeIfImport('api.import_phone_number', () => {
  it('imports a phone number', async () => {
    const { response, data } = await request('/v1/import-phone-number', {
      method: 'POST',
      body: {
        phone_number: importNumber,
      },
    });

    // 200 or 201 on success, 400 if already imported or invalid
    expect([200, 201, 400]).toContain(response.status);
    expect(data).toBeDefined();
  });
});

describeIfReplace('api.replace_phone_number', () => {
  it('replaces a phone number', async () => {
    const { response, data } = await request(`/v1/replace-phone-number/${replacePhoneId}`, {
      method: 'POST',
      body: {
        phone_number: replaceNumber,
      },
    });

    expect([200, 400]).toContain(response.status);
    expect(data).toBeDefined();
  });
});

describeIfDelete('api.delete_phone_number', () => {
  it('deletes a phone number', async () => {
    const { response } = await request(`/v1/delete-phone-number/${deletePhoneId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'text/plain' },
    });

    expect([200, 204, 400, 404]).toContain(response.status);
  });
});
