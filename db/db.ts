import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';
import { Database } from 'sqlite3';
import { initQuery, getQueries, logQueryStats, logQueryHistory } from './queries';

const rawDataFolder = './raw_data';
const projectFolder = __dirname;
const dbFilePath = path.join(projectFolder, 'northwind.db');
const db = new Database(dbFilePath);

const createTables = () => {
    console.log('Creating tables...');
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

const readData = (tableName: string, limit: number = Infinity, offset: number = 0, whereKey: string = '', whereLike: string = ''): Promise<{ query: string, result: any[] }> => {
    return new Promise((resolve, reject) => {
        let query = getQueries.hasOwnProperty(tableName) ? getQueries[tableName] : `SELECT * FROM ${tableName}`;

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

        db.all(query, (err: Error | null, rows: any[] = []) => {
            if (err) {
                console.error('Error reading data:', err);
                reject(err);
            } else {
                resolve({ query: query, result: rows });
            }
        });
    });
};

const countRows = (tableName: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(1) AS total FROM ${tableName}`, (err: Error | null, row: any) => {
            if (err) {
                console.error('Error counting data:', err);
                reject(err);
            } else {
                resolve(row.total)
            }
        });
    });
};

// const testCountData = async (tableName: string) => {
//     try {
//         const count = await countData(tableName);
//         console.log(`Total rows in ${tableName}: ${count}`);
//     } catch (error) {
//         console.error(`Error counting data for ${tableName}:`, error);
//     }
// };

// testCountData('Supplies');



const insertDataFromFile = (tableName: string, fileName: string) => {
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

const responseLogsStats = (SessionID: number): Promise<{ queryCount: number, resultCount: number, selectCount: number, selectWhereCount: number, selectLeftJoinCount: number, queryHistory: string[] }> => {
    return new Promise((resolve, reject) => {
        db.get(logQueryStats, [SessionID], (err: Error | null, row: any) => {
            if (err) {
                console.error('Error reading response logs:', err);
                reject(err);
            } else {
                resolve({
                    queryCount: row.queryCount,
                    resultCount: row.resultCount,
                    selectCount: row.selectCount,
                    selectWhereCount: row.selectWhereCount,
                    selectLeftJoinCount: row.selectLeftJoinCount,
                    queryHistory: row.queryHistory
                });
            }
        });
    });
}

const responseLogsHistory = (SessionID: number): Promise<{ queriedAt: string, Query: string, ResponseTime: number }[]> => {
    return new Promise((resolve, reject) => {
        db.all(logQueryHistory, [SessionID], (err: Error | null, rows: any[] = []) => {
            if (err) {
                console.error('Error reading response logs:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}



export { initDatabase, readData, clearData, insertData, countRows, responseLogsStats, responseLogsHistory };