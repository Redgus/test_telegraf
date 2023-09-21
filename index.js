const config = require('config');
const { Telegraf, Markup } = require('telegraf');
const { MongoClient } = require('mongodb');
const { session } = require('telegraf-session-mongodb');

const path = require('path');
const TelegrafI18n = require('telegraf-i18n');
const { match, reply } = require('telegraf-i18n');
const { get_baza } = require('./component/rate_currency');
const i18n = new TelegrafI18n({
    useSession: true,
    defaultLanguageOnMissing: true,
    directory: path.resolve(__dirname, 'locales')
});

const bot = new Telegraf(config.get('token'));

const init = async () => {
    const db = (await MongoClient.connect(config.get('Mongo.url'), { useNewUrlParser: true, useUnifiedTopology: true, dbName : 'telegram' })).db();

    bot.use(session(db));

    bot.use(i18n.middleware());

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

        let caption = ctx.i18n.t('greeting', { name : ctx.from.username});

        let settings = { parse_mode: 'MarkdownV2', disable_web_page_preview: true, ...Markup.keyboard([
                [ctx.i18n.t('checkout')],
                [ctx.i18n.t('rate_get')],
                [ctx.i18n.t('setting')]
            ]).resize()
        }

        return await ctx.send_message(ctx, caption, settings);
    })
    bot.help((ctx) => ctx.reply('Send me a sticker'))
    bot.on('sticker', (ctx) => ctx.reply('👍'))
    bot.hears('Русский', (ctx) => ctx.i18n.locale('ru'))
    bot.hears('English', (ctx) => ctx.i18n.locale('en'))
    bot.hears('O\'zbek', (ctx) => ctx.i18n.locale('uz'))

    bot.hears(match('setting'), async (ctx) => {
        let caption = ctx.i18n.t('greeting', { name : ctx.from.username});

        let settings = { parse_mode: 'MarkdownV2', disable_web_page_preview: true, ...Markup.keyboard([
                ["Русский", "English", "O'zbek"]
            ]).resize()
        }

        return await ctx.send_message(ctx, caption, settings);
    });
    
    bot.hears(match('rate_get'), async (ctx) => {

        let data = await get_baza();

        for (const key of data) {
            ctx.reply(`${key.name} - ${key.rate} - ${key.date}`)

        }
    });

    bot.catch((err, ctx) => {
        console.error(`⚠️ Error on ${ctx.updateType}: ${err.message}`, err)
    });
	
    bot.launch();
}

init()