import {
  Box,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  ListItemIcon,
  FormControlLabel,
} from "@mui/material";
import { LoremIpsum } from "lorem-ipsum";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

const MAX_DATA = 100;
const MAX_COLORS = 16;

const lorem = new LoremIpsum();

const getFakeQueryIds = () => {
  return Array.from({ length: 23 }, (_, i) => i);
};

const fakeData = (qid) => {
  return { qid, data: `[${new Date().toISOString()}] Query #${qid} ${lorem.generateWords(5)}` };
};

const QuerySelectionItem = ({ qid, checked, handleChange }) => {
  return (
    <ListItem disablePadding>
      <ListItemButton onClick={handleChange}>
        <ListItemIcon>
          <Checkbox checked={checked} onChange={handleChange} className={`color-${qid % MAX_COLORS}`} />
        </ListItemIcon>
        <ListItemText primary={qid} sx={{ wordBreak: "break-all" }} />
      </ListItemButton>
    </ListItem>
  );
};

const QuerySelection = ({ queryIds, selectedQueryIds, setSelectedQueryIds }) => {
  const handleSelectSingleQuery = (qid) => {
    setSelectedQueryIds((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) {
        next.delete(qid);
      } else {
        next.add(qid);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedQueryIds.size === queryIds.length) {
      setSelectedQueryIds(new Set());
    } else {
      setSelectedQueryIds(new Set(queryIds));
    }
  };

  return (
    <Box sx={{ width: "200px", borderRight: 1, borderColor: "divider", overflowY: "scroll" }}>
      <List dense>
        <ListItem disablePadding>
          <ListItemButton onClick={handleSelectAll}>
            <ListItemIcon>
              <Checkbox
                color="text.primary"
                checked={selectedQueryIds.size === queryIds.length}
                onChange={handleSelectAll}
                indeterminate={selectedQueryIds.size > 0 && selectedQueryIds.size !== queryIds.length}
              />
            </ListItemIcon>
            <ListItemText primary="All queries" sx={{ wordBreak: "break-all" }} />
          </ListItemButton>
        </ListItem>
        <Divider />
        {queryIds.map((qid, idx) => (
          <QuerySelectionItem
            key={idx}
            qid={qid}
            checked={selectedQueryIds.has(qid)}
            handleChange={() => handleSelectSingleQuery(qid)}
          />
        ))}
      </List>
    </Box>
  );
};

const Watch = () => {
  const [queryIds, setQueryIds] = useState([]);
  const [selectedQueryIds, setSelectedQueryIds] = useState(new Set());
  const [data, setData] = useState([]);

  useEffect(() => {
    setQueryIds(getFakeQueryIds());

    // This simulates a websocket connection
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [];
        for (const qid of selectedQueryIds) {
          newData.push(fakeData(qid));
        }
        const updatedData = [...newData, ...prevData];
        if (updatedData.length > MAX_DATA) {
          return updatedData.slice(0, MAX_DATA);
        }
        return updatedData;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [selectedQueryIds]);

  return (
    <>
      <Helmet title={`Watch | CORE`} />
      <QuerySelection
        queryIds={queryIds}
        selectedQueryIds={selectedQueryIds}
        setSelectedQueryIds={setSelectedQueryIds}
      />
      <Box
        sx={{
          fontFamily: 'Consolas, "Courier New", monospace',
          p: 2,
          flex: 1,
          width: "100%",
          overflowY: "scroll",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        {data.map((d, idx) => (
          <Box className={`color-${queryIds.indexOf(d.qid) % MAX_COLORS}`} key={idx}>
            {d.data}
          </Box>
        ))}
      </Box>
    </>
  );
};

export default Watch;
