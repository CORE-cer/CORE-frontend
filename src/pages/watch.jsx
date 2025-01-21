import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Box,
  Divider,
  List,
  Paper,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  ListItemIcon,
  Slider,
  Typography,
  Fab,
  Fade,
  Tooltip,
} from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Virtuoso } from 'react-virtuoso';

const MAX_COLORS = 16;
const SIDE_PANEL_WIDTH = 200;

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
        width: 'inherit',
        overflowY: 'scroll',
        flex: 1,
      }}
    >
      <List dense>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleSelectAll}
            disabled={queryIds.length === 0}
          >
            <ListItemIcon>
              <Checkbox
                disabled={queryIds.length === 0}
                color="text.primary"
                checked={
                  queryIds.length > 0 &&
                  selectedQueryIds.size === queryIds.length
                }
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

const EventIntervalSelector = ({ setValue }) => {
  const valueLabelFormat = (value) => {
    if (value === 0) return 'Unlimited (Real-time)';
    if (value > 1000) return `${value / 1000}s`;
    return `${value}ms`;
  };

  return (
    <Box sx={{ width: 'inherit', px: 2, py: 2 }}>
      <Typography gutterBottom>{'Event Interval'}</Typography>
      <Slider
        onChangeCommitted={(_, value) => setValue(value)}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        step={500}
        marks
        valueLabelFormat={valueLabelFormat}
        valueLabelDisplay="auto"
        min={0}
        max={5000}
      />
    </Box>
  );
};

const ScrollToLatest = ({ trigger, scrollToBottom }) => {
  // https://mui.com/material-ui/react-app-bar/
  return (
    <Fade in={trigger}>
      <Tooltip title="Go to bottom" arrow>
        <Fab
          size="small"
          onClick={scrollToBottom}
          variant="circular"
          color="default"
          sx={{
            opacity: '0.5 !important',
            position: 'fixed',
            bottom: 32,
            right: 32,
            '&:hover': {
              opacity: '1 !important',
            },
          }}
        >
          <KeyboardArrowDownIcon />
        </Fab>
      </Tooltip>
    </Fade>
  );
};

const Watch = () => {
  const [queries, setQueries] = useState([]);
  const [selectedQueryIds, setSelectedQueryIds] = useState(new Set());
  const [data, setData] = useState([]);
  const [eventInterval, setEventInterval] = useState(0);

  const [qid2Websockets, setQid2Websockets] = useState({});

  const virtuoso = useRef(null);

  const dataBuffer = useRef([]);

  const [atBottom, setAtBottom] = useState(true);

  // Fetch queries at mount and refresh every {delay} ms
  useEffect(() => {
    const fetchQueries = async () => {
      try {
        setQueries(await getQueries());
      } catch (e) {
        console.error('Error fetching queries:', e);
      }
    };

    // First fetch
    fetchQueries();

    // Refresh
    const delay = 1000;
    const interval = setInterval(fetchQueries, delay);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setQid2Websockets((prev) => {
      const next = { ...prev };
      const baseUrl = import.meta.env.VITE_CORE_BACKEND_URL;

      // Close connections only for removed qids
      for (const qid of Object.keys(next)) {
        // Keep the existing connection
        if (selectedQueryIds.has(qid)) continue;

        const ws = next[qid];
        ws.close();
        delete next[qid];
      }

      // Add the new connections
      for (const qid of selectedQueryIds) {
        // Do not add the existing connection
        if (next[qid]) continue;

        const ws = new WebSocket(baseUrl + '/' + qid);
        next[qid] = ws;
        ws.onopen = () => {
          console.log('Connected to qid', qid);
        };
        ws.onclose = () => {
          console.log('Disconnected from qid', qid);
        };
        ws.onerror = () => {
          console.log('Error on qid', qid);
        };
      }
      return next;
    });
  }, [selectedQueryIds]);

  useEffect(() => {
    console.log('Changing all WebSockets onmessage');
    if (eventInterval > 0) {
      // Buffered updates
      for (const [qid, ws] of Object.entries(qid2Websockets)) {
        ws.onmessage = (event) => {
          dataBuffer.current.push({ qid, data: event.data });
        };
      }
    } else {
      // Real-time updates. Flush buffer
      const currentBuffer = dataBuffer.current;
      dataBuffer.current = [];
      setData((prevData) => [...prevData, ...currentBuffer]);
      for (const [qid, ws] of Object.entries(qid2Websockets)) {
        ws.onmessage = (event) => {
          setData((prevData) => {
            return [...prevData, { qid, data: event.data }];
          });
        };
      }
    }
  }, [eventInterval, qid2Websockets]);

  useEffect(() => {
    // Enable interval if necessary
    if (eventInterval === 0) return;

    console.log('Setting up buffered interval with', eventInterval, 'ms');
    const bufferedInterval = setInterval(() => {
      const first = dataBuffer.current.shift();
      if (first) {
        setData((prevData) => {
          return [...prevData, first];
        });
      }
    }, eventInterval);
    return () => {
      console.log('Clearing buffered interval');
      clearInterval(bufferedInterval);
    };
  }, [eventInterval]);

  useEffect(() => {
    return () => {
      console.log('Disconnecting from all websockets...');
      for (const ws of Object.values(qid2Websockets)) {
        ws.close();
      }
    };
  }, []);

  // useEffect(() => {
  //   const websocketConnections = [];

  //   if (eventInterval > 0) {
  //     console.error('TODO');
  //   } else {
  //     console.log('MOUNT');
  //     for (const qid of selectedQueryIds) {
  //       const baseUrl = import.meta.env.VITE_CORE_BACKEND_URL;
  //       const ws = new WebSocket(baseUrl + '/' + qid);
  //       websocketConnections.push(ws);
  //       ws.onmessage = (event) => {
  //         setData((prevData) => {
  //           return [...prevData, { qid, data: event.data }];
  //         });
  //       };
  //     }
  //   }

  //   return () => {
  //     console.log('UNMOUNT');
  //     websocketConnections.map((ws) => {
  //       ws.close();
  //     });
  //   };

  //   // const websocketConnections = [];
  //   // if (eventInterval > 0) {
  //   //   // Throttle events
  //   //   dataBuffer.current = [];
  //   //   for (const qid of selectedQueryIds) {
  //   //     const baseUrl = import.meta.env.VITE_CORE_BACKEND_URL;
  //   //     const ws = new WebSocket(baseUrl + '/' + qid);
  //   //     websocketConnections.push(ws);
  //   //     for (const ws of websocketConnections) {
  //   //       ws.onmessage = (event) => {
  //   //         // Store data in buffer
  //   //         dataBuffer.current.push({ qid, data: event.data });
  //   //       };
  //   //     }
  //   //   }
  //   //   const throttleInterval = setInterval(() => {
  //   //     if (dataBuffer.current.length > 0) {
  //   //       while (dataBuffer.current.length > 1) {
  //   //         const first = dataBuffer.current.shift();
  //   //         if (first.qid in selectedQueryIds) {
  //   //           setData((prevData) => {
  //   //             return [...prevData, first];
  //   //           });
  //   //           break;
  //   //         }
  //   //       }
  //   //     }
  //   //   }, eventInterval);
  //   //   return () => {
  //   //     clearInterval(throttleInterval);
  //   //     dataBuffer.current = [];
  //   //     for (const ws of websocketConnections) {
  //   //       ws.close();
  //   //     }
  //   //   };
  //   // } else {
  //   //   // Real-time events
  //   //   for (const qid of selectedQueryIds) {
  //   //     const baseUrl = import.meta.env.VITE_CORE_BACKEND_URL;
  //   //     const ws = new WebSocket(baseUrl + '/' + qid);
  //   //     websocketConnections.push(ws);
  //   //     for (const ws of websocketConnections) {
  //   //       ws.onmessage = (event) => {
  //   //         setData((prevData) => {
  //   //           return [...prevData, { qid, data: event.data }];
  //   //         });
  //   //       };
  //   //     }
  //   //   }
  //   //   return () => {
  //   //     for (const ws of websocketConnections) {
  //   //       ws.close();
  //   //     }
  //   //   };
  //   // }
  // }, [selectedQueryIds, eventInterval]);

  const renderItem = (index, data) => {
    return (
      <Box sx={{ px: 1, py: 0.5 }}>
        <Paper
          className={`color-${data.qid % MAX_COLORS}`}
          sx={{
            p: 0.5,
            fontFamily: 'Consolas, "Courier New", monospace',
            fontSize: 12,
            wordBreak: 'break-all',
          }}
        >
          {data.data}
        </Paper>
      </Box>
    );
  };

  return (
    <>
      <Helmet title={`Watch | CORE`} />
      <ScrollToLatest
        trigger={!atBottom}
        scrollToBottom={() => virtuoso.current.scrollToIndex(data.length - 1)}
      />
      <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: SIDE_PANEL_WIDTH,
            borderRight: 1,
            borderColor: 'divider',
          }}
        >
          <EventIntervalSelector setValue={setEventInterval} />
          <Divider />
          <QuerySelection
            queryIds={queries.map((q) => q.result_handler_identifier)}
            selectedQueryIds={selectedQueryIds}
            setSelectedQueryIds={setSelectedQueryIds}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <Virtuoso
            overscan={50}
            ref={virtuoso}
            alignToBottom
            atBottomStateChange={setAtBottom}
            followOutput={(isAtBottom) => (isAtBottom ? 'auto' : false)} // Auto-scroll if the window is at the bottom
            atBottomThreshold={10}
            data={data}
            itemContent={renderItem}
          />
        </Box>
      </Box>
    </>
  );
};

export default Watch;
