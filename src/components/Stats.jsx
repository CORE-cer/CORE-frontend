import { Box, Divider, Grid2 as Grid, Paper, Typography } from '@mui/material';
import { MAX_COLORS } from '../colors';

function QueryStat({ query, qid, stats }) {
  const { perSec, hitStats, complexEventStats } = stats;

  return (
    <Paper sx={{ py: 2, px: 1, textAlign: 'center' }} elevation={2}>
      <Box
        className={`bg-${qid % MAX_COLORS}`}
        sx={{
          height: 16,
          marginX: -1,
          marginY: -2,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          mb: 1,
        }}
      ></Box>
      <Typography sx={{ pb: 1 }} variant="h6">
        {query?.query_name}
      </Typography>
      <Divider />
      {/* HITS */}
      <Grid container spacing={2} sx={{ pt: 2 }}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1">{'Hits'}</Typography>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Typography variant="body1">{hitStats.total || 0}</Typography>
          <Typography variant="body2">{'total'}</Typography>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Typography variant="body1">
            {perSec[perSec.length - 1]?.numHits || 0}
          </Typography>
          <Typography variant="body2">{'per sec'}</Typography>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Typography variant="body1">{hitStats.max || 0}</Typography>
          <Typography variant="body2">{'max/sec'}</Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider />
        </Grid>

        {/* COMPLEX EVENTS */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1">{'Complex Events'}</Typography>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Typography variant="body1">
            {complexEventStats.total || 0}
          </Typography>
          <Typography variant="body2">{'total'}</Typography>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Typography variant="body1">
            {perSec[perSec.length - 1]?.numComplexEvents || 0}
          </Typography>
          <Typography variant="body2">{'per sec'}</Typography>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Typography variant="body1">{complexEventStats.max || 0}</Typography>
          <Typography variant="body2">{'max/sec'}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default function Stats({ qid2Stats, queries }) {
  return (
    <Grid container sx={{ flexGrow: 1, p: 1 }} spacing={2}>
      {Object.entries(qid2Stats).map(([qid, stats], idx) => (
        <Grid key={idx} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
          <QueryStat query={queries[qid]} qid={qid} stats={stats} />
        </Grid>
      ))}
    </Grid>
  );
}
