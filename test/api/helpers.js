const API_ROOT_URL = 'https://api.telli.com';

const apiKey = process.env.TELLI_API_KEY || process.env.Authorization;

const describeIfApiKey = apiKey ? describe : describe.skip;

async function request(path, options = {}) {
  if (!apiKey) {
    throw new Error('TELLI_API_KEY or Authorization environment variable is required for API tests.');
  }

  const response = await fetch(`${API_ROOT_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { response, data };
}

module.exports = {
  apiKey,
  describeIfApiKey,
  request,
};
