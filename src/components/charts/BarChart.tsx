import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChartData } from '@/types/stock';
import { useTheme } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  data: ChartData;
  options?: any;
  height?: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, options, height = 220 }) => {
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
        borderColor: theme.palette.warning.main,
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
            ? 'rgba(0, 0, 0, 0.05)' 
            : 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            size: 11,
            weight: 500,
          },
        },
      },
      y: {
        grid: {
          color: theme.palette.mode === 'light' 
            ? 'rgba(0, 0, 0, 0.05)' 
            : 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            size: 11,
            weight: 500,
          },
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
        borderSkipped: false,
      },
    },
  };

  const themeAwareData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: theme.palette.mode === 'light' 
        ? 'rgba(245, 158, 11, 0.8)' 
        : 'rgba(245, 158, 11, 0.9)',
      borderColor: theme.palette.warning.main,
      borderWidth: 2,
      hoverBackgroundColor: theme.palette.warning.light,
      hoverBorderColor: theme.palette.warning.main,
    })),
  };

  return (
    <div style={{ height, width: '100%' }}>
      <Bar data={themeAwareData} options={options || defaultOptions} />
    </div>
  );
};

export default BarChart; 