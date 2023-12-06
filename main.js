const express = require('express');
const { Telegraf } = require('telegraf');
const bodyParser = require('body-parser');

const BOT_TOKEN = '6349257220:AAEEuBDgDlJ_6h3vI_VzjCcW4XJR7vKsqZw';
const MAIN_CHANNEL = '@HeroesBUILD';

const app = express();
const bot = new Telegraf(BOT_TOKEN);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

bot.on('text', (ctx) => {
    ctx.reply('Received your message: ' + ctx.message.text);
});

app.post('/push', (req, res) => {
    try {
        const tx = req.body;
        // Assuming handleTransaction is defined elsewhere in your code
        handleTransaction(tx);
        bot.telegram.sendMessage(MAIN_CHANNEL, 'Transaction handled successfully');
        res.status(200).send('Transaction handled successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

bot.launch();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
