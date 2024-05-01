import { sqliteTable, text, integer, real, blob} from 'drizzle-orm/sqlite-core';

export const Employees = sqliteTable('Employees', {
    EmployeeID: integer('EmployeeID').primaryKey(),
    LastName: text('LastName', { length: 1000 }),
    FirstName: text('FirstName', { length: 1000 }),
    Title: text('Title', { length: 1000 }),
    TitleOfCourtesy: text('TitleOfCourtesy', { length: 1000 }),
    BirthDate: text('BirthDate', { length: 1000 }),
    HireDate: text('HireDate', { length: 1000 }),
    Address: text('Address', { length: 1000 }),
    City: text('City', { length: 1000 }),
    Region: text('Region', { length: 1000 }),
    PostalCode: text('PostalCode', { length: 1000 }),
    Country: text('Country', { length: 1000 }),
    HomePhone: text('HomePhone', { length: 1000 }),
    Extension: text('Extension', { length: 1000 }),
    Photo: blob('Photo'),
    Notes: text('Notes', { length: 1000 }),
    ReportsTo: integer('ReportsTo'),
});

export const Categories = sqliteTable('Categories', {
    CategoryID: integer('CategoryID').primaryKey(),
    CategoryName: text('CategoryName', { length: 1000 }),
    Description: text('Description', { length: 1000 }),
});

export const Customers = sqliteTable('Customers', {
    CustomerID: text('CustomerID', { length: 1000 }).primaryKey(),
    CompanyName: text('CompanyName', { length: 1000 }),
    ContactName: text('ContactName', { length: 1000 }),
    ContactTitle: text('ContactTitle', { length: 1000 }),
    Address: text('Address', { length: 1000 }),
    City: text('City', { length: 1000 }),
    Region: text('Region', { length: 1000 }),
    PostalCode: text('PostalCode', { length: 1000 }),
    Country: text('Country', { length: 1000 }),
    Phone: text('Phone', { length: 1000 }),
    Fax: text('Fax', { length: 1000 }),
});

export const Shippers = sqliteTable('Shippers', {
    ShipperID: integer('ShipperID').primaryKey(),
    CompanyName: text('CompanyName', { length: 1000 }),
    Phone: text('Phone', { length: 1000 }),
});

export const Supplies = sqliteTable('Supplies', {
    SupplierID: integer('SupplierID').primaryKey(),
    CompanyName: text('CompanyName', { length: 1000 }),
    ContactName: text('ContactName', { length: 1000 }),
    ContactTitle: text('ContactTitle', { length: 1000 }),
    Address: text('Address', { length: 1000 }),
    City: text('City', { length: 1000 }),
    Region: text('Region', { length: 1000 }),
    PostalCode: text('PostalCode', { length: 1000 }),
    Country: text('Country', { length: 1000 }),
    Phone: text('Phone', { length: 1000 }),
    Fax: text('Fax', { length: 1000 }),
    HomePage: text('HomePage', { length: 1000 }),
});

export const Orders = sqliteTable('Orders', {
    OrderID: integer('OrderID').primaryKey(),
    CustomerID: text('CustomerID', { length: 1000 }),
    EmployeeID: integer('EmployeeID').notNull(),
    OrderDate: text('OrderDate', { length: 1000 }),
    RequiredDate: text('RequiredDate', { length: 1000 }),
    ShippedDate: text('ShippedDate', { length: 1000 }),
    ShipVia: integer('ShipVia'),
    Freight: real('Freight').notNull(), // Using real for decimal values
    ShipName: text('ShipName', { length: 1000 }),
    ShipAddress: text('ShipAddress', { length: 1000 }),
    ShipCity: text('ShipCity', { length: 1000 }),
    ShipRegion: text('ShipRegion', { length: 1000 }),
    ShipPostalCode: text('ShipPostalCode', { length: 1000 }),
    ShipCountry: text('ShipCountry', { length: 1000 }),
});

export const Products = sqliteTable('Products', {
    ProductID: integer('ProductID').primaryKey(),
    ProductName: text('ProductName', { length: 1000 }),
    SupplierID: integer('SupplierID').notNull(),
    CategoryID: integer('CategoryID').notNull(),
    QuantityPerUnit: text('QuantityPerUnit', { length: 1000 }),
    UnitPrice: real('UnitPrice').notNull(), // Using real for decimal values
    UnitsInStock: integer('UnitsInStock').notNull(),
    UnitsOnOrder: integer('UnitsOnOrder').notNull(),
    ReorderLevel: integer('ReorderLevel').notNull(),
    Discontinued: integer('Discontinued').notNull(),
});

export const OrderDetails = sqliteTable('OrderDetails', {
    OrderID: text('OrderID', { length: 1000 }),
    ProductID: integer('ProductID').notNull(),
    UnitPrice: real('UnitPrice').notNull(), // Using real for decimal values
    Quantity: integer('Quantity').notNull(),
    Discount: real('Discount').notNull(), // Using real for double values
});

export const Regions = sqliteTable('Regions', {
    RegionID: integer('RegionID').primaryKey(),
    RegionDescription: text('RegionDescription', { length: 1000 }),
});

export const Territories = sqliteTable('Territories', {
    TerritoryID: text('TerritoryID', { length: 1000 }).primaryKey(),
    TerritoryDescription: text('TerritoryDescription', { length: 1000 }),
    RegionID: integer('RegionID').notNull(),
});

export const EmployeeTerritories = sqliteTable('EmployeeTerritories', {
    EmployeeID: integer('EmployeeID').notNull(),
    TerritoryID: text('TerritoryID', { length: 1000 }),
});

export const ResponseLogs = sqliteTable('ResponseLogs', {
    SessionID: text('SessionID', { length: 1000 }),
    SessionIP: text('SessionIP', { length: 1000 }),
    queriedAt: text('queriedAt', { length: 1000 }), // Storing datetime as text
    Query: text('Query', { length: 1000 }),
    RowsReturned: integer('RowsReturned').default(0),
    ResponseTime: real('ResponseTime'),
});

export type Employee = typeof Employees.$inferSelect;
export type NewEmployee = typeof Employees.$inferInsert;

export type Category = typeof Categories.$inferSelect;
export type NewCategory = typeof Categories.$inferInsert;

export type Customer = typeof Customers.$inferSelect;
export type NewCustomer = typeof Customers.$inferInsert;

export type Shipper = typeof Shippers.$inferSelect;
export type NewShipper = typeof Shippers.$inferInsert;

export type Supply = typeof Supplies.$inferSelect;
export type NewSupply = typeof Supplies.$inferInsert;

export type Order = typeof Orders.$inferSelect;
export type NewOrder = typeof Orders.$inferInsert;

export type Product = typeof Products.$inferSelect;
export type NewProduct = typeof Products.$inferInsert;

export type OrderDetail = typeof OrderDetails.$inferSelect;
export type NewOrderDetail = typeof OrderDetails.$inferInsert;

export type Region = typeof Regions.$inferSelect;
export type NewRegion = typeof Regions.$inferInsert;

export type Territory = typeof Territories.$inferSelect;
export type NewTerritory = typeof Territories.$inferInsert;

export type EmployeeTerritory = typeof EmployeeTerritories.$inferSelect;
export type NewEmployeeTerritory = typeof EmployeeTerritories.$inferInsert;

export type ResponseLog = typeof ResponseLogs.$inferSelect;
export type NewResponseLog = typeof ResponseLogs.$inferInsert;