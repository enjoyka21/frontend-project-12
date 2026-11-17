import {
  Alert,
  Anchor,
  Button,
  Center,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useStores.js';

const LoginPage = () => {
  const { t } = useTranslation();
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
        throw new Error(t('auth.invalidCredentials'));
      }

      const { token: nextToken, username } = await response.json();
      setAuth(nextToken, username);
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(submitError.message || t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center mih="100vh">
      <Paper withBorder shadow="md" p="xl" radius="md" w={360}>
        <Title order={1} ta="center" mb="lg">{t('auth.login')}</Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {error && <Alert color="red">{error}</Alert>}
            <TextInput
              label={t('auth.loginUsername')}
              autoComplete="username"
              {...form.getInputProps('username')}
            />
            <PasswordInput
              label={t('auth.password')}
              autoComplete="current-password"
              {...form.getInputProps('password')}
            />
            <Button type="submit" loading={loading}>{t('auth.login')}</Button>
            <Text ta="center" size="sm">
              {t('auth.noAccount')} <Anchor component={Link} to="/signup">{t('auth.signup')}</Anchor>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
};

export default LoginPage;
