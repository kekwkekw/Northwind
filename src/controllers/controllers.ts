import { Request, Response, NextFunction } from 'express';
import { dbInteractor} from '../db/db';
import { getWorkerData } from '../utils/utils';

function tryCatchDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(req: Request, res: Response, next: NextFunction) {
        try {
            await originalMethod.call(this, req, res, next);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    return descriptor;
}

class Controller {
    async createRouteHandler(tableName: string, req: Request, res: Response) {
        const start = Date.now();
        const limit = parseInt(req.query.limit as string) || Infinity;
        const offset = parseInt(req.query.offset as string) || 0;
        const id = req.query.id as string || '';
        const sessionID = req.headers['session-id'] as string || '1';
        const whereLike = req.query.whereLike as string || '';
        console.log('Request with parameters:', `${tableName}, ${limit}, ${offset}, ${id}`);

        let outputData;
        if (id) {
            outputData = await dbInteractor.searchByID(tableName, id);
        } else if (whereLike) {
            outputData = await dbInteractor.searchByName(tableName, whereLike);
        }
        else {
            outputData = await dbInteractor.getData(tableName, limit, offset);
        }
        console.log('Inserting data:', { SessionIP: req.ip, SessionID: sessionID, queriedAt: new Date(), Query: outputData['query'], RowsReturned: outputData['result'].length, ResponseTime: Date.now() - start });
        dbInteractor.insertData('ResponseLogs', { SessionIP: req.ip, SessionID: sessionID, queriedAt: new Date().toISOString(), Query: outputData['query'], RowsReturned: outputData['result'].length, ResponseTime: Date.now() - start });
        console.log('Inserted data into ResponseLogs');
        let countData = await dbInteractor.countRows(tableName);
        dbInteractor.insertData('ResponseLogs', { SessionIP: req.ip, SessionID: sessionID, queriedAt: new Date().toISOString(), Query: countData['query'], RowsReturned: countData['result'], ResponseTime: Date.now() - start });
        console.log('Inserted data into ResponseLogs 2');
        let output = {
            count: countData['result'],
            data: outputData
        };
        console.log('Request with parameters:', `${tableName}, ${limit}, ${offset}, ${id}`);
        res.json(output);
    }

    @tryCatchDecorator
    async responseLogs(req: Request, res: Response) {
        const sessionID = req.headers['session-id'] as string || '1'
        console.log(`Logs request from ${req.ip} with sessionID ${sessionID}`);

        const stats = await dbInteractor.responseLogsStats(sessionID);
        const history = await dbInteractor.responseLogsHistory(sessionID);

        res.json({ stats: stats, history: history });
    }

    @tryCatchDecorator
    async workerData(req: Request, res: Response) {
        const ip = req.query.ip as string || req.ip as string || '';
        const outputData = await getWorkerData(ip);
        res.json(outputData);
    }

    @tryCatchDecorator
    async suppliers(req: Request, res: Response){
        await this.createRouteHandler('Supplies', req, res);
    };

    @tryCatchDecorator
    async products(req: Request, res: Response){
        await this.createRouteHandler('Products', req, res);
    };

    @tryCatchDecorator
    async employees(req: Request, res: Response){
        await this.createRouteHandler('Employees', req, res);
    };

    @tryCatchDecorator
    async orders(req: Request, res: Response){
        await this.createRouteHandler('Orders', req, res);
    };

    @tryCatchDecorator
    async customers(req: Request, res: Response){
        await this.createRouteHandler('Customers', req, res);
    };
}

const controller = new Controller();

export { controller };
