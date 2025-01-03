import { Box } from "@mui/material";
import { LoremIpsum } from "lorem-ipsum";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

const MAX_DATA = 100;

const lorem = new LoremIpsum();

const fakeData = () => {
  const queryId = Math.floor(Math.random() * 16);
  return {
    text: `[${new Date().toISOString()}] Query #${queryId} ${lorem.generateWords(5)}`,
    className: `query-${queryId % 16}`,
  };
};

const Watch = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // This simulates a websocket connection
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [fakeData(), ...prevData];
        if (newData.length > MAX_DATA) {
          return newData.slice(0, MAX_DATA);
        }
        return newData;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Helmet title={`Watch | CORE`} />
      <Box
        sx={{
          fontFamily: 'Consolas, "Courier New", monospace',
          p: 2,
          flex: 1,
          width: "100%",
          overflow: "scroll",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        {data.map((d, i) => (
          <Box className={d.className} key={i}>
            {d.text}
          </Box>
        ))}
      </Box>
    </>
  );
};

export default Watch;
