import { Router } from "express";
import {controller} from '../controllers/controllers';

const router = Router();

router.get('/suppliers', controller.suppliers.bind(controller));
router.get('/products', controller.products.bind(controller));
router.get('/employees', controller.employees.bind(controller));
router.get('/orders', controller.orders.bind(controller));
router.get('/customers', controller.customers.bind(controller));
router.get('/responseLogs', controller.responseLogs.bind(controller));
router.get('/workerData', controller.workerData.bind(controller));

export default router;