import { Box, Divider, Grid2 as Grid, Paper, Typography } from '@mui/material';
import { MAX_COLORS } from '../colors';

function QueryStat({ qid, stat }) {
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
      <Typography sx={{ pb: 1 }} variant="h6">{`Query ${qid}`}</Typography>
      <Divider />
      <Box sx={{ py: 1 }}>
        <Typography variant="h4">{stat.numEvents}</Typography>
        <Typography variant="body1">{'Number of events'}</Typography>
      </Box>
      <Box sx={{ py: 1 }}>
        <Typography variant="h4">{stat.eventsPerSecond}</Typography>
        <Typography variant="body1">{'Events per second'}</Typography>
      </Box>
    </Paper>
  );
}

export default function Stats({ stats }) {
  return (
    <Grid container sx={{ flexGrow: 1, p: 1 }} spacing={2}>
      <Grid size={12}>
        <Paper sx={{ py: 2, px: 1, textAlign: 'center' }} elevation={2}>
          <Typography sx={{ pb: 1 }} variant="h6">
            {'Total'}
          </Typography>
          <Divider />
          <Box sx={{ py: 1 }}>
            <Typography variant="h4">
              {Object.values(stats).reduce(
                (acc, stat) => acc + stat.numEvents,
                0
              )}
            </Typography>
            <Typography variant="body1">{'Number of events'}</Typography>
          </Box>
        </Paper>
      </Grid>
      {Object.entries(stats).map(([qid, stat], idx) => (
        <Grid key={idx} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
          <QueryStat qid={qid} stat={stat} />
        </Grid>
      ))}
    </Grid>
  );
}
