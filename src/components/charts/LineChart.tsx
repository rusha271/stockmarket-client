import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChartData } from '@/types/stock';
import { useTheme } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartProps {
  data: ChartData;
  options?: Record<string, unknown>;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({ data, options, height = 220 }) => {
  const theme = useTheme();
  
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary,
          font: {
            family: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            size: 12,
            weight: 600,
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: theme.palette.mode === 'light' 
          ? 'rgba(255, 255, 255, 0.95)' 
          : 'rgba(30, 41, 59, 0.95)',
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          family: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          size: 13,
          weight: 600,
        },
        bodyFont: {
          family: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          size: 12,
          weight: 500,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: theme.palette.mode === 'light' 
            ? 'rgba(0, 0, 0, 0.08)' 
            : 'rgba(255, 255, 255, 0.08)',
          drawBorder: false,
          lineWidth: 1,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            size: 12,
            weight: 500,
          },
          maxRotation: 45,
          minRotation: 0,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: theme.palette.mode === 'light' 
            ? 'rgba(0, 0, 0, 0.08)' 
            : 'rgba(255, 255, 255, 0.08)',
          drawBorder: false,
          lineWidth: 1,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            size: 12,
            weight: 500,
          },
          callback: function(value: number | string) {
            return '₹' + Number(value).toFixed(2);
          },
        },
        border: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        radius: 5,
        hoverRadius: 8,
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.background.paper,
        borderWidth: 3,
        hoverBorderWidth: 4,
      },
      line: {
        borderWidth: 3,
        tension: 0.4,
        capBezierPoints: false,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const themeAwareData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.mode === 'light' 
        ? 'rgba(99, 102, 241, 0.1)' 
        : 'rgba(99, 102, 241, 0.2)',
      pointBackgroundColor: theme.palette.primary.main,
      pointBorderColor: theme.palette.background.paper,
      pointHoverBackgroundColor: theme.palette.primary.light,
      pointHoverBorderColor: theme.palette.background.paper,
    })),
  };

  return (
    <div style={{ height, width: '100%' }}>
      <Line data={themeAwareData} options={options || defaultOptions} />
    </div>
  );
};

export default LineChart; 