import AddIcon from '@mui/icons-material/Add';
import { Fab } from '@mui/material';
import { Helmet } from 'react-helmet';
import Editor from '../components/Editor';
import { useRef } from 'react';

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

const Query = () => {
  const editorRef = useRef(null);

  const handleAddQuery = async () => {
    const currentQuery = editorRef.current.getEditor().getValue();
    const baseUrl = import.meta.env.VITE_CORE_BACKEND_URL;
    const fetchRes = await fetch(baseUrl + '/add-query', {
      method: 'POST',
      body: currentQuery,
    });
    alert(`fetchRes: ${await fetchRes.text()}`);
  };

  return (
    <>
      <Helmet title={`Query | CORE`} />
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
          position: 'absolute',
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
