import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Group,
  Loader,
  Menu,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  createChannel,
  createMessage,
  fetchChannels,
  fetchMessages,
  removeChannel,
  renameChannel,
} from '../api/chatApi.js';
import { useAuthStore, useChatStore } from '../store/useStores.js';
import cleanText from '../utils/profanity.js';

const HomePage = ({ socket }) => {
  const { t } = useTranslation();
  const token = useAuthStore((state) => state.token);
  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.logout);
  const currentChannelId = useChatStore((state) => state.currentChannelId);
  const setCurrentChannelId = useChatStore((state) => state.setCurrentChannelId);
  const queryClient = useQueryClient();
  const form = useForm({ initialValues: { message: '' } });
  const channelForm = useForm({
    initialValues: { name: '' },
    validate: {
      name: (value) => {
        const name = value.trim();
        if (name.length < 3 || name.length > 20) return t('chat.channelLength');
        if (channelsQuery.data?.some(({ id, name: channelName }) => (
          channelName === name && id !== channelModal?.channel?.id
        ))) return t('chat.channelExists');
        return null;
      },
    },
  });
  const [channelModal, setChannelModal] = useState(null);
  const [channelToDelete, setChannelToDelete] = useState(null);
  const channelsQuery = useQuery({
    queryKey: ['channels', token],
    queryFn: () => fetchChannels(token),
    enabled: Boolean(token),
  });
  const messagesQuery = useQuery({
    queryKey: ['messages', token],
    queryFn: () => fetchMessages(token),
    enabled: Boolean(token),
  });

  const channels = channelsQuery.data ?? [];
  const messages = messagesQuery.data ?? [];
  const defaultChannel = channels.find(({ name }) => name === 'general') ?? channels[0];
  const currentChannel = channels.find(({ id }) => id === currentChannelId) ?? defaultChannel;
  const channelMessages = messages.filter(({ channelId }) => channelId === currentChannel?.id);

  useEffect(() => {
    const availableChannels = channelsQuery.data ?? [];
    const initialChannel = availableChannels.find(({ name }) => name === 'general') ?? availableChannels[0];
    if (initialChannel && currentChannelId !== initialChannel.id
      && !availableChannels.some(({ id }) => id === currentChannelId)) {
      setCurrentChannelId(initialChannel.id);
    }
  }, [channelsQuery.data, currentChannelId, setCurrentChannelId]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      queryClient.setQueryData(['messages', token], (currentMessages = []) => (
        currentMessages.some(({ id }) => id === message.id)
          ? currentMessages
          : [...currentMessages, message]
      ));
    };

    socket.on('newMessage', handleNewMessage);
    const handleNewChannel = (channel) => {
      queryClient.setQueryData(['channels', token], (currentChannels = []) => (
        currentChannels.some(({ id }) => id === channel.id)
          ? currentChannels
          : [...currentChannels, channel]
      ));
    };
    const handleRenameChannel = (channel) => {
      queryClient.setQueryData(['channels', token], (currentChannels = []) => (
        currentChannels.map((currentChannel) => (
          currentChannel.id === channel.id ? channel : currentChannel
        ))
      ));
    };
    const handleRemoveChannel = ({ id }) => {
      queryClient.setQueryData(['channels', token], (currentChannels = []) => (
        currentChannels.filter((channel) => channel.id !== id)
      ));
      queryClient.invalidateQueries({ queryKey: ['messages', token] });
      if (currentChannelId === id) setCurrentChannelId(null);
    };

    socket.on('newChannel', handleNewChannel);
    socket.on('renameChannel', handleRenameChannel);
    socket.on('removeChannel', handleRemoveChannel);
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('newChannel', handleNewChannel);
      socket.off('renameChannel', handleRenameChannel);
      socket.off('removeChannel', handleRemoveChannel);
    };
  }, [currentChannelId, queryClient, setCurrentChannelId, socket, token]);

  useEffect(() => {
    if (channelsQuery.isError || messagesQuery.isError) {
      notifications.show({
        id: 'chat-loading-error',
        color: 'red',
        title: t('notifications.errorTitle'),
        message: t('notifications.loadingError'),
      });
    }
  }, [channelsQuery.isError, messagesQuery.isError, t]);

  const messageMutation = useMutation({
    mutationFn: ({ body, channelId }) => createMessage(token, {
      body: cleanText(body),
      channelId,
      username,
    }),
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['messages', token] });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: t('notifications.errorTitle'),
        message: t('notifications.sendError'),
      });
    },
  });

  const channelMutation = useMutation({
    mutationFn: ({ mode, channelId, name }) => (mode === 'create'
      ? createChannel(token, cleanText(name))
      : renameChannel(token, channelId, cleanText(name))),
    onSuccess: (channel, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channels', token] });
      setCurrentChannelId(channel.id);
      channelForm.reset();
      setChannelModal(null);
      notifications.show({
        color: 'green',
        message: variables.mode === 'rename'
          ? t('notifications.channelRenamed')
          : t('notifications.channelCreated'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: t('notifications.errorTitle'),
        message: t('chat.channelSaveError'),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (channelId) => removeChannel(token, channelId),
    onSuccess: ({ id }) => {
      queryClient.setQueryData(['channels', token], (currentChannels = []) => (
        currentChannels.filter((channel) => channel.id !== id)
      ));
      queryClient.invalidateQueries({ queryKey: ['messages', token] });
      if (currentChannelId === id) setCurrentChannelId(null);
      setChannelToDelete(null);
      notifications.show({ color: 'green', message: t('notifications.channelRemoved') });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: t('notifications.errorTitle'),
        message: t('chat.channelRemoveError'),
      });
    },
  });

  if (channelsQuery.isLoading || messagesQuery.isLoading) {
    return <Center mih="100vh"><Loader aria-label={t('chat.loading')} /></Center>;
  }

  if (channelsQuery.isError || messagesQuery.isError) {
    return (
      <Center mih="100vh">
        <Stack align="center">
          <Text c="red">{t('chat.loadingError')}</Text>
          <Button onClick={() => { channelsQuery.refetch(); messagesQuery.refetch(); }}>
            {t('common.retry')}
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Flex mih="100vh" bg="gray.0">
      <Paper w={280} p="md" radius={0} withBorder>
        <Group justify="space-between" mb="md">
          <Title order={2}>{t('chat.channels')}</Title>
          <Group gap="xs">
           <Button
  variant="light"
  size="xs"
  onClick={() => {
    channelForm.reset();
    setChannelModal({ mode: 'create' });
  }}
>
  +
</Button>
            <Button variant="subtle" size="xs" onClick={logout}>{t('common.logout')}</Button>
          </Group>
        </Group>
        <Stack gap="xs">
          {channels.map((channel) => (
            <Group key={channel.id} gap={4} wrap="nowrap">
             
<Button
  flex={1}
  variant={currentChannel?.id === channel.id ? 'light' : 'subtle'}
  justify="flex-start"
  onClick={() => setCurrentChannelId(channel.id)}
  styles={{ label: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}
>
  # {cleanText(channel.name)}
</Button>
{channel.removable && (
  <Badge size="xs">{t('chat.channelBadge')}</Badge>
)}

              {channel.removable && (
                <Menu withinPortal>
                  <Menu.Target>
                    <ActionIcon variant="subtle" aria-label={t('chat.manageChannel', { name: cleanText(channel.name) })}>⋮</ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item onClick={() => {
                      channelForm.setValues({ name: channel.name });
                      setChannelModal({ mode: 'rename', channel });
                    }}>
                      {t('chat.rename')}
                    </Menu.Item>
                    <Menu.Item color="red" onClick={() => setChannelToDelete(channel)}>
                      {t('chat.remove')}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}
            </Group>
          ))}
        </Stack>
      </Paper>

      <Box flex={1} p="xl">
        <Group justify="space-between" mb="md">
          <div>
            <Title order={2}>{currentChannel ? `# ${cleanText(currentChannel.name)}` : t('chat.channelTitle')}</Title>
            <Text c="dimmed" size="sm">
              {socket.connected ? t('chat.connected') : t('chat.connecting')}
            </Text>
          </div>
        </Group>
        <Divider mb="md" />
        <ScrollArea h="calc(100vh - 220px)" mb="md">
          <Stack gap="sm">
            {channelMessages.map((message) => (
              <Paper key={message.id} p="sm" withBorder>
                <Text fw={700} size="sm">{message.username}</Text>
                <Text>{cleanText(message.body)}</Text>
              </Paper>
            ))}
          </Stack>
        </ScrollArea>
        <form onSubmit={form.onSubmit(({ message }) => {
          if (message.trim() && currentChannel) {
            messageMutation.mutate({ body: message.trim(), channelId: currentChannel.id });
          }
        })}>
          <Group align="end">
            <TextInput
              flex={1}
              placeholder={t('chat.messagePlaceholder')}
              aria-label={t('chat.newMessage')}
              disabled={messageMutation.isPending}
              {...form.getInputProps('message')}
            />
            <Button type="submit" loading={messageMutation.isPending}>{t('chat.send')}</Button>
          </Group>
          {messageMutation.isError && <Text c="red" size="sm" mt="xs">{t('chat.sendError')}</Text>}
        </form>
      </Box>

      <Modal
        opened={Boolean(channelModal)}
        onClose={() => setChannelModal(null)}
        title={channelModal?.mode === 'rename' ? t('chat.renameChannelTitle') : t('chat.addChannelTitle')}
      >
        <form onSubmit={channelForm.onSubmit(({ name }) => channelMutation.mutate({
          mode: channelModal.mode,
          channelId: channelModal.channel?.id,
          name: name.trim(),
        }))}>
          <Stack>
            <TextInput
              label={t('chat.channelName')}
              placeholder={t('chat.channelPlaceholder')}
              autoFocus
              disabled={channelMutation.isPending}
              {...channelForm.getInputProps('name')}
            />
            {channelMutation.isError && <Text c="red" size="sm">{t('chat.channelSaveError')}</Text>}
            <Button type="submit" loading={channelMutation.isPending}>{t('common.save')}</Button>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={Boolean(channelToDelete)}
        onClose={() => setChannelToDelete(null)}
        title={t('chat.deleteTitle')}
      >
        <Stack>
          <Text>{t('chat.deleteDescription', { name: cleanText(channelToDelete?.name ?? '') })}</Text>
          {deleteMutation.isError && <Text c="red" size="sm">{t('chat.channelRemoveError')}</Text>}
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setChannelToDelete(null)}>{t('common.cancel')}</Button>
            <Button color="red" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(channelToDelete.id)}>
              {t('chat.remove')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Flex>
  );
};

export default HomePage;
