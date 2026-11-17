import { Button, Center, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

const ErrorFallback = ({ resetError }) => {
  const { t } = useTranslation();
  return (
    <Center mih="100vh">
      <Stack align="center">
        <Text>{t('common.unexpectedError')}</Text>
        <Button onClick={resetError}>{t('common.retry')}</Button>
      </Stack>
    </Center>
  );
};

export default ErrorFallback;
