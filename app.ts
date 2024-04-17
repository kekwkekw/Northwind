import express, { Request, Response } from 'express';
import cors from 'cors';
import { initDatabase, readData, insertData, countRows, responseLogsStats, responseLogsHistory } from "./db/db";

const app = express();
app.use(cors());


const PORT = process.env.PORT || 3000;

const createRouteHandler = (tableName: string) => {
    return async (req: Request, res: Response) => {
        try {
            const start = Date.now();
            const limit = parseInt(req.query.limit as string) || Infinity;
            const offset = parseInt(req.query.offset as string) || 0;
            const whereKey = req.query.whereKey as string || '';
            const whereLike = req.query.whereLike as string || '';

            const outputData = await readData(tableName, limit, offset, whereKey, whereLike);
            let count = await countRows(tableName);
            let output = {
                count: count,
                data: outputData['result']
            }
            console.log('Request with parameters:', `${tableName}, ${limit}, ${offset}, ${whereKey}, ${whereLike}`);
            insertData('ResponseLogs', { SessionIP: req.ip, SessionID: 1, queriedAt: new Date(),  Query: outputData['query'], RowsReturned: outputData['result'].length, ResponseTime: Date.now() - start });
            res.json(output);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

const logStatsRouteHandler = async (req: Request, res: Response) => {
    try {
        const SessionID = parseInt(req.query.SessionID as string) || 1;

        const outputData = await responseLogsStats(SessionID);
        console.log('Request with parameters:', `${SessionID}`);
        res.json(outputData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const logHistoryRouteHandler = async (req: Request, res: Response) => {
    try {
        const SessionID = parseInt(req.query.SessionID as string) || 1;

        const outputData = await responseLogsHistory(SessionID);
        console.log('Request with parameters:', `${SessionID}`);
        res.json(outputData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const routes = [
    { path: '/suppliers', tableName: 'Supplies' },
    { path: '/products', tableName: 'Products' },
    { path: '/orders', tableName: 'Orders' },
    { path: '/employees', tableName: 'Employees' },
    { path: '/customers', tableName: 'Customers' }
];

initDatabase();

routes.forEach(({ path, tableName }) => {
    app.get(path, createRouteHandler(tableName));
});

app.get('/responseLogsStats', logStatsRouteHandler);
app.get('/responseLogsHistory', logHistoryRouteHandler);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
