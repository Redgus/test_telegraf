const config = require('config');
const { Telegraf } = require('telegraf');

const bot = new Telegraf(config.get('token'));

module.exports = {
    bot
}