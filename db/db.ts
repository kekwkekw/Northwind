import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';
import { Database } from 'sqlite3';
import { initQuery } from './queries';

const rawDataFolder = './raw_data';
const projectFolder = __dirname;
const dbFilePath = path.join(projectFolder, 'northwind.db');
const db = new Database(dbFilePath);

const createTables = () => {
    console.log('Creating tables...');
    console.log('Init query:', initQuery);
    db.exec(initQuery, (err: Error | null) => {
        if (err) {
            console.error('Error creating tables:', err);
        } else {
            console.log('Tables created');
        }
    });
};

const insertData = (tableName: string, data: any) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const insertQuery = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;

    db.run(insertQuery, values, (err: Error | null) => {
        if (err) {
            console.error('Error inserting data:', err)
            console.log('Data:', data);
        }
    });
};

const clearData = (tableName: string) => {
    db.run(`DELETE FROM ${tableName}`, (err: Error | null) => {
        if (err) {
            console.error('Error clearing data:', err);
        } else {
            console.log('Data cleared');
        }
    });
}

const readData = (tableName: string, limit: number = Infinity, offset: number = 0, whereKey: string = '', whereLike: string = ''): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM ${tableName}`;

        if (whereKey && whereLike) {
            query += ` WHERE ${whereKey} LIKE '%${whereLike}%'`;
        }

        if (limit !== Infinity) {
            query += ` LIMIT ${limit}`;
        }

        if (offset > 0) {
            query += ` OFFSET ${offset}`;
        }

        db.all(query, (err : Error | null, rows : any[] = []) => {
            if (err) {
                console.error('Error reading data:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};



const insertDataFromFile = (tableName: string, fileName: string) => {
    console.log(`Inserting data from file ${fileName} to table ${tableName}...`);
    const filePath = path.join(rawDataFolder, fileName);
    const data: any[] = [];
    fs.createReadStream(filePath)
        .pipe(csvParser({ separator: ';' }))
        .on('data', (row: any[] = []) => {
            data.push(row);
        })
        .on('end', () => {
            data.forEach((row) => {
                insertData(tableName, row);
            })
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

export { initDatabase, readData, clearData };