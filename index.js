const { randomGameOptions, againRandomGameOptions } = require('./options');

require('dotenv').config();

const TelegramApi = require('node-telegram-bot-api');
const TOKEN = process.env.TOKEN

const chats = {}

function startApp() {

    const bot = new TelegramApi(TOKEN, { polling: true })

    const startRandomGame = async (chatId) => {
        await bot.sendMessage(chatId, `Я загадал число от 1 до 10, попробуй его угадать. Напиши свое предположение`)
        const randomNumber = Math.floor(Math.random() * (10 - 1) + 1)
        chats[chatId] = randomNumber
        await bot.sendMessage(chatId, 'Отдагай', randomGameOptions)
    }

    bot.setMyCommands([
        { command: '/start', description: 'Приветствие' },
        { command: '/info', description: 'Информация' },
        { command: '/game_random', description: 'Игра на угадывание числа' },
    ])

    bot.on('message', async (data) => {
        const id = data.chat.id
        const text = data.text
        const firstName = data.from.first_name || '';
        const lastName = data.from.last_name || '';
        const name = [firstName, lastName].filter(Boolean).join(' ');
        switch (text) {
            case '/start':
                await bot.sendMessage(id, `Добро пожаловать, ${name}`)
                break;
            case '/info':
                await bot.sendMessage(id, `Вас зовут ${name}`)
                break;
            case '/game_random':
                await startRandomGame(id)
                break;
            default:
                await bot.sendMessage(id, `Неизвестная команда`)
                break;
        }
    })

    bot.on('callback_query', async data => {

        const id = data.message.chat.id
        const text = data.data
        if (text === '/again') {
            startRandomGame(id)
        }
        else if (text === '/exit') {
            return await bot.sendMessage(id, `Игра окончена`)
        }
        else {
            if (Number(text) === chats[id]) {
                return await bot.sendMessage(id, `Ты угадал! Число было ${chats[id]}`, againRandomGameOptions)
            } else {
                return await bot.sendMessage(id, `К сожалению ты не угадал! Число было ${chats[id]}`, againRandomGameOptions)
            }
        }
    })
}

startApp()