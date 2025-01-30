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
  IconButton,
} from '@mui/material';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Virtuoso } from 'react-virtuoso';
import DeleteIcon from '@mui/icons-material/Delete';
import { enqueueSnackbar } from 'notistack';

const MAX_COLORS = 16;
const SIDE_PANEL_WIDTH = 200;

const getQueries = async () => {
  const baseUrl = import.meta.env.VITE_CORE_BACKEND_URL;
  const fetchRes = await fetch(baseUrl + '/all-queries-info', {
    method: 'GET',
  });
  const queries = await fetchRes.json();
  return queries.filter((query) => query.active);
};

const getStreamsInfo = async () => {
  const baseUrl = import.meta.env.VITE_CORE_BACKEND_URL;
  const fetchRes = await fetch(baseUrl + '/all-streams-info', {
    method: 'GET',
  });
  const streamsInfo = await fetchRes.json();
  return streamsInfo;
};

const inactivateQuery = async (qid) => {
  const baseUrl = import.meta.env.VITE_CORE_BACKEND_URL;
  const fetchRes = await fetch(baseUrl + '/inactivate-query/' + qid, {
    method: 'DELETE',
  });
  if (!fetchRes.ok) {
    throw new Error('Failed to inactivate query');
  }
  console.log('Successfully inactivated query', qid);
};

const QuerySelectionItem = ({
  query,
  checked,
  handleChange,
  handleInactivateQuery,
}) => {
  return (
    <ListItem
      disablePadding
      secondaryAction={
        <Tooltip title={`Remove query`} arrow placement="right">
          <IconButton
            size="small"
            edge="end"
            onClick={() =>
              handleInactivateQuery(query.result_handler_identifier)
            }
          >
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </Tooltip>
      }
    >
      <ListItemButton onClick={handleChange}>
        <ListItemIcon>
          <Checkbox
            color="text.primary"
            checked={checked}
            className={`color-${query.result_handler_identifier % MAX_COLORS}`}
            disableFocusRipple
            disableTouchRipple
          />
        </ListItemIcon>
        <ListItemText
          primary={query.query_name}
          sx={{ wordBreak: 'break-all' }}
        />
      </ListItemButton>
    </ListItem>
  );
};

const QuerySelection = ({ queries, selectedQueryIds, setSelectedQueryIds }) => {
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
      setSelectedQueryIds(
        new Set(queries.map((q) => q.result_handler_identifier))
      );
    } else {
      setSelectedQueryIds(new Set());
    }
  };

  const handleInactivateQuery = (qid) => {
    inactivateQuery(qid);
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
            disabled={queries.length === 0}
          >
            <ListItemIcon>
              <Checkbox
                disabled={queries.length === 0}
                color="text.primary"
                checked={
                  queries.length > 0 && selectedQueryIds.size === queries.length
                }
                indeterminate={
                  selectedQueryIds.size > 0 &&
                  selectedQueryIds.size !== queries.length
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
        {queries.map((query, idx) => (
          <QuerySelectionItem
            key={idx}
            query={query}
            checked={selectedQueryIds.has(query.result_handler_identifier)}
            handleChange={() =>
              handleSelectSingleQuery(query.result_handler_identifier)
            }
            handleInactivateQuery={() =>
              handleInactivateQuery(query.result_handler_identifier)
            }
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
  const [streamsInfo, setStreamsInfo] = useState([]);
  const [selectedQueryIds, setSelectedQueryIds] = useState(new Set());
  const [data, setData] = useState([]);
  const [eventInterval, setEventInterval] = useState(0);
  const [atBottom, setAtBottom] = useState(false);

  const [qid2Websockets, setQid2Websockets] = useState({});

  const virtuoso = useRef(null);

  const dataBuffer = useRef([]);

  const formatComplexEvents = useCallback(
    (complexEventsJson) => {
      function getEventInfoFromEventId(eventId) {
        for (let streamInfo of streamsInfo) {
          for (let eventInfo of streamInfo['events_info']) {
            if (eventInfo['id'] === eventId) {
              return eventInfo;
            }
          }
        }
      }
      let outputComplexEvents = [];
      for (const complexEvent of complexEventsJson) {
        let outputComplexEvent = {};
        outputComplexEvent['start'] = complexEvent['start'];
        outputComplexEvent['end'] = complexEvent['end'];
        let events = [];
        for (let event of complexEvent['eventss']) {
          let eventOutput = {};
          event = event['event'];
          const eventInfo = getEventInfoFromEventId(event['event_type_id']);
          eventOutput['event_type'] = eventInfo['name'];
          for (let i = 0; i < eventInfo['attributes_info'].length; i++) {
            const attributeInfo = eventInfo['attributes_info'][i];
            const attributeValue = event['attributes'][i];
            eventOutput[attributeInfo['name']] = attributeValue;
          }
          events.push(eventOutput);
        }
        outputComplexEvent['events'] = events;

        const triggerDate = new Date(outputComplexEvent['end'] / 1000000);

        const outputString = `Event Triggered at time ${triggerDate.toISOString()} - ${JSON.stringify(outputComplexEvent)}`;

        outputComplexEvents.push(outputString);
      }
      return outputComplexEvents.join('\n');
    },
    [streamsInfo]
  );

  // Fetch queries at mount and refresh every {delay} ms
  useEffect(() => {
    const fetchQueries = async () => {
      try {
        setQueries(await getQueries());
      } catch (err) {
        enqueueSnackbar(`Error fetching queries: ${err}`, { variant: 'error' });
        console.error('Error fetching queries:', err);
      }
    };
    const fetchStreamsInfo = async () => {
      try {
        setStreamsInfo(await getStreamsInfo());
      } catch (err) {
        enqueueSnackbar(`Error fetching streams info: ${err}`, {
          variant: 'error',
        });
        console.error('Error fetching streams info:', err);
      }
    };

    // First fetch
    fetchQueries();
    fetchStreamsInfo();

    // Refresh
    const delay = 500;
    const interval = setInterval(() => {
      fetchQueries();
      fetchStreamsInfo();
    }, delay);
    return () => clearInterval(interval);
  }, []);

  // Remove queries that are no longer active
  useEffect(() => {
    setSelectedQueryIds((prev) => {
      const next = new Set(prev);
      for (const qid of prev) {
        if (!queries.find((q) => q.result_handler_identifier === qid)) {
          next.delete(qid);
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queries)]);

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
    if (eventInterval > 0) {
      // Buffered updates
      for (const [qid, ws] of Object.entries(qid2Websockets)) {
        ws.onmessage = (event) => {
          const eventJson = JSON.parse(event.data);
          const transformedEvent = formatComplexEvents(eventJson);
          dataBuffer.current.push({ qid, data: transformedEvent });
        };
      }
    } else {
      // Real-time updates. Flush buffer
      let currentBuffer = dataBuffer.current;
      dataBuffer.current = [];
      currentBuffer = currentBuffer.filter(
        (item) => item.qid in qid2Websockets
      );
      setData((prevData) => [...prevData, ...currentBuffer]);
      for (const [qid, ws] of Object.entries(qid2Websockets)) {
        ws.onmessage = (event) => {
          setData((prevData) => {
            const eventJson = JSON.parse(event.data);
            const transformedEvent = formatComplexEvents(eventJson);
            return [...prevData, { qid, data: transformedEvent }];
          });
        };
      }
    }
  }, [eventInterval, qid2Websockets, formatComplexEvents]);

  // Enable interval if necessary
  useEffect(() => {
    if (eventInterval === 0) return;

    console.log('Setting up buffered interval with', eventInterval, 'ms');
    const bufferedInterval = setInterval(() => {
      while (dataBuffer.current.length > 0) {
        const first = dataBuffer.current.shift();
        if (first && selectedQueryIds.has(first.qid)) {
          setData((prevData) => {
            return [...prevData, first];
          });
          break;
        }
      }
    }, eventInterval);
    return () => {
      console.log('Clearing buffered interval');
      clearInterval(bufferedInterval);
    };
  }, [eventInterval, selectedQueryIds]);

  useEffect(() => {
    return () => {
      console.log('Disconnecting from all websockets...');
      for (const ws of Object.values(qid2Websockets)) {
        ws.close();
      }
    };
  }, []);

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

  const handleScrollToBottom = () => {
    if (!virtuoso.current) return;
    virtuoso.current.scrollToIndex(data.length - 1);
  };

  return (
    <>
      <Helmet title={`Watch | CORE Beta`} />
      <ScrollToLatest
        trigger={!atBottom}
        scrollToBottom={handleScrollToBottom}
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
            queries={queries}
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
            followOutput="auto" // Auto-scroll if the window is at the bottom
            atBottomThreshold={300}
            data={data}
            itemContent={renderItem}
          />
        </Box>
      </Box>
    </>
  );
};

export default Watch;
