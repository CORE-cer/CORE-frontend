import { useTheme } from '@emotion/react';
import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fab,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
} from '@mui/material';
import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';
import { lightTheme } from '@uiw/react-json-view/light';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import Editor from '../components/Editor';
import examples from '../data/examples';

const DEFAULT_QUERY = `SELECT * FROM S
WHERE (TRIP as loc1; TRIP as loc2; TRIP as loc3)
FILTER
    loc1[pickup_zone = 'East Harlem North' and dropoff_zone = 'Midwood'] AND
    loc2[pickup_zone = 'Midwood' AND dropoff_zone = 'Gravesend'] AND
    loc3[pickup_zone = 'Gravesend' AND dropoff_zone = 'West Brighton']
WITHIN 1000 EVENTS
CONSUME BY ANY
LIMIT 1000
`;

const AddQueryDialog = ({
  loading,
  open,
  onClose,
  onSubmit,
  queryName,
  setQueryName,
}) => {
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
      PaperProps={{
        component: 'form',
        onSubmit,
      }}
    >
      <DialogTitle>{'Add query'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {'Enter a name to identify the query'}
        </DialogContentText>
        <TextField
          disabled={loading}
          inputProps={{ autoComplete: 'off' }}
          value={queryName}
          onChange={(e) => setQueryName(e.target.value)}
          margin="dense"
          id="name"
          name="name"
          label="Query name"
          type="text"
          variant="standard"
          autoFocus
          required
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!queryName} loading={loading}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SCHEMA = {
  buy: {
    product_id: 'ETH-USD',
    open_24h: 1310.79,
    low_24h: 1280.52,
    volume_30d: 245532.79269678,
    best_bid_size: 0.46688654,
    best_ask_size: 1.5663704,
    price: 1285.22,
    volume_24h: 245532.79269678,
    high_24h: 1313.8,
    best_bid: 1285.04,
    best_ask: 1285.27,
    time: new Date('2022-10-19T23:28:22.061769Z'),
  },
  sell: {
    product_id: 'ETH-USD',
    open_24h: 1310.79,
    low_24h: 1280.52,
    volume_30d: 245532.79269678,
    best_bid_size: 0.46688654,
    best_ask_size: 1.5663704,
    price: 1285.22,
    volume_24h: 245532.79269678,
    high_24h: 1313.8,
    best_bid: 1285.04,
    best_ask: 1285.27,
    time: new Date('2022-10-19T23:28:22.061769Z'),
  },
};

const CustomJsonView = ({ schema }) => {
  const theme = useTheme();

  return (
    <JsonView
      enableClipboard={false}
      // collapsed={false}
      indentWidth={16}
      value={schema}
      style={theme.palette.mode === 'dark' ? darkTheme : lightTheme}
      displayObjectSize
      displayDataTypes
      collapsed={false}
      shouldExpandNodeInitially={(isExpanded, { keys }) => {
        if (keys.length > 0 && keys[0] === 'sell') return true;
        return isExpanded;
      }}
    >
      <JsonView.Quote render={() => <></>} />
      <JsonView.Float
        render={({ children, ...rest }, { type }) => {
          if (type === 'type') return <span {...rest}>{'double'}</span>;
          return <span {...rest}>{children}</span>;
        }}
      />
      <JsonView.Date
        render={({ children, ...rest }, { type }) => {
          if (type === 'type') return <span {...rest}>{'PRIMARY_TIME'}</span>;
          return <span {...rest}>{children}</span>;
        }}
      />
    </JsonView>
  );
};

const Schema = (props) => {
  return (
    <Box {...props}>
      <CustomJsonView schema={SCHEMA} />
    </Box>
  );
};

const Examples = ({ setExample }) => {
  return (
    <List dense disablePadding sx={{ flex: 1, overflow: 'auto' }}>
      {examples.map((example, idx) => (
        <ListItem key={idx} disablePadding>
          <ListItemButton onClick={() => setExample(example)}>
            <ListItemText
              primary={example.title}
              secondary={example.description}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

const Query = () => {
  const editorRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [queryName, setQueryName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetExample = useCallback((example) => {
    const text = `/*${example.description}*/\n${example.query}\n`;
    editorRef.current.getEditor().setValue(text);
  }, []);

  const handleModalClose = () => {
    if (loading) return; // Prevent closing modal while query is being added
    setModalOpen(false);
    setQueryName('');
  };

  const handleAddQuery = async () => {
    setModalOpen(true);
  };

  const submitQuery = async (e) => {
    setLoading(true);
    try {
      e.preventDefault();
      const currentQuery = editorRef.current.getEditor().getValue();
      const baseUrl = import.meta.env.VITE_CORE_BACKEND_URL;
      await fetch(baseUrl + '/add-query', {
        method: 'POST',
        body: currentQuery,
      });
      enqueueSnackbar('Query added successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(`Error adding query: ${err.toString()}`, {
        variant: 'error',
      });
      console.error(err);
    } finally {
      setLoading(false);
      handleModalClose();
    }
  };

  return (
    <>
      <Helmet title={`Query | CORE`} />
      <AddQueryDialog
        loading={loading}
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={submitQuery}
        queryName={queryName}
        setQueryName={setQueryName}
      />
      <Fab
        onClick={handleAddQuery}
        variant="extended"
        color="primary"
        sx={{
          opacity: '0.5 !important',
          '&:hover': {
            opacity: '1 !important',
          },
          position: 'fixed',
          bottom: 32,
          right: 32,
        }}
      >
        <AddIcon sx={{ mr: 1 }} />
        Add query
      </Fab>
      <Box
        sx={{
          minHeight: 800,
          width: '100%',
          height: '100%',
          display: 'flex',
        }}
      >
        <Editor
          ref={editorRef}
          query={DEFAULT_QUERY}
          sx={{
            overflow: 'hidden',
            flex: 2,
          }}
        />
        <Box
          sx={{
            borderLeft: 1,
            borderColor: 'divider',
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Examples setExample={handleSetExample} />
          <Divider />
          <Schema />
        </Box>
      </Box>
    </>
  );
};

export default Query;
