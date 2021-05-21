# NSFW-Telegram-bot

Бот сделан для развёртывания его на heroku.com. Использует в качестве бэкенда NodeJS и пакеты: express, node-telegram-bot-api, mongodb, mongoose.

Первоначально он использовал данные только из reddit, позже я сделал возможность забирать данные из башорга. Но т.к. не все, что там выпускается мне подходит, то написал фронтенд-часть для выбора контента. О том, как я писал бота, можно почитать [здесь](https://dev.to/slkarol/series/10480).

Бот "живёт" с таким ID: **@nsfw_heroku_bot**

Для корректной установки после клонирования репозитория скопируйте у себя файл .env.example в файл .env . В нём такие значения:

TOKEN="Токен бота для animal.js"

TELEGRAM_TOKEN_DEV="Токен бота для разработки"

REDDIT_USER_NAME="RedditUserName"

REDDIT_PASSWORD="RedditPassword"

REDDIT_APP_ID="RedditAppId"

REDDIT_API_SECRET="RedditApiSecret"

MONGO_CONNECT_URI="MongoConnectUri"

TOKEN_JWT="Секретная фраза для генерации токенов на авторизацию"

REDDIT\_...настройки для подключения к Reddit и MONGO_CONNECT_URI - подключение к БД Mongo для хранения настроек подписки.

_todo_ переехать от модульного css

_todo_ задействовать /api/isFriday . _(и тогда второй шаг: Сделать автоматичскую рассылку на каждый день)_

_todo_ В UI справочников канала сделать ссылку на канал
