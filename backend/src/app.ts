import express from 'express';
import { Request, Response } from 'express';
import 'reflect-metadata';
import helmet from 'helmet';
import path from 'path';
import cors from 'cors';
import passport from 'passport';
import cookieParser from 'cookie-parser';

import envConfig from './config/envConfig';
import userRouter from './routes/user.routes';
import authRouter from './routes/auth.routes';
import productRouter from './routes/product.routes';
import reportRouter from './routes/reporting.routes';
import { errorHandler } from './middlewares/errorHandler';

// Pass the global passport object into the configuration function
// require('./config/passport')(passport);

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

const app = express();

// This will initialize the passport object on every request
app.use(passport.initialize());
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'script-src': ["'self'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'upgrade-insecure-requests': envConfig.NODE_ENV === 'development' ? null : []
      },
      reportOnly: true
    }
  })
);
app.use(
  cors({
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(errorHandler);
app.use(express.static(path.join(__dirname, '..', 'src', '/images'))); // Serve images in directory images/

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/guitar', productRouter);
app.use('/reporting', reportRouter);

app.get('*', (req: Request, res: Response) => {
  res.status(505).json({ message: 'Bad Request' });
});

export default app;
