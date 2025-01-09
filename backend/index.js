import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import Transaction from "./transaction.js";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// **API to initialize the database**
app.get("/initialize-db", async (req, res) => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const data = response.data;

    // Clear existing data before seeding
    await Transaction.deleteMany();

    // Insert new data
    await Transaction.insertMany(data);
    res.status(200).json({ message: "Database initialized successfully" });
  } catch (error) {
    console.error("Error initializing database:", error);
    res.status(500).json({ error: "Failed to initialize the database" });
  }
});

// API to list all transactions with search and pagination
app.get("/transactions", async (req, res) => {
  const { search = "", page = 1, perPage = 10 } = req.query;
  try {
    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { price: parseFloat(search) || null },
          ],
        }
      : {};

    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      data: transactions,
      total,
      page: parseInt(page),
      perPage: parseInt(perPage),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

//API for statistics
app.get("/statistics", async (req, res) => {
  const { month } = req.query; // Get the month parameter

  try {
    // Prepare match condition based on month only, ignoring the year
    let matchCondition = {};
    if (month) {
      // The match condition should only check for the month and ignore the year
      matchCondition = {
        $expr: {
          $eq: [{ $month: "$dateOfSale" }, parseInt(month)], // Compare month part of the date
        },
      };
    }

    // Aggregate and count sold items
    const soldItems = await Transaction.find({
      ...matchCondition,
      sold: true,
    }).countDocuments();

    // Aggregate and count not sold items
    const notSoldItems = await Transaction.find({
      ...matchCondition,
      sold: false,
    }).countDocuments();

    // Calculate the total sale amount (sum of prices of sold items)
    const totalSaleAmount = await Transaction.aggregate([
      {
        $match: matchCondition,
      },
      {
        $match: { sold: true }, // Only sold items
      },
      {
        $group: { _id: null, totalAmount: { $sum: "$price" } },
      },
    ]);

    // Prepare the statistics object
    const statistics = {
      totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0,
      soldItems: soldItems,
      notSoldItems: notSoldItems,
    };

    // Send the statistics response
    res.status(200).json(statistics);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

app.get('/bar-chart/:month', async (req, res) => {
  const month = parseInt(req.params.month); // Extract the month from the URL
  try {
      const priceRangeCounts = await Transaction.aggregate([
          {
              $addFields: {
                  saleMonth: { $month: { $toDate: "$dateOfSale" } } // Extract the month from the dateOfSale field
              }
          },
          {
              $match: {
                  saleMonth: month // Filter documents by the specified month
              }
          },
          {
              $bucket: {
                  groupBy: "$price", // Group by the price field
                  boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity], // Define price ranges
                  default: "Other", // Label for values outside the ranges (if needed)
                  output: {
                      count: { $sum: 1 } // Count the number of documents in each range
                  }
              }
          }
      ]);

      res.json(priceRangeCounts); // Send the classified data as JSON
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch price range counts' });
  }
});



app.get('/pie-chart/:month', async (req, res) => {
  const month = parseInt(req.params.month) - 1; // month is 1-based, so subtract 1 to match JavaScript's 0-based months
  try {
      // Fetch transactions for the given month, ignoring the year
      const transactions = await Transaction.find();

      // Filter transactions for the selected month only, disregarding the year
      const filteredTransactions = transactions.filter(transaction => {
          const saleDate = new Date(transaction.dateOfSale);
          return saleDate.getMonth() === month; // Check only the month, not the year
      });

      // Group the filtered transactions by category and count items per category
      const categoryCount = filteredTransactions.reduce((acc, item) => {
          if (acc[item.category]) {
              acc[item.category]++;
          } else {
              acc[item.category] = 1;
          }
          return acc;
      }, {});

      // Prepare the pie chart data
      const pieChartData = Object.keys(categoryCount).map(category => ({
          category,
          items: categoryCount[category]
      }));

      res.json(pieChartData); // Return the grouped data for the pie chart
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch pie chart data', err: error });
  }
});

// API to combine responses
app.get("/combined", async (req, res) => {
  const { month } = req.query;
  try {
    const [transactions, statistics, barChart, pieChart] = await Promise.all([
      Transaction.find({}),
      axios.get(
        `${req.protocol}://${req.get("host")}/statistics?month=${month}`
      ),
      axios.get(
        `${req.protocol}://${req.get("host")}/bar-chart?month=${month}`
      ),
      axios.get(
        `${req.protocol}://${req.get("host")}/pie-chart?month=${month}`
      ),
    ]);

    res.status(200).json({
      transactions,
      statistics: statistics.data,
      barChart: barChart.data,
      pieChart: pieChart.data,
    });
  } catch (error) {
    console.error("Error fetching combined data:", error);
    res.status(500).json({ error: "Failed to fetch combined data" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
