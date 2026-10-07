const TelegramBot = require('node-telegram-bot-api');
const TOKEN = '8997081626:AAHHZHF5HAV8DfYJSyRC1Kl_1wVGRnI4xu0';
const bot = new TelegramBot(TOKEN, {
    polling: true
});
const fs = require('fs');
const path = require('path');
const ADMIN_ID = 1090307667;
const applicationsFile = path.join(__dirname, 'applications.json');
const applications = {};

function saveApplication(application) {

    let applicationsList = [];

    if (fs.existsSync(applicationsFile)) {

        const data = fs.readFileSync(
            applicationsFile,
            'utf8'
        );

        if (data.trim()) {

            try {

                applicationsList = JSON.parse(data);

            } catch (error) {

                console.log(
                    'Ошибка чтения applications.json:',
                    error
                );

                applicationsList = [];
            }
        }
    }

    applicationsList.push(application);

    fs.writeFileSync(
        applicationsFile,
        JSON.stringify(
            applicationsList,
            null,
            2
        ),
        'utf8'
    );

    console.log('Заявка сохранена!');
}

function getApplications() {

    if (!fs.existsSync(applicationsFile)) {
        return [];
    }

    const data = fs.readFileSync(
        applicationsFile,
        'utf8'
    );

    if (!data.trim()) {
        return [];
    }

    try {
        return JSON.parse(data);
    } catch (error) {
        console.log(
            'Ошибка чтения applications.json:',
            error
        );

        return [];
    }
}


// =======================
// START
// =======================

bot.onText(/\/start/, msg => {

    const chatId = msg.chat.id;

    bot.sendMessage(
        chatId,
        'Привет 🖐\n' +
        'Добро пожаловать в мою Telegram-визитку!\n\n' +
        'Выберите нужный раздел:',
        {
            reply_markup: {
                keyboard: [
                    ['👤Обо мне', '💼Услуги'],
                    ['💰Цена', '☎️Контакты'],
                    ['💼Портфолио'],
                    ['🚀Заказать проект']
                ],
                resize_keyboard: true
            }
        }
    );
});
// АДМИН-ПАНЕЛЬ

// =======================

bot.onText(/\/admin/, (msg) => {

    const chatId = msg.chat.id;

    if (chatId !== ADMIN_ID) {

        return bot.sendMessage(

            chatId,

            '⛔️ У вас нет доступа к админ-панели.'

        );

    }

    bot.sendMessage(

        chatId,

        '👨‍💼 Админ-панель\n\n' +

        'Выберите действие:',

        {

            reply_markup: {

                inline_keyboard: [

                    [

                        {

                            text: '📋 Заявки',

                            callback_data: 'admin_applications'

                        }

                    ],

                    [

                        {

                            text: '📊 Статистика',

                            callback_data: 'admin_statistics'
                        }
                    ]
                ]
            }
        }
    );
});



// =======================
// ГЛАВНОЕ МЕНЮ
// =======================

bot.on('message', (msg) => {

    const chatId = msg.chat.id;
    const text = msg.text;

    // Если сообщение не текстовое
    if (!text) {
        return;
    }


    // =======================
    // ЗАКАЗ ПРОЕКТА
    // =======================

    if (text === '🚀Заказать проект') {

        applications[chatId] = {
            step: 'service'
        };

        bot.sendMessage(
            chatId,
            '🚀 Заказать проект\n\n' +
            'Выберите нужную услугу:',
            {
                reply_markup: {
                    inline_keyboard: [

                        [
                            {
                                text: '🤖 Telegram-бот',
                                callback_data: 'order_bot'
                            }
                        ],

                        [
                            {
                                text: '🛒 Telegram-магазин',
                                callback_data: 'order_shop'
                            }
                        ],

                        [
                            {
                                text: '⚙️ Автоматизация',
                                callback_data: 'order_automation'
                            }
                        ],

                        [
                            {
                                text: '🔧 Доработка бота',
                                callback_data: 'order_fix'
                            }
                        ],

                        [
                            {
                                text: '💡 Другое',
                                callback_data: 'order_other'
                            }
                        ]

                    ]
                }
            }
        );

        return;
    }


    // =======================
    // ОБРАБОТКА ОПИСАНИЯ ЗАКАЗА
    // =======================

    if (
        applications[chatId] &&
        applications[chatId].step === 'description'
    ) {

        applications[chatId].description = text;

        const application = {

            id: Date.now(),

            userId: msg.from.id,

            username: msg.from.username || null,

            firstName: msg.from.first_name || '',

            service: applications[chatId].service,

            description: applications[chatId].description,

            date: new Date().toISOString()
            };


        // Сохраняем заявку
        saveApplication(application);


        bot.sendMessage(
            chatId,

            '✅ Заявка принята!\n\n' +

            '🆔 Номер заявки: #' +
            application.id +

            '\n\n' +

            '📌 Услуга: ' +
            application.service +

            '\n\n' +

            '📝 Описание:\n' +
            application.description +

            '\n\n' +

            '💬 Я свяжусь с вами для обсуждения деталей.'
        );


        // Удаляем временные данные
        delete applications[chatId];

        return;
    }
 // =======================
    // ОБО МНЕ
    // =======================

    if (text === '👤Обо мне') {

        bot.sendMessage(
            chatId,

            '👤 Обо мне\n\n' +
            'Я занимаюсь разработкой Telegram-ботов и автоматизацией.'
        );

        return;
    }

  // =======================
    // УСЛУГИ
    // =======================

    if (text === '💼Услуги') {

        bot.sendMessage(
            chatId,

            '💼 Услуги\n\n' +
            '🤖 Telegram-боты\n' +
            '🛒 Боты-магазины\n' +
            '⚙️ Автоматизация\n' +
            '🔧 Доработка существующих ботов'
        );

        return;
    }

 // =======================
    // ЦЕНА
    // =======================

    if (text === '💰Цена') {

        bot.sendMessage(
            chatId,

            '💰 Стоимость услуг\n\n' +
            '🤖 Telegram-боты — от 1 500 грн\n' +
            '🛒 Боты-магазины — от 3 000 грн\n' +
            '⚙️ Автоматизация — от 1 000 грн\n\n' +
            '💬 Точная стоимость зависит от сложности проекта.'
        );

        return;
    }

      // =======================
    // КОНТАКТЫ
    // =======================

    if (text === '☎️Контакты') {

        bot.sendMessage(
            chatId,

            '☎️ Контакты\n\n' +
            'Telegram: @br_k_791\n\n' +
            '💬 Напишите мне, чтобы обсудить проект.'
        );

        return;
    }

     // =======================
    // ПОРТФОЛИО
    // =======================

    if (text === '💼Портфолио') {

        bot.sendMessage(
            chatId,

            '📂 Моё портфолио\n\n' +
            'Выберите проект:',

            {
                reply_markup: {
                    inline_keyboard: [

                        [
                            {
                                text: '🛒 Telegram-магазин',
                                callback_data: 'portfolio_shop'
                            }
                        ],

                        [
                            {
                                text: '💼 Telegram-визитка',
                                callback_data: 'portfolio_card'
                            }
                        ],

                        [
                            {
                                text: '🤖 Другие боты',
                                callback_data: 'portfolio_bots'
                            }
                        ]

                    ]
                }
            }
        );

        return;
    }

});

// =======================
// CALLBACK-КНОПКИ
// =======================

bot.on('callback_query', (query) => {

    const chatId = query.message.chat.id;
    const data = query.data;

// =======================
// АДМИН — ЗАЯВКИ
// =======================

if (data === 'admin_applications') {

    if (chatId !== ADMIN_ID) {
        return;
    }

    const savedApplications = getApplications();

    bot.answerCallbackQuery(query.id);

    if (savedApplications.length === 0) {

        return bot.sendMessage(
            chatId,
            '📋 Заявок пока нет.'
        );
    }

    let text = '📋 Все заявки\n\n';

    const buttons = [];

    savedApplications.forEach((application, index) => {

        text +=
            `📌 Заявка №${index + 1}\n` +
            `🆔 Номер: ${application.id ? '#' + application.id : 'отсутствует'}\n` +
            `💼 ${application.service || 'Не указана'}\n` +
            `📝 ${application.description || 'Не указано'}\n\n`;

        buttons.push([
            {
                text: `👁 Открыть заявку №${index + 1}`,
                callback_data: `view_application_${index}`
            }
        ]);
    });

    return bot.sendMessage(
        chatId,
        text,
        {
            reply_markup: {
                inline_keyboard: buttons
            }
        }
    );
}
// =======================
// АДМИН — ОТКРЫТЬ ЗАЯВКУ
// =======================

if (data.startsWith('view_application_')) {

    if (chatId !== ADMIN_ID) {
        return;
    }

    const index = Number(
        data.replace('view_application_', '')
    );

    const savedApplications = getApplications();

    const application = savedApplications[index];

    bot.answerCallbackQuery(query.id);

    if (!application) {

        return bot.sendMessage(
            chatId,
            '❌ Заявка не найдена.'
        );
    }

    let text =
        '📋 Заявка №' + (index + 1) + '\n\n' +

        '🆔 Номер заявки: ' +
        (application.id
            ? '#' + application.id
            : 'отсутствует') +

        '\n\n' +

        '💼 Услуга: ' +
        (application.service || 'Не указана') +

        '\n\n' +

        '📝 Описание:\n' +
        (application.description || 'Не указано') +

        '\n\n';

    if (application.firstName) {

        text +=
            '👤 Имя: ' +
            application.firstName +
            '\n';
    }

    if (application.username) {

        text +=
            '🔗 Username: @' +
            application.username +
            '\n';
    }

    if (application.userId) {

        text +=
            '🆔 Telegram ID: ' +
            application.userId +
            '\n';
    }

    if (application.date) {

        text +=
            '📅 Дата: ' +
            application.date +
            '\n';
    }

    return bot.sendMessage(
        chatId,
        text,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🗑 Удалить заявку',
                            callback_data: `delete_application_${index}`
                        }
                    ],
                    [
                        {
                            text: '⬅️ К списку заявок',
                            callback_data: 'admin_applications'
                        }
                    ]
                ]
            }
        }
    );
}
// =======================
// АДМИН — УДАЛИТЬ ЗАЯВКУ
// =======================

if (data.startsWith('delete_application_')) {

    if (chatId !== ADMIN_ID) {
        return;
    }

    const index = Number(
        data.replace('delete_application_', '')
    );

    const savedApplications = getApplications();

    if (!savedApplications[index]) {

        bot.answerCallbackQuery(
            query.id,
            {
                text: '❌ Заявка не найдена.'
            }
        );

        return;
    }

    savedApplications.splice(index, 1);

    fs.writeFileSync(
        applicationsFile,
        JSON.stringify(
            savedApplications,
            null,
            2
        ),
        'utf8'
    );

    bot.answerCallbackQuery(
        query.id,
        {
            text: '✅ Заявка удалена.'
        }
    );

    return bot.sendMessage(
        chatId,
        '🗑 Заявка №' +
        (index + 1) +
        ' удалена.\n\n' +
        '📋 Список заявок обновлён.',
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '📋 К списку заявок',
                            callback_data: 'admin_applications'
                        }
                    ]
                ]
            }
        }
    );
}


// =======================
// АДМИН — СТАТИСТИКА
// =======================

if (data === 'admin_statistics') {

    if (chatId !== ADMIN_ID) {
        return;
    }

    const savedApplications = getApplications();

    const totalApplications = savedApplications.length;

    const botOrders = savedApplications.filter(
        application => application.service === 'Telegram-бот'
    ).length;

    const shopOrders = savedApplications.filter(
        application => application.service === 'Telegram-магазин'
    ).length;

    const automationOrders = savedApplications.filter(
        application => application.service === 'Автоматизация'
    ).length;

    const fixOrders = savedApplications.filter(
        application => application.service === 'Доработка бота'
    ).length;

    const otherOrders = savedApplications.filter(
        application => application.service === 'Другое'
    ).length;


    bot.answerCallbackQuery(query.id);


    return bot.sendMessage(
        chatId,

        '📊 Статистика\n\n' +

        '📋 Всего заявок: ' +
        totalApplications +

        '\n\n' +

        '💼 По услугам:\n' +

        '🤖 Telegram-боты: ' +
        botOrders +

        '\n🛒 Telegram-магазины: ' +
        shopOrders +

        '\n⚙️ Автоматизация: ' +
        automationOrders +

        '\n🔧 Доработка бота: ' +
        fixOrders +

        '\n💡 Другое: ' +
        otherOrders
    );
}

    // =======================
    // ВЫБОР УСЛУГИ ДЛЯ ЗАКАЗА
    // =======================

    if (
        data === 'order_bot' ||
        data === 'order_shop' ||
        data === 'order_automation' ||
        data === 'order_fix' ||
        data === 'order_other'
    ) {

        let service = '';


        if (data === 'order_bot') {
            service = 'Telegram-бот';
        }

        if (data === 'order_shop') {
            service = 'Telegram-магазин';
        }

        if (data === 'order_automation') {
            service = 'Автоматизация';
        }

        if (data === 'order_fix') {
            service = 'Доработка бота';
        }

        if (data === 'order_other') {
            service = 'Другое';
        }
        if (!applications[chatId]) {
            applications[chatId] = {};
        }


        applications[chatId].service = service;

        applications[chatId].step = 'description';


        bot.sendMessage(
            chatId,

            '📝 Отлично!\n\n' +
            'Теперь опишите, что именно вам нужно.\n\n' +
            'Например:\n' +
            '«Хочу Telegram-магазин для продажи одежды с каталогом и корзиной».'
        );
            bot.answerCallbackQuery(query.id);
            return;
    }

     // =======================
    // TELEGRAM-МАГАЗИН
    // =======================

    if (data === 'portfolio_shop') {

        bot.sendMessage(
            chatId,

            '🛒 Telegram-магазин\n\n' +
            'Интернет-магазин внутри Telegram.\n\n' +
            '📱 Каталог товаров\n' +
            '🛒 Корзина\n' +
            '📝 Оформление заказа\n' +
            '🔔 Уведомление владельца\n' +
            '💾 Сохранение заказов',

            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🔗 Открыть проект',
                                url: 'https://t.me/SmartHub_Net_bot'
                            }
                        ]
                    ]
                }
            }
        );
    }

      // =======================
    // TELEGRAM-ВИЗИТКА
    // =======================

    if (data === 'portfolio_card') {

        bot.sendMessage(
            chatId,

            '💼 Telegram-визитка\n\n' +
            'Персональная визитка разработчика.\n\n' +
            'Выберите раздел:',

            {
                reply_markup: {
                    inline_keyboard: [

                        [
                            {
                                text: '👤 Обо мне',
                                callback_data: 'about_me'
                            }
                        ],

                        [
                            {
                                text: '💼 Услуги',
                                callback_data: 'my_services'
                            }
                        ],

                        [
                            {
                                text: '📂 Портфолио',
                                callback_data: 'my_portfolio'
                            }
                        ],

                        [
                            {
                                text: '☎️ Контакты',
                                callback_data: 'my_contacts'
                            }
                        ]

                    ]
                }
            }
        );
    }

      // =======================
    // ОБО МНЕ
    // =======================

    if (data === 'about_me') {

        bot.sendMessage(
            chatId,

            '👤 Обо мне\n\n' +
            'Привет! Я Влад 👋\n\n' +
            'Я начинающий разработчик, занимаюсь созданием Telegram-ботов и автоматизацией.\n\n' +

            '💻 Что разрабатываю:\n' +
            '▪️ 🤖 Telegram-ботов\n' +
            '▪️ 🛒 Telegram-магазины\n' +
            '▪️ 💼 Telegram-визитки\n' +
            '▪️ ⚙️ Автоматизацию процессов\n' +
            '▪️ 🔧 Доработку существующих ботов\n\n' +

            '📚 Постоянно изучаю JavaScript и Node.js и развиваю свои проекты на практике.\n\n' +

            '🎯 Моя цель — создавать простые, удобные и полезные решения для бизнеса и личных проектов.'
        );
    }

    // =======================
    // УСЛУГИ
    // =======================

    if (data === 'my_services') {

        bot.sendMessage(
            chatId,

            '💼 Мои услуги\n\n' +
            '🤖 Telegram-боты\n' +
            '🛒 Telegram-магазины\n' +
            '📇 Telegram-визитки\n' +
            '⚙️ Автоматизация процессов\n' +
            '🛠 Доработка существующих ботов'
        );
    }

// =======================
    // ПОРТФОЛИО
    // =======================

    if (data === 'my_portfolio') {

        bot.sendMessage(
            chatId,

            '📂 Моё портфолио\n\n' +
            'Выберите проект:',

            {
                reply_markup: {
                    inline_keyboard: [

                        [
                            {
                                text: '🛒 Telegram-магазин',
                                callback_data: 'portfolio_shop'
                            }
                        ],

                        [
                            {
                                text: '💼 Telegram-визитка',
                                callback_data: 'portfolio_card'
                            }
                        ],

                        [
                            {
                                text: '🤖 Другие боты',
                                callback_data: 'portfolio_bots'
                            }
                        ]

                    ]
                }
            }
        );
    }

     // =======================
    // КОНТАКТЫ
    // =======================

    if (data === 'my_contacts') {

        bot.sendMessage(
            chatId,

            '☎️ Контакты\n\n' +
            'Telegram: @br_k_791\n\n' +
            '💬 Напишите мне, чтобы обсудить проект.'
        );
    }

       // =======================
    // ДРУГИЕ БОТЫ
    // =======================

    if (data === 'portfolio_bots') {

        bot.sendMessage(
            chatId,

            '🤖 Другие боты\n\n' +
            'Новые проекты будут добавляться сюда.'
        );
    }

// =======================
    // ЗАКРЫВАЕМ CALLBACK
    // =======================

    bot.answerCallbackQuery(query.id);

});