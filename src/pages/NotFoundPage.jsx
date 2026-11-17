import { Anchor, Box, Center, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <Center mih="100vh">
    <Box ta="center">
      <Title order={1}>Страница не найдена</Title>
      <Anchor component={Link} to="/">На главную</Anchor>
    </Box>
  </Center>
);

export default NotFoundPage;
