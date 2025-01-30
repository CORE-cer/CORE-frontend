/*
{
  title: 'Example',
  query: 'Example query',
}
  */
const examples = [
  {
    title: 'Show all Buy',
    query: `SELECT *
FROM TICKER
WHERE Buy`,
  },
  {
    title: 'Show all Sell of a symbol',
    query: `SELECT *
FROM TICKER
WHERE Sell
FILTER Sell[product_id='BTC-USD']`,
  },
  {
    title:
      'Show all Buy/Sell pairs in the same symbol (ETH-USD) in less than 5 seconds',
    query: `SELECT *
FROM TICKER
WHERE Buy:Sell
FILTER Buy[product_id='ETH-USD'] AND Sell[product_id='ETH-USD']
WITHIN 5 SECONDS
`,
  },
  {
    title:
      'Three Buy events in BTC-USD where the transaction size was at least 0.01BTC in less than 10 seconds',
    query: `SELECT b3
FROM TICKER
WHERE Buy; Buy; (Buy AS b3)
FILTER Buy[product_id='BTC-USD' AND last_size >= 0.01]
WITHIN 10 SECONDS
`,
  },
  {
    title:
      'Show all Sell and Buy lists when Buy reaches the lowest of the day and then the highest of the day',
    query: `SELECT list
FROM TICKER
WHERE Buy as b1 : (Sell OR Buy):+ AS list : Buy as b2
FILTER b1[price <= low_24h] AND b2[price >= high_24h]
PARTITION BY [product_id]
WITHIN 30 MINUTES
`,
  },
];

export default examples;
