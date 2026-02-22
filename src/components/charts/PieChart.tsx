import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChartData } from '@/types/stock';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: ChartData;
  options?: any;
  height?: number;
}

const PieChart: React.FC<PieChartProps> = ({ data, options, height = 220 }) => (
  <div style={{ height }}>
    <Pie data={data} options={options} />
  </div>
);

export default PieChart; 