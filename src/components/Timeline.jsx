import { useMemo, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
} from 'chart.js';
import { useTheme } from '@emotion/react';
import { Box } from '@mui/material';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Legend);

const WINDOW_MS = 5000;
const UPDATE_DELAY_MS = 1000;

const createDataset = ({ label, color }) => {
  return {
    label,
    data: [],
    borderColor: color,
    backgroundColor: color,
    tension: 0.4,
  };
};

export default function Timeline() {
  const theme = useTheme();

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      createDataset({ label: 'q1', color: 'cyan' }),
      createDataset({ label: 'q2', color: 'magenta' }),
      createDataset({ label: 'q3', color: 'yellow' }),
    ],
  });

  const options = useMemo(() => {
    const latestTimestamp = chartData.labels[chartData.labels.length - 1];

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
          type: 'linear',
          title: {
            display: true,
            text: 'Timestamp',
            color: theme.palette.text.primary,
          },
          ticks: {
            color: theme.palette.text.secondary,
          },
          min: latestTimestamp - WINDOW_MS,
          max: latestTimestamp,
          grid: {
            color: theme.palette.divider,
          },
        },
        y: {
          min: 0,
          title: {
            display: true,
            text: 'Number of events',
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
  }, [chartData.labels, theme]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      setChartData((prev) => {
        const newLabels = [...prev.labels, now];
        const newDatasets = prev.datasets.map((ds) => ({
          ...ds,
          data: [...ds.data, Math.random() * 100],
        }));

        return {
          labels: newLabels,
          datasets: newDatasets,
        };
      });
    }, UPDATE_DELAY_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {}, UPDATE_DELAY_MS);

    return () => clearInterval(interval);
  });

  return (
    <Box sx={{ flex: 1, height: '99.9%', position: 'relative' }}>
      <Line data={chartData} options={options} />
    </Box>
  );
}
