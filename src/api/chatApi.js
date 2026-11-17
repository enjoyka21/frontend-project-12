const request = async (path, token) => {
  const response = await fetch(`/api/v1${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Ошибка загрузки данных: ${response.status}`);
  }

  return response.json();
};

export const fetchChannels = (token) => request('/channels', token);
export const fetchMessages = (token) => request('/messages', token);
