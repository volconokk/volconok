# Volconok

Кроссплатформенная социальная сеть в эстетике карандашных набросков.
Чёрно-белый минимализм, прозрачные иконки в стиле Apple, две темы (светлая/тёмная)
и три языка интерфейса: русский, română, english.

```
volconok/
├── backend/   Node.js + Express + MongoDB + Socket.IO
└── mobile/    React Native (Expo) — iOS 17+ и Android 5+
```

## Возможности

- Регистрация и вход (JWT), хранение пользователей в MongoDB.
- Профили: аватар, отображаемое имя, био, настройки.
- Посты с текстом и изображениями (до 6 на пост).
- Комментарии и лайки к постам/комментариям, реакции.
- Личные сообщения в реальном времени (Socket.IO), индикатор «печатает».
- Система друзей: поиск, заявки, входящие/исходящие, принятие/отклонение.
- Уведомления о лайках, комментариях, сообщениях и заявках в друзья.
- Минимальный экран настроек: язык (ru/ro/en), тема (light/dark/system), уведомления.
- Поддержка телефонов и планшетов (адаптивные карточки, безопасные зоны).

## Стек

| Слой       | Технология                                  |
|------------|---------------------------------------------|
| Frontend   | React Native (Expo SDK 51), Expo Router     |
| Состояние  | Zustand                                     |
| Сеть       | axios + Socket.IO client                    |
| i18n       | i18next + react-i18next + expo-localization |
| Графика    | react-native-svg (карандашные рамки, иконки)|
| Backend    | Node.js 18+, Express 4                      |
| БД         | MongoDB (Mongoose 8)                        |
| Realtime   | Socket.IO 4                                 |
| Auth       | JSON Web Tokens                             |
| Файлы      | Multer (локальный диск + статика `/uploads`)|

## Быстрый старт

### 1. MongoDB

Поднимите локально (Docker):

```bash
docker run -d --name volconok-mongo -p 27017:27017 mongo:7
```

или используйте облачный кластер MongoDB Atlas (поменяйте `MONGO_URI` в `.env`).

### 2. Backend

```bash
cd backend
cp .env.example .env       # на Windows: copy .env.example .env
npm install
npm run seed               # опционально: создаст 4 демо-пользователей
npm run dev                # http://localhost:4000
```

Демо-аккаунты после `seed` (пароль у всех `volconok`):
`anna`, `mihai`, `leo`, `sasha`.

### 3. Mobile

```bash
cd mobile
npm install
npx expo start
```

Откройте Expo Go на телефоне (Android/iOS) либо нажмите `i` / `a`
в терминале для запуска в эмуляторе.

> Если телефон не на той же сети, что и backend, замените `apiUrl`
> в `mobile/app.json` → `expo.extra.apiUrl` на адрес вашего сервера
> (например `http://192.168.1.10:4000`).

### Сборка нативных приложений

iOS (нужен macOS) и Android собираются через
[EAS Build](https://docs.expo.dev/build/introduction/):

```bash
cd mobile
npm install -g eas-cli
eas login
eas build -p ios       # минимальный таргет iOS 17 уже прописан в app.json
eas build -p android   # minSdkVersion 21 (Android 5+)
```

## Визуальная идея

Каждый блок интерфейса (карточка поста, кнопка, поле ввода, рамка аватара)
рендерится через компонент `PencilFrame`, который рисует SVG-обводку с лёгким
дрожанием — будто проведённую графитным карандашом. Фон `PaperBackground`
добавляет диагональную штриховку, имитирующую бумагу. Цветовая палитра
ограничена двумя тонами чернил и оттенками бумаги, что сохраняет ощущение
скетчбука и в светлой, и в тёмной теме.

## Структура

```
backend/
  src/
    server.js
    models/        User, Post, Comment, Message, Friendship, Notification
    routes/        auth, users, posts, comments, messages, friends, notifications, upload
    middleware/    auth (JWT), errorHandler, upload (Multer)
    realtime/      socket.js
    utils/         seed.js
mobile/
  app/             Expo Router: (tabs), auth, post/[id], user/[username],
                   chat/[userId], profile/edit, settings, notifications
  src/
    api/           axios client + token storage
    components/    PencilFrame, PencilButton, PencilInput, PostCard,
                   Composer, Avatar, PaperBackground, Header, icons
    store/         useAuth, useSocket
    theme/         ThemeProvider, palette
    i18n/          ru, ro, en
    utils/         time.js
```

## Лицензия

MIT. Делайте набросок, делитесь, переделывайте.
