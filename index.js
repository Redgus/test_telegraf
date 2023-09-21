const config = require('config');
const { Telegraf, Markup } = require('telegraf')
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

        ctx.format_message_telegram = async (text) => {

            const specialChars = /[.()+_~\-#*=!]/g;
            const format_test = text.replace(specialChars, match => `\\${match}`);
            return format_test.replace(/\\\(\\\(/g, '(').replace(/\\\)\\\)/g, ')'); // replace "((" with "(" and "))" with ")"
        }

        ctx.send_message = async (ctx, message, settings=null) => {

            try {
      
                return await ctx.editMessageText(
                    await ctx.format_message_telegram(message), 
                    settings
                );
            } catch (error) {
                
                if(ctx.callbackQuery?.message.message_id){

                    await ctx.tg.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id)
                }

                return await ctx.reply(
                  await ctx.format_message_telegram(message), 
                  settings
                );
            }
        }

        await next();
    });
    
    bot.start(async (ctx) => {
        let caption = `Здравствуйте.`

        let settings = { parse_mode: 'MarkdownV2', disable_web_page_preview: true, ...Markup.keyboard([
			["Получить курсы"]
		]).resize()
    }

        return await ctx.send_message(ctx, caption, settings);
    })
    bot.help((ctx) => ctx.reply('Send me a sticker'))
    bot.on('sticker', (ctx) => ctx.reply('👍'))
    bot.hears('hi', (ctx) => ctx.reply('Hey there'))
    
    bot.hears('Получить курсы', (ctx) => {

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