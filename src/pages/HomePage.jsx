import {
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useForm } from '@mantine/form';
import { fetchChannels, fetchMessages } from '../api/chatApi.js';
import { createMessage } from '../api/chatApi.js';
import useAuthStore from '../store/authStore.js';
import useChatStore from '../store/chatStore.js';

const HomePage = ({ socket }) => {
  const token = useAuthStore((state) => state.token);
  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.logout);
  const currentChannelId = useChatStore((state) => state.currentChannelId);
  const setCurrentChannelId = useChatStore((state) => state.setCurrentChannelId);
  const queryClient = useQueryClient();
  const form = useForm({ initialValues: { message: '' } });
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

  const channels = useMemo(() => channelsQuery.data ?? [], [channelsQuery.data]);
  const messages = useMemo(() => messagesQuery.data ?? [], [messagesQuery.data]);
  const defaultChannel = useMemo(
    () => channels.find(({ name }) => name === 'general') ?? channels[0],
    [channels],
  );
  const currentChannel = channels.find(({ id }) => id === currentChannelId) ?? defaultChannel;
  const channelMessages = messages.filter(({ channelId }) => channelId === currentChannel?.id);

  useEffect(() => {
    if (defaultChannel && currentChannelId !== defaultChannel.id && !channels.some(({ id }) => id === currentChannelId)) {
      setCurrentChannelId(defaultChannel.id);
    }
  }, [channels, currentChannelId, defaultChannel, setCurrentChannelId]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      queryClient.setQueryData(['messages', token], (currentMessages = []) => (
        currentMessages.some(({ id }) => id === message.id)
          ? currentMessages
          : [...currentMessages, message]
      ));
    };

    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [queryClient, socket, token]);

  const messageMutation = useMutation({
    mutationFn: ({ body, channelId }) => createMessage(token, {
      body,
      channelId,
      username,
    }),
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['messages', token] });
    },
  });

  if (channelsQuery.isLoading || messagesQuery.isLoading) {
    return <Center mih="100vh"><Loader /></Center>;
  }

  if (channelsQuery.isError || messagesQuery.isError) {
    return (
      <Center mih="100vh">
        <Stack align="center">
          <Text c="red">Не удалось загрузить данные чата</Text>
          <Button onClick={() => { channelsQuery.refetch(); messagesQuery.refetch(); }}>
            Повторить
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Flex mih="100vh" bg="gray.0">
      <Paper w={280} p="md" radius={0} withBorder>
        <Group justify="space-between" mb="md">
          <Title order={2}>Каналы</Title>
          <Button variant="subtle" size="xs" onClick={logout}>Выйти</Button>
        </Group>
        <Stack gap="xs">
          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant={currentChannel?.id === channel.id ? 'light' : 'subtle'}
              justify="space-between"
              onClick={() => setCurrentChannelId(channel.id)}
            >
              <span># {channel.name}</span>
              {channel.removable && <Badge size="xs">канал</Badge>}
            </Button>
          ))}
        </Stack>
      </Paper>

      <Box flex={1} p="xl">
        <Group justify="space-between" mb="md">
          <div>
            <Title order={2}>{currentChannel ? `# ${currentChannel.name}` : 'Чат'}</Title>
            <Text c="dimmed" size="sm">
              {socket.connected ? 'Подключено к серверу' : 'Подключение к серверу…'}
            </Text>
          </div>
        </Group>
        <Divider mb="md" />
        <ScrollArea h="calc(100vh - 220px)" mb="md">
          <Stack gap="sm">
            {channelMessages.map((message) => (
              <Paper key={message.id} p="sm" withBorder>
                <Text fw={700} size="sm">{message.username}</Text>
                <Text>{message.body}</Text>
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
              placeholder="Введите сообщение"
              aria-label="Новое сообщение"
              disabled={messageMutation.isPending}
              {...form.getInputProps('message')}
            />
            <Button type="submit" loading={messageMutation.isPending}>Отправить</Button>
          </Group>
          {messageMutation.isError && <Text c="red" size="sm" mt="xs">Не удалось отправить сообщение</Text>}
        </form>
      </Box>
    </Flex>
  );
};

export default HomePage;
