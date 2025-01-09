import axios from "axios";
import React, { useEffect, useState } from "react";
import "./Statistics.css";

const Statistics = () => {
  const [statistic, setStatistic] = useState(null);
  const [month, setMonth] = useState(3);

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

  const fetchData = async (month) => {
    try {
      const response = await axios.get(`http://localhost:3001/statistics`, {
        params: {
          month,
        },
      });
      console.log(response.data);

      setStatistic(response.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    fetchData(month);
  }, [month]);

  if (!statistic) {
    return <div>Loading...</div>;
  }

  return (
    <div className="stats">
      <div>
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
      <table className="table">
        <tbody>
          <tr>
            <th>Total Amount of Sale</th>
            <td>{statistic.totalSaleAmount}</td>
          </tr>
          <tr>
            <th>Total Sold Items</th>
            <td>{statistic.soldItems}</td>
          </tr>
          <tr>
            <th>Total Not Sold Items</th>
            <td>{statistic.notSoldItems}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Statistics;
