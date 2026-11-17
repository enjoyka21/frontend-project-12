import {
  Alert,
  Button,
  Center,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
  });

  if (token) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (values) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Неверное имя пользователя или пароль');
      }

      const { token: nextToken, username } = await response.json();
      setAuth(nextToken, username);
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Не удалось войти');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center mih="100vh">
      <Paper withBorder shadow="md" p="xl" radius="md" w={360}>
        <Title order={1} ta="center" mb="lg">Войти</Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {error && <Alert color="red">{error}</Alert>}
            <TextInput
              label="Имя пользователя"
              autoComplete="username"
              {...form.getInputProps('username')}
            />
            <PasswordInput
              label="Пароль"
              autoComplete="current-password"
              {...form.getInputProps('password')}
            />
            <Button type="submit" loading={loading}>Войти</Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
};

export default LoginPage;
