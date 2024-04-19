import express, { Request, Response } from 'express';
import cors from 'cors';
import { initDatabase, readData, insertData, countRows, responseLogsStats, responseLogsHistory, routeToID } from "./db/db";
import { workerData } from './workerDataFuncs';

const app = express();
app.use(cors());


const PORT = process.env.PORT || 3000;

const createRouteHandler = (tableName: string) => {
    return async (req: Request, res: Response) => {
        try {
            const start = Date.now();
            const limit = parseInt(req.query.limit as string) || Infinity;
            const offset = parseInt(req.query.offset as string) || 0;
            const id = req.query.id as string || '';
            const sessionID = req.headers['session-id'] as string || '1';
            const route = req.path.split('/').pop() as string;
            const routeID = routeToID(route);

            const outputData = await readData(tableName, limit, offset, routeID, id, 1);
            insertData('ResponseLogs', { SessionIP: req.ip, SessionID: sessionID, queriedAt: new Date(), Query: outputData['query'], RowsReturned: outputData['result'].length, ResponseTime: Date.now() - start });
            let count = await countRows(tableName);
            insertData('ResponseLogs', { SessionIP: req.ip, SessionID: sessionID, queriedAt: new Date(), Query: `SELECT COUNT(1) AS total FROM ${tableName}`, RowsReturned: count, ResponseTime: Date.now() - start });
            let output = {
                count: count,
                data: outputData['result']
            }
            console.log('Request with parameters:', `${tableName}, ${limit}, ${offset}, ${id}`);
            res.json(output);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

const createRouteHandlerSearch = (tableName: string) => {
    return async (req: Request, res: Response) => {
        try {
            const start = Date.now();
            const limit = parseInt(req.query.limit as string) || Infinity;
            const offset = parseInt(req.query.offset as string) || 0;
            const whereKey = req.query.whereKey as string || '';
            const whereLike = req.query.whereLike as string || '';
            const sessionID = req.headers['session-id'] as string || '1';

            const outputData = await readData(tableName, limit, offset, whereKey, whereLike, 0);
            insertData('ResponseLogs', { SessionIP: req.ip, SessionID: sessionID, queriedAt: new Date(), Query: outputData['query'], RowsReturned: outputData['result'].length, ResponseTime: Date.now() - start });
            let count = await countRows(tableName);
            insertData('ResponseLogs', { SessionIP: req.ip, SessionID: sessionID, queriedAt: new Date(), Query: `SELECT COUNT(1) AS total FROM ${tableName}`, RowsReturned: count, ResponseTime: Date.now() - start });
            let output = {
                count: count,
                data: outputData['result']
            }
            console.log('Request with parameters:', `${tableName}, ${limit}, ${offset}, ${whereKey}, ${whereLike}`);
            res.json(output);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

const logRouteHandler = async (req: Request, res: Response) => {
    try {
        const sessionID = req.headers['session-id'] as string || '1'
        console.log(`Logs request from ${req.ip} with sessionID ${sessionID}`);

        const stats = await responseLogsStats(sessionID);
        const history = await responseLogsHistory(sessionID);

        res.json({stats: stats, history: history});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const dataFromIP = async (req: Request, res: Response) => {
    try {
        const ip = req.query.ip as string || req.ip as string || '';
        const outputData = await workerData(ip);
        res.json(outputData);
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

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
    app.get(`${path}/search`, createRouteHandlerSearch(tableName));
});

app.get('/responseLogs', logRouteHandler);
app.get('/workerData', dataFromIP);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
