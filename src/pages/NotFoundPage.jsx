import { Anchor, Box, Center, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <Center mih="100vh">
      <Box ta="center">
        <Title order={1}>{t('notFound.title')}</Title>
        <Anchor component={Link} to="/">{t('common.home')}</Anchor>
      </Box>
    </Center>
  );
};

export default NotFoundPage;
