import { Router } from 'express';
import { ProductController } from '../controller/ProductController';
import { validateGuitarId } from '../middlewares/validateGuitar';

const productRouter = Router();

productRouter.get('/list', ProductController.listGuitars);
productRouter.get('/:id', validateGuitarId, ProductController.getGuitar);
productRouter.post('/update/:id', validateGuitarId, ProductController.updateGuitar);
productRouter.post('/delete/:id', validateGuitarId, ProductController.deleteGuitar);

export default productRouter;
