import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Box,
  Divider,
  Fab,
  Fade,
  Paper,
  Slider,
  Tooltip,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { MAX_COLORS } from '../colors';

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

const EventIntervalSelector = ({ value, setValue }) => {
  const valueLabelFormat = (value) => {
    if (value === 0) return '0ms (Real-time)';
    if (value > 1000) return `${value / 1000}s`;
    return `${value}ms`;
  };

  const [visualValue, setVisualValue] = useState(value);

  return (
    <Box
      sx={{
        width: 'inherit',
        px: 2,
        py: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography>{'Event throttle'}</Typography>
      <Slider
        sx={{ maxWidth: 400 }}
        value={visualValue}
        onChangeCommitted={(_, value) => setValue(value)}
        onChange={(_, value) => setVisualValue(value)}
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

const HitList = ({ data, eventInterval, setEventInterval }) => {
  const [atBottom, setAtBottom] = useState(false);

  const virtuoso = useRef(null);

  const handleScrollToBottom = () => {
    if (!virtuoso.current) return;
    virtuoso.current.scrollToIndex({
      index: data.length - 1,
      align: 'end',
      behavior: 'auto',
    });
  };

  return (
    <>
      <ScrollToLatest
        trigger={!atBottom}
        scrollToBottom={handleScrollToBottom}
      />
      <EventIntervalSelector
        value={eventInterval}
        setValue={setEventInterval}
      />
      <Divider />
      <Virtuoso
        overscan={50}
        ref={virtuoso}
        alignToBottom
        atBottomStateChange={(isAtBottom) => setAtBottom(isAtBottom)}
        followOutput="auto" // Auto-scroll if the window is at the bottom
        atBottomThreshold={300}
        data={data}
        itemContent={renderItem}
      />
    </>
  );
};

export default HitList;
