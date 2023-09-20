const config = require('config');
const { Telegraf } = require('telegraf')
const { MongoClient } = require('mongodb');
const { session } = require('telegraf-session-mongodb');
const axios = require('axios');

const bot = new Telegraf(config.get('token'))

const init = async () => {
    const db = (await MongoClient.connect(config.get('Mongo.url'), { useNewUrlParser: true, useUnifiedTopology: true, dbName : 'telegram' })).db();

    bot.use(session(db));

    bot.use(async (ctx, next) => {

        const date = new Date();
    
        console.log('new code');
    
        ctx.session.date = `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`;
        
        console.log(`[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] Пользователь ${ctx.from.id}`);
        await next();
    });
    
    bot.start((ctx) => ctx.reply('Welcome 1'))
    bot.help((ctx) => ctx.reply('Send me a sticker'))
    bot.on('sticker', (ctx) => ctx.reply('👍'))
    bot.hears('hi', (ctx) => ctx.reply('Hey there'))
    
    bot.command('get_rate', (ctx) => {

        let mas = ['RUB', 'EUR', 'USD'];

        let date = new Date();

        for (const key of mas) {
            axios.get(`${config.get('url_rate')}/${key}/${date.getUTCFullYear()}-0${date.getUTCMonth() + 1}-${date.getUTCDate()}`)
            .then(function (response) {

                for (const iterator of response.data) {
                    ctx.reply(`${iterator.CcyNm_UZ} - ${iterator.Rate} - ${ iterator.Date }`)
                }
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .finally(function () {
                // always executed
            });
        }

        
    })

    bot.catch((err, ctx) => {
        console.error(`⚠️ Error on ${ctx.updateType}: ${err.message}`, err)
    });
	
    bot.launch();
}

init()