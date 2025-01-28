import AddIcon from '@mui/icons-material/Add';
import {
  Fab,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
} from '@mui/material';
import { Helmet } from 'react-helmet';
import Editor from '../components/Editor';
import { useRef, useState } from 'react';
import { enqueueSnackbar } from 'notistack';

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

const Query = () => {
  const editorRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [queryName, setQueryName] = useState('');
  const [loading, setLoading] = useState(false);

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
      <Editor
        ref={editorRef}
        query={DEFAULT_QUERY}
        sx={{ flex: 1, width: '100%', overflow: 'hidden' }}
      />
      <Fab
        onClick={handleAddQuery}
        variant="extended"
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
        }}
      >
        <AddIcon sx={{ mr: 1 }} />
        Add query
      </Fab>
    </>
  );
};

export default Query;
