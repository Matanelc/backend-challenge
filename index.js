const fs = require('fs');
const turbo = require('turbo-http')
const port = +process.argv[2] || 3000
const client = require('redis').createClient();

const cardsData = fs.readFileSync('./cards.json');
const allCards = JSON.parse(cardsData).map(card => Buffer.from(`{"id": "${card.id}", "name": "${card.name}" }`));
let cards = [];
const userCards = {};
async function handleRequest (req, res) {
    if(req.url.indexOf('card_add') > -1) {
            const counter = userCards[req.url] ? userCards[req.url] : 0;
            if (counter >= 50) {
                res.setHeader('Content-Length', 21);
                res.write('{ "id": "ALL CARDS" }');
                return;
            }

            const card = cards[counter];
            userCards[req.url] = counter + 1;
            res.setHeader('Content-Length', 95);
            res.write(card);
            return;

    }
            res.setHeader('Content-Length', 19);
            res.write('{ "ready": "true" }');
}

client.on('ready', async () => {
    try {
        const serverId = await client.incr('serverId');
        cards =  serverId === 1 ? allCards.slice(0,50): allCards.slice(50, 100);
        const server = turbo.createServer(handleRequest)
        server.listen(port)
        console.log(`Server is running on http://0.0.0.0:${port}`);
    } catch (error) {
        console.error(error)
    }
})

client.connect();