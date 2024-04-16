"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countRows = exports.insertData = exports.clearData = exports.readData = exports.initDatabase = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const sqlite3_1 = require("sqlite3");
const queries_1 = require("./queries");
const rawDataFolder = './raw_data';
const projectFolder = __dirname;
const dbFilePath = path.join(projectFolder, 'northwind.db');
const db = new sqlite3_1.Database(dbFilePath);
const createTables = () => {
    console.log('Creating tables...');
    db.exec(queries_1.initQuery, (err) => {
        if (err) {
            console.error('Error creating tables:', err);
        }
        else {
            console.log('Tables created');
        }
    });
};
const insertData = (tableName, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const insertQuery = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;
    db.run(insertQuery, values, (err) => {
        if (err) {
            console.error('Error inserting data:', err);
            console.log('Data:', data);
        }
    });
};
exports.insertData = insertData;
const clearData = (tableName) => {
    db.run(`DELETE FROM ${tableName}`, (err) => {
        if (err) {
            console.error('Error clearing data:', err);
        }
        else {
            console.log('Data cleared');
        }
    });
};
exports.clearData = clearData;
const readData = (tableName, limit = Infinity, offset = 0, whereKey = '', whereLike = '') => {
    return new Promise((resolve, reject) => {
        let query = queries_1.getQueries.hasOwnProperty(tableName) ? queries_1.getQueries[tableName] : `SELECT * FROM ${tableName}`;
        if (whereKey && whereLike) {
            query += ` WHERE ${whereKey} LIKE '%${whereLike}%'`;
        }
        if (limit !== Infinity) {
            query += ` LIMIT ${limit}`;
        }
        if (offset > 0) {
            query += ` OFFSET ${offset}`;
        }
        console.log('Reading data:', query);
        insertData('ResponseLogs', { Query: query });
        db.all(query, (err, rows = []) => {
            if (err) {
                console.error('Error reading data:', err);
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
};
exports.readData = readData;
const countRows = (tableName) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(1) AS total FROM ${tableName}`, (err, row) => {
            if (err) {
                console.error('Error counting data:', err);
                reject(err);
            }
            else {
                resolve(row.total);
            }
        });
    });
};
exports.countRows = countRows;
// const testCountData = async (tableName: string) => {
//     try {
//         const count = await countData(tableName);
//         console.log(`Total rows in ${tableName}: ${count}`);
//     } catch (error) {
//         console.error(`Error counting data for ${tableName}:`, error);
//     }
// };
// testCountData('Supplies');
const insertDataFromFile = (tableName, fileName) => {
    const filePath = path.join(rawDataFolder, fileName);
    const data = [];
    fs.createReadStream(filePath)
        .pipe((0, csv_parser_1.default)({ separator: ';' }))
        .on('data', (row = []) => {
        data.push(row);
    })
        .on('end', () => {
        data.forEach((row) => {
            insertData(tableName, row);
        });
        console.log(`Data from file ${fileName} inserted to table ${tableName}`);
    });
};
const initDatabase = () => {
    createTables();
    insertDataFromFile('Employees', 'Employees.csv');
    insertDataFromFile('Categories', 'Categories.csv');
    insertDataFromFile('Customers', 'Customers.csv');
    insertDataFromFile('Shippers', 'Shippers.csv');
    insertDataFromFile('Supplies', 'Supplies.csv');
    insertDataFromFile('Orders', 'Orders.csv');
    insertDataFromFile('Products', 'Products.csv');
    insertDataFromFile('OrderDetails', 'OrderDetails.csv');
    insertDataFromFile('Regions', 'Regions.csv');
    insertDataFromFile('Territories', 'Territories.csv');
    insertDataFromFile('EmployeeTerritories', 'EmployeeTerritories.csv');
};
exports.initDatabase = initDatabase;
