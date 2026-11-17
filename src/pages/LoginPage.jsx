import { Button, Center, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';

const LoginPage = () => {
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
  });

  return (
    <Center mih="100vh">
      <Paper withBorder shadow="md" p="xl" radius="md" w={360}>
        <Title order={1} ta="center" mb="lg">Войти</Title>
        <form onSubmit={form.onSubmit(() => undefined)}>
          <Stack>
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
            <Button type="submit">Войти</Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
};

export default LoginPage;
