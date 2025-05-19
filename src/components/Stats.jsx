import { Box, Divider, Grid2 as Grid, Paper, Typography } from '@mui/material';
import { MAX_COLORS } from '../colors';

function computeStats(statsPerSecond) {
  if (statsPerSecond.length === 0) return null;

  let maxHitsPerSecond = 0;
  let maxComplexEventsPerSecond = 0;
  let totalHits = 0;
  let totalComplexEvents = 0;

  for (let i = 0; i < statsPerSecond.length; ++i) {
    const { numHits, numComplexEvents } = statsPerSecond[i];

    maxHitsPerSecond = Math.max(maxHitsPerSecond, numHits);
    maxComplexEventsPerSecond = Math.max(
      maxComplexEventsPerSecond,
      numComplexEvents
    );
    totalHits += numHits;
    totalComplexEvents += totalComplexEvents;
  }

  const lastHitsPerSecond = statsPerSecond[statsPerSecond.length - 1].numHits;
  const lastComplexEventsPerSecond =
    statsPerSecond[statsPerSecond.length - 1].numComplexEvents;

  return {
    maxHitsPerSecond,
    maxComplexEventsPerSecond,
    totalHits,
    totalComplexEvents,
    lastHitsPerSecond,
    lastComplexEventsPerSecond,
  };
}

function QueryStat({ query, qid, statsPerSecond }) {
  const computed = computeStats(statsPerSecond);

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
      <Grid container spacing={2} sx={{ pt: 2 }}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1">{'Hits'}</Typography>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Typography variant="body1">{computed?.totalHits || 0}</Typography>
          <Typography variant="body2">{'total'}</Typography>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Typography variant="body1">
            {computed?.lastHitsPerSecond || 0}
          </Typography>
          <Typography variant="body2">{'per sec'}</Typography>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Typography variant="body1">
            {computed?.maxHitsPerSecond || 0}
          </Typography>
          <Typography variant="body2">{'max/sec'}</Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1">{'Complex Events'}</Typography>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Typography variant="body1">
            {computed?.totalComplexEvents || 0}
          </Typography>
          <Typography variant="body2">{'total'}</Typography>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Typography variant="body1">
            {computed?.lastComplexEventsPerSecond || 0}
          </Typography>
          <Typography variant="body2">{'per sec'}</Typography>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Typography variant="body1">
            {computed?.maxComplexEventsPerSecond || 0}
          </Typography>
          <Typography variant="body2">{'max/sec'}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default function Stats({ qid2StatsPerSecond, queries }) {
  return (
    <Grid container sx={{ flexGrow: 1, p: 1 }} spacing={2}>
      {Object.entries(qid2StatsPerSecond).map(([qid, statsPerSecond], idx) => (
        <Grid key={idx} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
          <QueryStat
            query={queries[qid]}
            qid={qid}
            statsPerSecond={statsPerSecond}
          />
        </Grid>
      ))}
    </Grid>
  );
}
