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
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { signup } from '../api/chatApi.js';
import useAuthStore from '../store/authStore.js';

const SignupPage = () => {
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
        if (length === 0) return 'Введите имя пользователя';
        if (length < 3 || length > 20) return 'От 3 до 20 символов';
        return null;
      },
      password: (value) => {
        if (value.length === 0) return 'Введите пароль';
        return value.length < 6 ? 'Не менее 6 символов' : null;
      },
      passwordConfirmation: (value, values) => {
        if (value.length === 0) return 'Подтвердите пароль';
        return value !== values.password ? 'Пароли не совпадают' : null;
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
      setServerError(error.status === 409
        ? 'Пользователь с таким именем уже существует'
        : 'Не удалось зарегистрироваться');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center mih="calc(100vh - 65px)">
      <Paper withBorder shadow="md" p="xl" radius="md" w={380}>
        <Title order={1} ta="center" mb="lg">Регистрация</Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {serverError && <Alert color="red">{serverError}</Alert>}
            <TextInput label="Имя пользователя" autoComplete="username" {...form.getInputProps('username')} />
            <PasswordInput label="Пароль" autoComplete="new-password" {...form.getInputProps('password')} />
            <PasswordInput label="Подтверждение пароля" autoComplete="new-password" {...form.getInputProps('passwordConfirmation')} />
            <Button type="submit" loading={loading}>Зарегистрироваться</Button>
            <Text ta="center" size="sm">
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
};

export default SignupPage;
