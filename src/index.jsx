import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { io } from 'socket.io-client';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';
import init from './init.jsx';

const socket = io();
const app = await init(socket);

createRoot(document.getElementById('root')).render(
  <StrictMode>{app}</StrictMode>,
);
