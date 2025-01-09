# Roxiler Systems

## Transaction Management API and Frontend

This project provides an API to manage transactions and display statistics based on transaction data. It also integrates a React frontend to visualize the transaction table, statistics, bar chart, and pie chart.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [API Endpoints](#api-endpoints)
4. [Frontend Setup](#frontend-setup)
5. [Backend Setup](#backend-setup)
6. [Usage](#usage)
7. [Contributors](#contributors)

## Project Overview

This project contains an API built using Node.js, Express, and MongoDB to manage product transactions. The goal is to provide an interface to:

- Initialize the database with seed data fetched from a third-party API.
- Fetch transactions with support for search and pagination.
- Display various statistics based on transaction data.
- Visualize the data through bar and pie charts.

The frontend, built with React, interacts with the backend to display the transactions and charts.

## Technologies Used

- **Backend**: Node.js, Express, Mongoose, Axios, CORS
- **Frontend**: React, React-Chartjs-2, Material-UI
- **Database**: MongoDB
- **Third-party API**: Data is fetched from a third-party API (JSON data)
- **Others**: dotenv, Cors

## API Endpoints

The following are the key API endpoints in the backend:

### 1. Initialize Database

- **Endpoint**: `GET /initialize-db`
- **Description**: Fetches transaction data from a third-party API and seeds it into the database.
- **Response**: A message indicating whether the database initialization was successful.

### 2. List All Transactions (with search and pagination)

- **Endpoint**: `GET /transactions`
- **Query Parameters**:
  - `search`: (Optional) A search term to filter transactions based on title, description, or price.
  - `page`: (Optional) The page number for pagination (default is 1).
  - `perPage`: (Optional) Number of records per page (default is 10).
- **Response**: A paginated list of transactions matching the search term.

### 3. Transaction Statistics

- **Endpoint**: `GET /statistics`
- **Query Parameters**:
  - `month`: (Required) The month for which statistics are needed (1-12).
- **Response**:
  - `totalSaleAmount`: The total sales amount for the selected month.
  - `soldItems`: Total number of sold items.
  - `notSoldItems`: Total number of unsold items.

### 4. Bar Chart Data (Price Ranges)

- **Endpoint**: `GET /bar-chart/:month`
- **Params**:
  - `month`: (Required) The month for which the bar chart data is requested.
- **Response**: Data classified into price ranges:
  - `0-100`
  - `101-200`
  - `201-300`
  - `301-400`
  - `401-500`
  - `501-600`
  - `601-700`
  - `701-800`
  - `801-900`
  - `901-above`

### 5. Pie Chart Data (Category Count)

- **Endpoint**: `GET /pie-chart/:month`
- **Params**:
  - `month`: (Required) The month for which the pie chart data is requested.
- **Response**: A breakdown of the number of items per category for the selected month.

### 6. Combined Data (All in One)

- **Endpoint**: `GET /combined`
- **Query Parameters**:
  - `month`: (Required) The month for which combined data is requested.
- **Response**: A JSON object combining the following:
  - `transactions`: List of transactions.
  - `statistics`: Sales statistics.
  - `barChart`: Price range data.
  - `pieChart`: Category count data.

## Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install the necessary dependencies**:  
   ```bash
   npm install
   ```

3. **Run the React application**:  
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000` by default.
