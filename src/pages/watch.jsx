import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  ListItemIcon,
  Paper,
} from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Virtuoso } from 'react-virtuoso';

const MAX_COLORS = 16;
const QUERY_SELECTION_WIDTH = 200;

const getQueries = async () => {
  const baseUrl = import.meta.env.VITE_CORE_BACKEND_URL;
  const fetchRes = await fetch(baseUrl + '/all-queries-info', {
    method: 'GET',
  });
  return await fetchRes.json();
};

const QuerySelectionItem = ({ qid, checked, handleChange }) => {
  return (
    <ListItem disablePadding>
      <ListItemButton onClick={handleChange}>
        <ListItemIcon>
          <Checkbox
            color="text.primary"
            checked={checked}
            className={`color-${qid % MAX_COLORS}`}
            disableFocusRipple
            disableTouchRipple
          />
        </ListItemIcon>
        <ListItemText primary={qid} sx={{ wordBreak: 'break-all' }} />
      </ListItemButton>
    </ListItem>
  );
};

const QuerySelection = ({
  queryIds,
  selectedQueryIds,
  setSelectedQueryIds,
}) => {
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
    if (selectedQueryIds.size === 0) {
      setSelectedQueryIds(new Set(queryIds));
    } else {
      setSelectedQueryIds(new Set());
    }
  };

  return (
    <Box
      sx={{
        width: QUERY_SELECTION_WIDTH,
        borderRight: 1,
        borderColor: 'divider',
        overflowY: 'scroll',
      }}
    >
      <List dense>
        <ListItem disablePadding>
          <ListItemButton onClick={handleSelectAll}>
            <ListItemIcon>
              <Checkbox
                color="text.primary"
                checked={selectedQueryIds.size === queryIds.length}
                indeterminate={
                  selectedQueryIds.size > 0 &&
                  selectedQueryIds.size !== queryIds.length
                }
                disableFocusRipple
                disableTouchRipple
              />
            </ListItemIcon>
            <ListItemText
              primary="All queries"
              sx={{ wordBreak: 'break-all' }}
            />
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
  const [queries, setQueries] = useState([]);
  const [selectedQueryIds, setSelectedQueryIds] = useState(new Set());
  const [data, setData] = useState([
    { qid: 1, data: new Date().toISOString() },
  ]);

  const virtuoso = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setData((prevData) => [
        ...prevData,
        { qid: 3, data: new Date().toISOString() },
      ]);
      // dataContainerRef.current.scrollBy(0,-100)
    }, 50);

    // async function setQueryData() {
    //   setQueries(await getQueries());
    // }
    // setQueryData();
    // const websocketConnections = [];

    // for (const qid of selectedQueryIds) {
    //   const baseUrl = import.meta.env.VITE_CORE_BACKEND_URL;
    //   const webSocket = new WebSocket(baseUrl + '/' + qid);
    //   websocketConnections.push(webSocket);
    //   webSocket.onmessage = (event) => {
    //     setData((prevData) => {
    //       const updatedData = [{ qid, data: event.data }, ...prevData];
    //       if (updatedData.length > MAX_DATA) {
    //         return updatedData.slice(0, MAX_DATA);
    //       }
    //       return updatedData;
    //     });
    //   };
    // }
    // return () => {
    //   for (const webSocket of websocketConnections) {
    //     webSocket.close();
    //   }
    // };
  }, [selectedQueryIds]);

  const renderItem = (index) => {
    const item = data[index];
    return (
      <Box
        className={`color-${item.qid % MAX_COLORS}`}
        sx={{
          px: 1,
          fontFamily: 'Consolas, "Courier New", monospace',
          wordBreak: 'break-all',
        }}
      >
        {item.data}
      </Box>
    );
  };

  return (
    <>
      <Helmet title={`Watch | CORE`} />
      <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
        <QuerySelection
          queryIds={queries.map((q) => Number(q.result_handler_identifier))}
          selectedQueryIds={selectedQueryIds}
          setSelectedQueryIds={setSelectedQueryIds}
        />
        <Box
          sx={{
            flex: 1,
            width: '100%',
            height: '100%',
          }}
        >
          <Virtuoso
            increaseViewportBy={{ top: 400, bottom: 400 }}
            ref={virtuoso}
            alignToBottom
            // Auto-scroll if the window is at the bottom
            followOutput={(isAtBottom) => (isAtBottom ? 'auto' : false)}
            style={{ flex: 1 }}
            totalCount={data.length}
            itemContent={renderItem}
          />
        </Box>
      </Box>
    </>
  );
};

export default Watch;
