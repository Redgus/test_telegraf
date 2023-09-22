const { connect_db } = require('./db/connect');
const config = require('config');
const { set_bot } = require('./telegram/bot');
const { get_baza } = require('./component/rate_currency');

const bot = set_bot(config.get('token'));

async function main() {
    const db = await connect_db(config.get('Mongo.url'));
    
    let data = await db.collection('sessions').find({}).toArray();

    let data_currency = await get_baza();

    for (const iterator of data) {
        
        if (iterator.data.chat_id) {
            for (const key of data_currency) {
                await bot.telegram.sendMessage(iterator.data.chat_id, `${key.name} - ${key.rate} - ${key.date}`)
            }
        }
    }

    process.exit(1);
}

main();