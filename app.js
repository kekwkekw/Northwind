"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db/db");
const workerDataFuncs_1 = require("./workerDataFuncs");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const PORT = process.env.PORT || 3000;
const createRouteHandler = (tableName) => {
    return async (req, res) => {
        try {
            const start = Date.now();
            const limit = parseInt(req.query.limit) || Infinity;
            const offset = parseInt(req.query.offset) || 0;
            const id = req.query.id || '';
            const sessionID = req.headers['session-id'] || '1';
            const route = req.path.split('/').pop();
            const routeID = (0, db_1.routeToID)(route);
            const whereKey = req.query.whereKey || '';
            const whereLike = req.query.whereLike || '';
            let outputData;
            if (id) {
                outputData = await (0, db_1.readData)(tableName, limit, offset, routeID, id, 1);
            }
            else {
                outputData = await (0, db_1.readData)(tableName, limit, offset, whereKey, whereLike, 0);
            }
            (0, db_1.insertData)('ResponseLogs', { SessionIP: req.ip, SessionID: sessionID, queriedAt: new Date(), Query: outputData['query'], RowsReturned: outputData['result'].length, ResponseTime: Date.now() - start });
            let count = await (0, db_1.countRows)(tableName);
            (0, db_1.insertData)('ResponseLogs', { SessionIP: req.ip, SessionID: sessionID, queriedAt: new Date(), Query: `SELECT COUNT(1) AS total FROM ${tableName}`, RowsReturned: count, ResponseTime: Date.now() - start });
            let output = {
                count: count,
                data: outputData['result']
            };
            console.log('Request with parameters:', `${tableName}, ${limit}, ${offset}, ${id}`);
            res.json(output);
        }
        catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};
const logRouteHandler = async (req, res) => {
    try {
        const sessionID = req.headers['session-id'] || '1';
        console.log(`Logs request from ${req.ip} with sessionID ${sessionID}`);
        const stats = await (0, db_1.responseLogsStats)(sessionID);
        const history = await (0, db_1.responseLogsHistory)(sessionID);
        res.json({ stats: stats, history: history });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const dataFromIP = async (req, res) => {
    try {
        const ip = req.query.ip || req.ip || '';
        const outputData = await (0, workerDataFuncs_1.workerData)(ip);
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
(0, db_1.initDatabase)();
routes.forEach(({ path, tableName }) => {
    app.get(path, createRouteHandler(tableName));
});
app.get('/responseLogs', logRouteHandler);
app.get('/workerData', dataFromIP);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
