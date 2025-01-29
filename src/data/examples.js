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
WHERE BUY`,
  },
  {
    title: 'Show all sell',
    query: `SELECT *
FROM Ticker
WHERE SELL`,
  },
  {
    title:
      'Show all buy/sell pairs in the same symbol (ETH-USD) in less than 5 seconds',
    query: `SELECT *
FROM Ticker
WHERE BUY:SELL
FILTER BUY[product_id='ETH-USD'] AND SELL[product_id='ETH-USD']
WITHIN 5 SECONDS
`,
  },
  {
    title:
      'Three buy events in BTC-USD with a price higher than US$100.000 in less than 10 seconds',
    query: `SELECT *
FROM Ticker
WHERE BUY; BUY; (BUY AS b3)
FILTER BUY[product_id='BTC-USD' AND price > 100000]
WITHIN 10 SECONDS
`,
  },
  {
    title:
      'Show all sell and buy lists when buy reaches the lowest of the day and then the highest of the day',
    query: `SELECT list
FROM Ticker
WHERE BUY as b1 : (SELL OR BUY):+ AS list : BUY as b2
FILTER b1[price <= low_24h] AND b2[price >= high_24h]
PARTITION BY [product_id]
WITHIN 30 MINUTES
`,
  },
];

export default examples;
