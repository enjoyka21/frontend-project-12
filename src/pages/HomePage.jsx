import { Anchor, Center, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

const HomePage = ({ socket }) => (
  <Center mih="100vh">
    <Stack align="center">
      <Title order={1}>Hexlet Chat</Title>
      <Text>{socket.connected ? 'Подключено к серверу' : 'Подключение к серверу…'}</Text>
      <Anchor component={Link} to="/login">Войти</Anchor>
    </Stack>
  </Center>
);

export default HomePage;
