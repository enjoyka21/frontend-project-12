const init = async (socket) => (
  <main>
    <h1>Hexlet Chat</h1>
    <p>{socket.connected ? 'Подключено к чату' : 'Подключение к чату…'}</p>
  </main>
);

export default init;
