import {
  Alert,
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
import { signup } from '../api/chatApi.js';
import useAuthStore from '../store/authStore.js';

const SignupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      passwordConfirmation: '',
    },
    validate: {
      username: (value) => {
        const length = value.trim().length;
        if (length === 0) return t('auth.usernameRequired');
        if (length < 3 || length > 20) return t('auth.usernameLength');
        return null;
      },
      password: (value) => {
        if (value.length === 0) return t('auth.passwordRequired');
        return value.length < 6 ? t('auth.passwordLength') : null;
      },
      passwordConfirmation: (value, values) => {
        if (value.length === 0) return t('auth.confirmationRequired');
        return value !== values.password ? t('auth.passwordsMismatch') : null;
      },
    },
  });

  if (token) return <Navigate to="/" replace />;

  const handleSubmit = async ({ username, password }) => {
    setServerError(null);
    setLoading(true);
    try {
      const result = await signup({ username: username.trim(), password });
      setAuth(result.token, result.username);
      navigate('/', { replace: true });
    } catch (error) {
      setServerError(error.status === 409 ? t('auth.userExists') : t('auth.signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center mih="calc(100vh - 65px)">
      <Paper withBorder shadow="md" p="xl" radius="md" w={380}>
        <Title order={1} ta="center" mb="lg">{t('auth.signup')}</Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {serverError && <Alert color="red">{serverError}</Alert>}
            <TextInput label={t('auth.username')} autoComplete="username" {...form.getInputProps('username')} />
            <PasswordInput label={t('auth.password')} autoComplete="new-password" {...form.getInputProps('password')} />
            <PasswordInput label={t('auth.passwordConfirmation')} autoComplete="new-password" {...form.getInputProps('passwordConfirmation')} />
            <Button type="submit" loading={loading}>{t('auth.register')}</Button>
            <Text ta="center" size="sm">
              {t('auth.haveAccount')} <Link to="/login">{t('auth.loginLink')}</Link>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
};

export default SignupPage;
