import ReactApexChart from 'react-apexcharts';
import { useEffect, useState } from 'react';
import { useTheme } from '@emotion/react';

const DonutChart = ({ series, labels, colors }) => {
  const theme = useTheme();

  const [config, setConfig] = useState({
    series,
    options: {
      chart: {
        animations: {
          enabled: true,
          easing: 'linear',
          dynamicAnimation: {
            speed: 300,
          },
        },
      },
      theme: {
        mode: theme.palette.mode,
      },
      labels,
      colors,
      tooltip: {
        enabled: false,
      },
      legend: {
        enabled: true,
        position: 'bottom',
      },
      dataLabels: {
        formatter(val, opts) {
          const str = `${series[opts.seriesIndex]} (${val.toFixed(1)}%)`;
          return str;
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Roboto',
        },
        dropShadow: {
          enabled: true,
          top: 0,
          left: 0,
          blur: 2,
          color: '#000',
          opacity: 1,
        },
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
        dataLabels: {
          ...prev.options.dataLabels,
          formatter(val, opts) {
            const str = `${series[opts.seriesIndex]} (${val.toFixed(1)}%)`;
            return str;
          },
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
