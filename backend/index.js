import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import Transaction from './transaction.js'; // Import your schema
import cors from "cors"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors())
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// **API to initialize the database**
app.get('/initialize-db', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const data = response.data;

        // Clear existing data before seeding
        await Transaction.deleteMany();

        // Insert new data
        await Transaction.insertMany(data);
        res.status(200).json({ message: 'Database initialized successfully' });
    } catch (error) {
        console.error('Error initializing database:', error);
        res.status(500).json({ error: 'Failed to initialize the database' });
    }
});

// **API to list all transactions with search and pagination**
app.get('/transactions', async (req, res) => {
    const { search = '', page = 1, perPage = 10 } = req.query;
    try {
        const query = search
            ? {
                  $or: [
                      { title: { $regex: search, $options: 'i' } },
                      { description: { $regex: search, $options: 'i' } },
                      { price: parseFloat(search) || null }
                  ]
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
            perPage: parseInt(perPage)
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// **API for statistics**
app.get('/statistics', async (req, res) => {
    const { month } = req.query;
    try {
        const startOfMonth = new Date(`${month} 1`);
        const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

        const soldItems = await Transaction.find({
            dateOfSale: { $gte: startOfMonth, $lte: endOfMonth },
            sold: true
        }).countDocuments();

        const notSoldItems = await Transaction.find({
            dateOfSale: { $gte: startOfMonth, $lte: endOfMonth },
            sold: false
        }).countDocuments();

        const totalSaleAmount = await Transaction.aggregate([
            {
                $match: {
                    dateOfSale: { $gte: startOfMonth, $lte: endOfMonth },
                    sold: true
                }
            },
            { $group: { _id: null, totalAmount: { $sum: '$price' } } }
        ]);

        res.status(200).json({
            totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0,
            soldItems,
            notSoldItems
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// **API for bar chart**
app.get('/bar-chart', async (req, res) => {
    const { month } = req.query;
    try {
        const startOfMonth = new Date(`${month} 1`);
        const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

        const priceRanges = [
            [0, 100],
            [101, 200],
            [201, 300],
            [301, 400],
            [401, 500],
            [501, 600],
            [601, 700],
            [701, 800],
            [801, 900],
            [901, Infinity]
        ];

        const rangeData = await Promise.all(
            priceRanges.map(async ([min, max]) => ({
                range: `${min} - ${max === Infinity ? 'Above' : max}`,
                count: await Transaction.find({
                    dateOfSale: { $gte: startOfMonth, $lte: endOfMonth },
                    price: { $gte: min, $lte: max === Infinity ? Infinity : max }
                }).countDocuments()
            }))
        );

        res.status(200).json(rangeData);
    } catch (error) {
        console.error('Error fetching bar chart data:', error);
        res.status(500).json({ error: 'Failed to fetch bar chart data' });
    }
});

// **API for pie chart**
app.get('/pie-chart', async (req, res) => {
    const { month } = req.query;
    try {
        const startOfMonth = new Date(`${month} 1`);
        const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

        const categoryData = await Transaction.aggregate([
            {
                $match: {
                    dateOfSale: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json(categoryData.map(({ _id, count }) => ({ category: _id, count })));
    } catch (error) {
        console.error('Error fetching pie chart data:', error);
        res.status(500).json({ error: 'Failed to fetch pie chart data' });
    }
});

// **API to combine responses**
app.get('/combined', async (req, res) => {
    const { month } = req.query;
    try {
        const [transactions, statistics, barChart, pieChart] = await Promise.all([
            Transaction.find({}),
            axios.get(`${req.protocol}://${req.get('host')}/statistics?month=${month}`),
            axios.get(`${req.protocol}://${req.get('host')}/bar-chart?month=${month}`),
            axios.get(`${req.protocol}://${req.get('host')}/pie-chart?month=${month}`)
        ]);

        res.status(200).json({
            transactions,
            statistics: statistics.data,
            barChart: barChart.data,
            pieChart: pieChart.data
        });
    } catch (error) {
        console.error('Error fetching combined data:', error);
        res.status(500).json({ error: 'Failed to fetch combined data' });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
