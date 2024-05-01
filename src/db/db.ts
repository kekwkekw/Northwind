import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { countDistinct, eq, getTableName, sql, like, count, sum } from 'drizzle-orm';
import Database from 'better-sqlite3';
import { Employees, Categories, Territories, Customers, Shippers, Supplies, Orders, Products, OrderDetails, Regions, EmployeeTerritories, ResponseLogs } from './schema';
import { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { dictToQuery } from '../utils/utils';

class DbInteractor {
    private db: BetterSQLite3Database;
    private tables: Record<string, SQLiteTable>;

    constructor(dbPath: string) {
        this.db = drizzle(new Database(dbPath));
        this.tables = {
            'Employees': Employees,
            'Categories': Categories,
            'Customers': Customers,
            'Shippers': Shippers,
            'Supplies': Supplies,
            'Orders': Orders,
            'Products': Products,
            'OrderDetails': OrderDetails,
            'Regions': Regions,
            'Territories': Territories,
            'EmployeeTerritories': EmployeeTerritories,
            'ResponseLogs': ResponseLogs
        };
    }

    public getTable(tableName: string): SQLiteTable {
        return this.tables[tableName];
    }

    private async insertDataFromFile(table: SQLiteTable, fileName: string): Promise<void> {
        const filePath = path.join(__dirname, 'rawData', fileName);
        const data: any[] = [];

        return new Promise<void>((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csvParser({ separator: ';' }))
                .on('data', (row: any[] = []) => {
                    if (row.length === 0) return;
                    data.push(row);
                })
                .on('end', async () => {
                    try {
                        await this.db.insert(table).values(data);
                        console.log(`Data from file ${fileName} inserted to table ${getTableName(table)}`);
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                });
        });
    }

    public async fillTables(): Promise<void> {
        const tablePromisesDelete = Object.entries(this.tables).filter(([x, y]) => x!=='ResponseLogs').map(([tableName, table]) =>
            this.db.delete(table)
        );
        await Promise.all(tablePromisesDelete);
        console.log('Tables cleared');

        const tablePromises = Object.entries(this.tables).filter(([x, y]) => x!=='ResponseLogs').map(([tableName, table]) =>
            this.insertDataFromFile(table, `${tableName}.csv`)
        );
        await Promise.all(tablePromises);
        console.log('Tables filled');
    }

    public async insertData(tableName: string, data: any): Promise<void> {
        const table = this.getTable(tableName);
        await this.db.insert(table).values(data);
    }

    public async clearTable(tableName: string): Promise<void> {
        const table = this.tables[tableName];
        if (table === undefined) {
            throw new Error(`Table ${tableName} not found`);
        }
        await this.db.delete(table);
    }

    public async getSuppliers(limit: number = Infinity, offset: number = 0): Promise<{ query: any, result: any[] }> {
        const query = await dictToQuery(this.db.select().from(Supplies).limit(limit).offset(offset).toSQL());
        const suppliers = await this.db.select().from(Supplies).limit(limit).offset(offset);
        return { query: query, result: suppliers };
    }
    
    public async getProducts(limit: number = Infinity, offset: number = 0): Promise<{ query: any, result: any[] }> {
        const query = await dictToQuery(this.db.select().from(Products).limit(limit).offset(offset).toSQL());
        const products = await this.db.select().from(Products).limit(limit).offset(offset);
        return { query: query, result: products };
    }
    
    public async getEmployees(limit: number = Infinity, offset: number = 0): Promise<{ query: any, result: any[] }> {
        const query = await dictToQuery(this.db.select().from(Employees).limit(limit).offset(offset).toSQL());
        const employees = await this.db.select().from(Employees).limit(limit).offset(offset);
        return { query: query, result: employees };
    }
    
    public async getOrders(limit: number = Infinity, offset: number = 0): Promise<{ query: any, result: any[] }> {
        const query = await dictToQuery(
            this.db.select({
                OrderID: Orders.OrderID,
                CustomerID: Orders.CustomerID,
                EmployeeID: Orders.EmployeeID,
                OrderDate: Orders.OrderDate,
                RequiredDate: Orders.RequiredDate,
                ShippedDate: Orders.ShippedDate,
                ShipVia: Orders.ShipVia,
                Freight: Orders.Freight,
                ShipName: Orders.ShipName,
                ShipAddress: Orders.ShipAddress,
                ShipCity: Orders.ShipCity,
                ShipRegion: Orders.ShipRegion,
                ShipPostalCode: Orders.ShipPostalCode,
                ShipCountry: Orders.ShipCountry,
                ProductCount: countDistinct(OrderDetails.ProductID),
                TotalQuantity: sql<number>`SUM(${OrderDetails.Quantity})`,
                TotalPrice: sql<number>`SUM(${OrderDetails.UnitPrice} * ${OrderDetails.Quantity})`
            })
                .from(Orders)
                .leftJoin(OrderDetails, eq(Orders.OrderID, OrderDetails.OrderID))
                .groupBy(Orders.OrderID, Orders.CustomerID, Orders.EmployeeID, Orders.OrderDate, Orders.RequiredDate, Orders.ShippedDate, Orders.ShipVia, Orders.Freight, Orders.ShipName, Orders.ShipAddress, Orders.ShipCity, Orders.ShipRegion, Orders.ShipPostalCode, Orders.ShipCountry)
                .limit(limit)
                .offset(offset)
                .toSQL()
        );
        const orders = await this.db.select({
            OrderID: Orders.OrderID,
            CustomerID: Orders.CustomerID,
            EmployeeID: Orders.EmployeeID,
            OrderDate: Orders.OrderDate,
            RequiredDate: Orders.RequiredDate,
            ShippedDate: Orders.ShippedDate,
            ShipVia: Orders.ShipVia,
            Freight: Orders.Freight,
            ShipName: Orders.ShipName,
            ShipAddress: Orders.ShipAddress,
            ShipCity: Orders.ShipCity,
            ShipRegion: Orders.ShipRegion,
            ShipPostalCode: Orders.ShipPostalCode,
            ShipCountry: Orders.ShipCountry,
            ProductCount: countDistinct(OrderDetails.ProductID),
            TotalQuantity: sql<number>`SUM(${OrderDetails.Quantity})`,
            TotalPrice: sql<number>`SUM(${OrderDetails.UnitPrice} * ${OrderDetails.Quantity})`
        })
            .from(Orders)
            .leftJoin(OrderDetails, eq(Orders.OrderID, OrderDetails.OrderID))
            .groupBy(Orders.OrderID, Orders.CustomerID, Orders.EmployeeID, Orders.OrderDate, Orders.RequiredDate, Orders.ShippedDate, Orders.ShipVia, Orders.Freight, Orders.ShipName, Orders.ShipAddress, Orders.ShipCity, Orders.ShipRegion, Orders.ShipPostalCode, Orders.ShipCountry)
            .limit(limit)
            .offset(offset);
        return { query: query, result: orders };
    }
    
    public async getCustomers(limit: number = Infinity, offset: number = 0): Promise<{ query: any, result: any[] }> {
        const query = await dictToQuery(this.db.select().from(Customers).limit(limit).offset(offset).toSQL());
        const customers = await this.db.select().from(Customers).limit(limit).offset(offset);
        return { query: query, result: customers };
    }
    
    public async searchProductsByName(productName: string): Promise<{ query: any, result: any[] }> {
        const query = await dictToQuery(this.db.select().from(Products).where(like(Products.ProductName, `%${productName}%`)).toSQL());
        const products = await this.db.select().from(Products).where(like(Products.ProductName, `%${productName}%`));
        return { query: query, result: products };
    }
    
    public async searchCustomersByName(customerName: string): Promise<{ query: any, result: any[] }> {
        const query = await dictToQuery(this.db.select().from(Customers).where(like(Customers.CompanyName, `%${customerName}%`)).toSQL());
        const customers = await this.db.select().from(Customers).where(like(Customers.CompanyName, `%${customerName}%`));
        return { query: query, result: customers };
    }
    
    public async searchProductsByID(productID: string): Promise<{ query: any, result: any[] }> {
        const query = await dictToQuery(this.db.select().from(Products).where(eq(Products.ProductID, parseInt(productID))).toSQL());
        const products = await this.db.select().from(Products).where(eq(Products.ProductID, parseInt(productID)));
        return { query: query, result: products };
    }
    
    public async searchCustomersByID(customerID: string): Promise<{ query: any, result: any[] }> {
        const query = await dictToQuery(this.db.select().from(Customers).where(eq(Customers.CustomerID, customerID)).toSQL());
        const customers = await this.db.select().from(Customers).where(eq(Customers.CustomerID, customerID));
        return { query: query, result: customers };
    }
    
    public async searchOrdersByID(orderID: string): Promise<{ query: any, result: any[] }> {
        const query = await dictToQuery(
            this.db.select({
                OrderID: Orders.OrderID,
                CustomerID: Orders.CustomerID,
                EmployeeID: Orders.EmployeeID,
                OrderDate: Orders.OrderDate,
                RequiredDate: Orders.RequiredDate,
                ShippedDate: Orders.ShippedDate,
                ShipVia: Orders.ShipVia,
                Freight: Orders.Freight,
                ShipName: Orders.ShipName,
                ShipAddress: Orders.ShipAddress,
                ShipCity: Orders.ShipCity,
                ShipRegion: Orders.ShipRegion,
                ShipPostalCode: Orders.ShipPostalCode,
                ShipCountry: Orders.ShipCountry,
                ProductCount: countDistinct(OrderDetails.ProductID),
                TotalQuantity: sql<number>`SUM(${OrderDetails.Quantity})`,
                TotalPrice: sql<number>`SUM(${OrderDetails.UnitPrice} * ${OrderDetails.Quantity})`
            })
                .from(Orders)
                .leftJoin(OrderDetails, eq(Orders.OrderID, OrderDetails.OrderID))
                .where(eq(Orders.OrderID, parseInt(orderID)))
                .groupBy(Orders.OrderID, Orders.CustomerID, Orders.EmployeeID, Orders.OrderDate, Orders.RequiredDate, Orders.ShippedDate, Orders.ShipVia, Orders.Freight, Orders.ShipName, Orders.ShipAddress, Orders.ShipCity, Orders.ShipRegion, Orders.ShipPostalCode, Orders.ShipCountry)
                .toSQL()
        );
        const orders = await this.db.select({
            OrderID: Orders.OrderID,
            CustomerID: Orders.CustomerID,
            EmployeeID: Orders.EmployeeID,
            OrderDate: Orders.OrderDate,
            RequiredDate: Orders.RequiredDate,
            ShippedDate: Orders.ShippedDate,
            ShipVia: Orders.ShipVia,
            Freight: Orders.Freight,
            ShipName: Orders.ShipName,
            ShipAddress: Orders.ShipAddress,
            ShipCity: Orders.ShipCity,
            ShipRegion: Orders.ShipRegion,
            ShipPostalCode: Orders.ShipPostalCode,
            ShipCountry: Orders.ShipCountry,
            ProductCount: countDistinct(OrderDetails.ProductID),
            TotalQuantity: sql<number>`SUM(${OrderDetails.Quantity})`,
            TotalPrice: sql<number>`SUM(${OrderDetails.UnitPrice} * ${OrderDetails.Quantity})`
        })
            .from(Orders)
            .leftJoin(OrderDetails, eq(Orders.OrderID, OrderDetails.OrderID))
            .where(eq(Orders.OrderID, parseInt(orderID)))
            .groupBy(Orders.OrderID, Orders.CustomerID, Orders.EmployeeID, Orders.OrderDate, Orders.RequiredDate, Orders.ShippedDate, Orders.ShipVia, Orders.Freight, Orders.ShipName, Orders.ShipAddress, Orders.ShipCity, Orders.ShipRegion, Orders.ShipPostalCode, Orders.ShipCountry);
        return { query: query, result: orders };
    }
    
    public async searchEmployeesByID(employeeID: string): Promise<{ query: any, result: any[] }> {
        const query = await dictToQuery(this.db.select().from(Employees).where(eq(Employees.EmployeeID, parseInt(employeeID))).toSQL());
        const employees = await this.db.select().from(Employees).where(eq(Employees.EmployeeID, parseInt(employeeID)));
        return { query: query, result: employees };
    }

    public async searchSuppliersByID(supplierID: string): Promise<{query: any, result: any[]}> {
        const query = await dictToQuery(this.db.select().from(Supplies).where(eq(Supplies.SupplierID, parseInt(supplierID))).toSQL());
        const suppliers = await this.db.select().from(Supplies).where(eq(Supplies.SupplierID, parseInt(supplierID)));
        return {query: query, result: suppliers};
    }

    public async countRows(tableName: string): Promise<{query: any, result: number}>{
        const table = this.getTable(tableName);
        const query = await dictToQuery(this.db.select({rowsCount: count()}).from(table).toSQL());
        const result = await this.db.select({rowsCount: count()}).from(table);
        return {query: query, result: result[0].rowsCount};
    }

    public async responseLogsHistory(SessionID: string): Promise<any[]> {
        const logs = await this.db.select().from(ResponseLogs).where(eq(ResponseLogs.SessionID, SessionID));
        return logs;
    }

    public async responseLogsStats(SessionID: string): Promise<any> {
        const stats = await this.db.select({
            queryCount: count(),
            resultCount: sum(ResponseLogs.RowsReturned) || 0,
            selectCount: sum(sql<number>`CASE WHEN ${ResponseLogs.Query} LIKE '%SELECT%' THEN 1 ELSE 0 END`) || 0,
            selectWhereCount: sum(sql<number>`CASE WHEN ${ResponseLogs.Query} LIKE '%SELECT%' AND ${ResponseLogs.Query} LIKE '%WHERE%' THEN 1 ELSE 0 END`) || 0,
            selectLeftJoinCount: sum(sql<number>`CASE WHEN ${ResponseLogs.Query} LIKE '%SELECT%' AND ${ResponseLogs.Query} LIKE '%LEFT JOIN%' THEN 1 ELSE 0 END`) || 0,
        }).from(ResponseLogs).where(eq(ResponseLogs.SessionID, SessionID));
        return stats[0];
    }

    public async getData(tableName: string, limit: number, offset: number){
        limit = limit === Infinity ? 10000 : limit;
        if (tableName === 'Supplies') {
            return await this.getSuppliers(limit, offset);
        } else if (tableName === 'Products') {
            return await this.getProducts(limit, offset);
        }
        else if (tableName === 'Employees') {
            return await this.getEmployees(limit, offset);
        }
        else if (tableName === 'Orders') {
            return await this.getOrders(limit, offset);
        }
        else if (tableName === 'Customers') {
            return await this.getCustomers(limit, offset);
        }
        else {
            throw new Error(`Table ${tableName} not found`);
        }
    }

    public async searchByID(tableName: string, id: string){
        if (tableName === 'Suppliers') {
            return await this.searchSuppliersByID(id);
        } else if (tableName === 'Products') {
            return await this.searchProductsByID(id);
        }
        else if (tableName === 'Employees') {
            return await this.searchEmployeesByID(id);
        }
        else if (tableName === 'Orders') {
            return await this.searchOrdersByID(id);
        }
        else if (tableName === 'Customers') {
            return await this.searchCustomersByID(id);
        }
        else {
            throw new Error(`Table ${tableName} not found`);
        }
    }

    public async searchByName(tableName: string, name: string){
        if (tableName === 'Products') {
            return await this.searchProductsByName(name);
        }
        else if (tableName === 'Customers') {
            return await this.searchCustomersByName(name);
        }
        else {
            throw new Error(`Table ${tableName} not found`);
        }
    }

}

const dbPath = path.join(__dirname, '..', '..', 'db.db');
const dbInteractor = new DbInteractor(dbPath);
// dbInteractor.fillTables().then(() => console.log('Tables filled')).catch(console.error);

export { dbInteractor };

//all tests
// dbInteractor.getData('Products', Infinity, 0).then(console.log).catch(console.error);
// dbInteractor.searchByID('Suppliers', '1').then(console.log).catch(console.error);
// dbInteractor.searchByName('Products', 'Chai').then(console.log).catch(console.error);
// dbInteractor.countRows('Products').then(console.log).catch(console.error);
// dbInteractor.responseLogsStats('1').then(console.log).catch(console.error);
// dbInteractor.responseLogsHistory('1').then(console.log).catch(console.error);
// dbInteractor.insertData('ResponseLogs', { SessionID: '1', SessionIP: '::1', queriedAt: new Date().toISOString(), Query: 'SELECT * FROM Products', RowsReturned: 77, ResponseTime: 1000 }).then(console.log).catch(console.error);