import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Checkbox,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { MAX_COLORS } from '../colors';
import HitList from '../components/HitList';
import Stats from '../components/Stats';
import Charts from '../components/Charts';

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

const Watch = () => {
  const [queries, setQueries] = useState([]);
  const [streamsInfo, setStreamsInfo] = useState([]);
  const [selectedQueryIds, setSelectedQueryIds] = useState(new Set());
  const [data, setData] = useState([]);
  const [eventInterval, setEventInterval] = useState(0);

  const currentQid2HitRef = useRef({});
  const [qid2Stats, setQid2Stats] = useState({});

  const [viewMode, setViewMode] = useState('list');

  const [qid2Websockets, setQid2Websockets] = useState({});

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

    // Fetch with some delay afterwards
    const interval = setInterval(() => {
      fetchQueries();
      fetchStreamsInfo();
    }, 1000);
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

  // handle opening/closing ws connections
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
          currentQid2HitRef.current[qid] = {
            numHits: 0,
            numComplexEvents: 0,
          };
          setQid2Stats((prev) => {
            const next = { ...prev };
            next[qid] = {
              perSec: [],
              hitStats: {
                max: 0,
                total: 0,
              },
              complexEventStats: {
                max: 0,
                total: 0,
              },
            };
            return next;
          });
        };
        ws.onclose = () => {
          console.log('Disconnected from qid', qid);
          delete currentQid2HitRef.current[qid];
          setQid2Stats((prev) => {
            const next = { ...prev };
            delete next[qid];
            return next;
          });
          setSelectedQueryIds((prev) => {
            const next = new Set(prev);
            next.delete(qid);
            return next;
          });
        };
        ws.onerror = () => {
          console.log('Error on qid', qid);
        };
      }
      return next;
    });
  }, [currentQid2HitRef, selectedQueryIds]);

  // onmessage handlers for queries
  useEffect(() => {
    if (eventInterval > 0) {
      // Buffered updates
      for (const [qid, ws] of Object.entries(qid2Websockets)) {
        ws.onmessage = (event) => {
          const eventJson = JSON.parse(event.data);
          const transformedEvent = formatComplexEvents(eventJson);

          currentQid2HitRef.current[qid].numHits += 1;
          currentQid2HitRef.current[qid].numComplexEvents += 99; // TODO: calcualte

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

            currentQid2HitRef.current[qid].numHits += 1;
            currentQid2HitRef.current[qid].numComplexEvents += 99; // TODO: calcualte

            return [...prevData, { qid, data: transformedEvent }];
          });
        };
      }
    }
  }, [eventInterval, qid2Websockets, formatComplexEvents, currentQid2HitRef]);

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

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentQid2HitRef.current.length === 0) {
        return;
      }

      setQid2Stats((prev) => {
        const next = { ...prev };
        for (const qid in next) {
          const curr = next[qid];
          curr.perSec.push({
            ...currentQid2HitRef.current[qid],
            time: Date.now(),
          });

          // increase total
          curr.hitStats.total += currentQid2HitRef.current[qid].numHits;
          curr.complexEventStats.total +=
            currentQid2HitRef.current[qid].numComplexEvents;

          // update max
          curr.hitStats.max = Math.max(
            curr.hitStats.max,
            currentQid2HitRef.current[qid].numHits
          );
          curr.complexEventStats.max = Math.max(
            curr.complexEventStats.max,
            currentQid2HitRef.current[qid].numComplexEvents
          );

          // reset current
          currentQid2HitRef.current[qid] = {
            numHits: 0,
            numComplexEvents: 0,
          };
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQid2HitRef]);

  return (
    <>
      <Helmet title={`Watch | CORE Beta`} />

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
          <QuerySelection
            queries={queries}
            selectedQueryIds={selectedQueryIds}
            setSelectedQueryIds={setSelectedQueryIds}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              background: 'background.paper',
              flex: 0,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ToggleButtonGroup
              color="primary"
              exclusive
              value={viewMode}
              onChange={(e, newValue) => setViewMode(newValue)}
            >
              <ToggleButton value="list">List</ToggleButton>
              <ToggleButton value="stats">Stats</ToggleButton>
              <ToggleButton value="charts">Charts</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Divider />
          <Box sx={{ flex: 1, overflow: 'scroll' }}>
            {viewMode === 'list' ? (
              <HitList
                data={data}
                eventInterval={eventInterval}
                setEventInterval={setEventInterval}
              />
            ) : viewMode === 'stats' ? (
              <Stats qid2Stats={qid2Stats} queries={queries} />
            ) : viewMode === 'charts' ? (
              <Charts qid2Stats={qid2Stats} queries={queries} />
            ) : null}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Watch;
