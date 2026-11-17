# Чат (Slack)

[![hexlet-check](https://github.com/enjoyka21/frontend-project-12/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/enjoyka21/frontend-project-12/actions)

Учебный проект Hexlet: real-time приложение на React с REST API и WebSocket.

## Стек

- JavaScript
- React
- Vite
- Socket.IO
- @hexlet/chat-server

## Установка

```bash
git clone https://github.com/enjoyka21/frontend-project-12.git
cd frontend-project-12
npm install
```

## Использование

Сборка клиентского приложения:

```bash
make build
```

Запуск сервера, API и собранного приложения:

```bash
make start
```

После запуска приложение доступно по адресу `http://localhost:5001`.

## Мониторинг ошибок

Для отправки ошибок в Bugsink/Sentry задайте DSN проекта в переменной окружения
`VITE_SENTRY_DSN` перед сборкой:

```bash
VITE_SENTRY_DSN="https://..." make build
```

Приложение подключает Sentry SDK и Error Boundary. Если DSN не задан, приложение
работает без отправки событий в коллектор ошибок.

Для Render добавьте `VITE_SENTRY_DSN` в Environment Variables сервиса и выполните
новый деплой. После этого откройте Bugsink/Sentry и проверьте, что тестовая ошибка
появилась в проекте.

## Автоматические проверки

При каждом push в GitHub запускается проверка Hexlet. За неё отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте его или репозиторий.

## О Хекслете

[Hexlet](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме.
