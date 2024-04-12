"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./db/db");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const createRouteHandler = (tableName) => {
    return (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const limit = parseInt(req.query.limit) || Infinity;
            const offset = parseInt(req.query.offset) || 0;
            const whereKey = req.query.whereKey || '';
            const whereLike = req.query.whereLike || '';
            const outputData = yield (0, db_1.readData)(tableName, limit, offset, whereKey, whereLike);
            console.log('params:', req.params);
            console.log('actualParams:', `${tableName}, ${limit}, ${offset}, ${whereKey}, ${whereLike}`);
            console.log('outputData:', outputData);
            res.json(outputData);
        }
        catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
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
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
