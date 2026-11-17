import { Anchor, Button, Container, Group, Paper } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore.js';

const Header = () => {
  const { t } = useTranslation();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  return (
    <Paper component="header" radius={0} withBorder shadow="xs">
      <Container size="xl" py="sm">
        <Group justify="space-between">
          <Anchor component={Link} to="/" fw={700} c="dark">{t('common.appName')}</Anchor>
          {token && <Button variant="subtle" onClick={logout}>{t('common.logout')}</Button>}
        </Group>
      </Container>
    </Paper>
  );
};

export default Header;
