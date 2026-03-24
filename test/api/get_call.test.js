const { describeIfApiKey, request } = require('./helpers');

const callId = process.env.TELLI_TEST_CALL_ID;
const describeIfCallId = callId ? describeIfApiKey : describe.skip;

describeIfCallId('api.get_call', () => {
  it('gets a call by ID', async () => {
    const { response, data } = await request(`/v1/get-call/${callId}`);

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
  });
});
