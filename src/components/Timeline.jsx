import { useMemo, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Legend,
} from 'chart.js';
import { useTheme } from '@emotion/react';
import { Box } from '@mui/material';
import { COLORS, MAX_COLORS } from '../colors';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Legend
);

const WINDOW_MS = 10000;

const createDataset = ({ label, color, qid }) => {
  return {
    label,
    data: [],
    borderColor: color,
    backgroundColor: color,
    tension: 0.4,
    qid,
  };
};

export default function Timeline({ stats }) {
  const theme = useTheme();

  const [chartData, setChartData] = useState({
    // labels: [],
    datasets: [],
  });

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const nextNow = new Date();

    setChartData((prev) => {
      const nextDatasets = [];
      for (const qid in stats) {
        const found = prev.datasets.find((d) => d.qid === qid);
        if (found) {
          nextDatasets.push(found);
        } else {
          nextDatasets.push(
            createDataset({
              label: `Query ${qid}`,
              qid,
              color: COLORS[qid % MAX_COLORS],
            })
          );
        }
      }

      for (let i = 0; i < nextDatasets.length; ++i) {
        nextDatasets[i].data = [
          ...nextDatasets[i].data,
          { x: nextNow, y: stats[nextDatasets[i].qid].eventsPerSecond },
        ];
      }

      return {
        datasets: nextDatasets,
      };
    });

    setNow(nextNow);
  }, [stats]);

  const options = useMemo(() => {
    return {
      color: theme.palette.text.primary,
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 500,
        easing: 'easeOutQuad',
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'millisecond',
          },
          title: {
            display: true,
            text: 'Timestamp',
            color: theme.palette.text.primary,
          },
          ticks: {
            color: theme.palette.text.secondary,
          },
          min: new Date(now - WINDOW_MS),
          max: now,
          grid: {
            color: theme.palette.divider,
          },
        },
        y: {
          min: 0,
          title: {
            display: true,
            text: 'Events per second',
            color: theme.palette.text.primary,
          },
          ticks: {
            color: theme.palette.text.secondary,
          },
          grid: {
            color: theme.palette.divider,
          },
        },
      },
    };
  }, [now, theme]);

  return (
    <Box sx={{ flex: 1, height: '99.9%', position: 'relative' }}>
      <Line data={chartData} options={options} />
    </Box>
  );
}
