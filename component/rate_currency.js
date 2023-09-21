const axios = require('axios');
const config = require('config');

function currecy_all() {
    
    axios.get(`${config.get('url_rate')}/all/${date.getUTCFullYear()}-0${date.getUTCMonth() + 1}-${date.getUTCDate()}`)
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

async function get_currency(currency) {

    let date = new Date();

    let data = await axios.get(`${config.get('url_rate')}/${currency}/${date.getUTCFullYear()}-0${date.getUTCMonth() + 1}-${date.getUTCDate()}`);

    return {
        'name' : data.CcyNm_UZ,
        'rate' : data.Rate,
        'date' : data.Date,
    };
}

async function get_baza() {
    let mas = ['RUB', 'EUR', 'USD'];

    let data = [];
    
    for (const key of mas) {

        data.push(await get_currency());
    }

    return data;
}

module.exports = {
    currecy_all,
    get_currency,
    get_baza
}