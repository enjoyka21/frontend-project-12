const request = async (path, token, options = {}) => {
  const response = await fetch(`/api/v1${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!response.ok) {
    throw new Error(`Ошибка загрузки данных: ${response.status}`);
  }

  return response.json();
};

export const fetchChannels = (token) => request('/channels', token);
export const fetchMessages = (token) => request('/messages', token);
export const createMessage = (token, message) => request('/messages', token, {
  method: 'POST',
  body: message,
});
