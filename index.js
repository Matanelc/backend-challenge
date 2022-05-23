const fs = require("fs");
const turbo = require("turbo-http");
const port = +process.argv[2] || 3000;
const client = require("redis").createClient();
client.connect();

const cardsData = fs.readFileSync("./cards.json");
const allCards = JSON.parse(cardsData).map((card) =>
  Buffer.from(`{"id":"${card.id}","name":"${card.name}"}`)
);
const doneMsg = Buffer.from('{"id":"ALL CARDS"}')
const readMsg = Buffer.from('{"ready":"true"}')
let cards = [];
const userCards = [];
async function handleRequest(req, res) {
  if (req.url.indexOf("card_add") > -1) {
    const counter = userCards[req.url] ? userCards[req.url] : 0;
    if (counter >= 50) {
      return res.end(doneMsg);
    }
    const card = cards[counter];
    userCards[req.url] = counter + 1;
    return res.end(card);
  }
  return res.end(readMsg);
}

client.on("ready", async () => {
    const serverId = await client.incr("serverId");
    cards = serverId === 1 ? allCards.slice(0, 50) : allCards.slice(50, 100);
    const server = turbo.createServer(handleRequest);
    server.listen(port);
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
