import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./PieChart.css";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PieChart = () => {
  const [month, setMonth] = useState(3);
  const [pieData, setPieData] = useState([]);

  const months = [
    { name: "January", number: 1 },
    { name: "February", number: 2 },
    { name: "March", number: 3 },
    { name: "April", number: 4 },
    { name: "May", number: 5 },
    { name: "June", number: 6 },
    { name: "July", number: 7 },
    { name: "August", number: 8 },
    { name: "September", number: 9 },
    { name: "October", number: 10 },
    { name: "November", number: 11 },
    { name: "December", number: 12 },
  ];

  useEffect(() => {
    const fetchPieChartData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/pie-chart/${month}`
        );
        const data = await response.json();

        const categories = data.map((item) => item.category);
        const items = data.map((item) => item.items);

        setPieData({
          labels: categories,
          datasets: [
            {
              data: items,
              backgroundColor: [
                "#FF5733",
                "#33FF57",
                "#3357FF",
                "#FF33A1",
                "#57FF33",
                "#FF5733",
              ],
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching pie chart data:", error);
      }
    };

    fetchPieChartData();
  }, [month]);

  return (
    <div className="pie-container">
      <div className="chart-header">
        <h4>Statistics for</h4>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {months.map((month) => (
            <option key={month.number} value={month.number}>
              {month.name}
            </option>
          ))}
        </select>
      </div>

      <div className="pie-chart">
        {pieData.labels ? <Pie data={pieData} /> : <p>Loading chart data...</p>}
      </div>
    </div>
  );
};

export default PieChart;
