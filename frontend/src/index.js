import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Table from './Table';
import Statistics from './Statistics';
import PieChart from './PieChart';
import BarChart from './BarChart';
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <Table/>,
      },{
        path:'statistics',
        element:<Statistics/>
      },{
        path:'pie-chart',
        element: <PieChart/>
      },{
        path:"bar-chart",
        element:<BarChart/>
      }
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);