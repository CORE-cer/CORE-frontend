import ReactApexChart from 'react-apexcharts';
import { useEffect, useState } from 'react';
import { useTheme } from '@emotion/react';

const LineChart = ({ series, colors }) => {
  const theme = useTheme();

  const [config, setConfig] = useState({
    series,
    options: {
      stroke: {
        curve: 'smooth',
      },
      colors,
      chart: {
        zoom: {
          enabled: false,
        },
      },
      theme: {
        mode: theme.palette.mode,
      },
      xaxis: {
        type: 'datetime',
        range: 10 * 1000,
      },
    },
  });

  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      series,
      options: {
        ...prev.options,
        colors,
        theme: {
          ...prev.options.theme,
          mode: theme.palette.mode,
        },
      },
    }));
  }, [theme, series, colors]);

  return (
    <ReactApexChart
      height={400}
      options={config.options}
      series={config.series}
      type="line"
    />
  );
};

export default LineChart;
