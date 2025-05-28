import ReactApexChart from 'react-apexcharts';
import { useEffect, useState } from 'react';
import { useTheme } from '@emotion/react';

const DonutChart = ({ series, labels, colors }) => {
  const theme = useTheme();

  const [config, setConfig] = useState({
    series,
    options: {
      theme: {
        mode: theme.palette.mode,
      },
      labels,
      colors,
      legend: {
        show: false,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              total: {
                show: true,
                showAlways: true,
              },
            },
          },
        },
      },
    },
  });

  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      series,
      options: {
        ...prev.options,
        labels,
        colors,
        theme: {
          ...prev.options.theme,
          mode: theme.palette.mode,
        },
      },
    }));
  }, [theme, series, labels, colors]);

  return (
    <ReactApexChart
      options={config.options}
      series={config.series}
      type="donut"
    />
  );
};

export default DonutChart;
