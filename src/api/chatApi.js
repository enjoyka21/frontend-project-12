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

export const signup = async (credentials) => {
  const response = await fetch('/api/v1/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = new Error('Не удалось зарегистрироваться');
    error.status = response.status;
    throw error;
  }

  return response.json();
};
export const createMessage = (token, message) => request('/messages', token, {
  method: 'POST',
  body: message,
});

export const createChannel = (token, name) => request('/channels', token, {
  method: 'POST',
  body: { name },
});

export const renameChannel = (token, channelId, name) => request(`/channels/${channelId}`, token, {
  method: 'PATCH',
  body: { name },
});

export const removeChannel = (token, channelId) => request(`/channels/${channelId}`, token, {
  method: 'DELETE',
});
