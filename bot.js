const { Telegraf } = require('telegraf');
const BOT_TOKEN = '6349257220:AAEEuBDgDlJ_6h3vI_VzjCcW4XJR7vKsqZw';
const bot = new Telegraf(BOT_TOKEN);

// Xử lý khi nhận tin nhắn văn bản
bot.on('text', (ctx) => {
    const message = ctx.message.text.toLowerCase(); // Chuyển đổi văn bản về chữ thường để đơn giản hóa việc so sánh

    // Xử lý truy vấn với từ khóa "hero"
    if (message.includes('hero')) {
        // Gửi phản hồi hoặc thông tin tùy thuộc vào yêu cầu của bạn
        ctx.reply('Bạn đang tìm thông tin về siêu anh hùng?');
    }
});

// Bắt đầu bot
bot.launch();
