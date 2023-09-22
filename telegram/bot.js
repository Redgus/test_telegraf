const { Telegraf } = require('telegraf');

function set_bot(token) {
    const bot = new Telegraf(token);

    return bot
}

module.exports = {
    set_bot
}