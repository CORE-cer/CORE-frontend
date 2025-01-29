/*
{
  title: 'Example',
  query: 'Example query',
}
  */
const examples = [
  {
    title: 'Show all buy',
    query: `SELECT *
FROM Ticker
WHERE buy`,
  },
  {
    title: 'Show all sell',
    query: `SELECT *
FROM Ticker
WHERE sell`,
  },
  {
    title:
      'Show all buy/sell pairs in the same symbol (ETH-USD) in less than 5 seconds',
    query: `SELECT *
FROM Ticker
WHERE buy:sell
FILTER buy[product_id='ETH-USD'] AND sell[product_id='ETH-USD']
WITHIN 5 SECONDS
`,
  },
  {
    title:
      'Three buy events in BTC-USD with a price higher than US$100.000 in less than 10 seconds',
    query: `SELECT *
FROM Ticker
WHERE buy; buy; (buy AS b3)
FILTER buy[product_id='BTC-USD' AND price > 100000]
WITHIN 10 SECONDS
`,
  },
  {
    title:
      'Show all sell and buy lists when buy reaches the lowest of the day and then the highest of the day',
    query: `SELECT list
FROM Ticker
WHERE buy as b1 : (sell OR buy):+ AS list : buy as b2
FILTER b1[price <= low_24h] AND b2[price >= high_24h]
PARTITION BY [product_id]
WITHIN 30 MINUTES
`,
  },
];

export default examples;
