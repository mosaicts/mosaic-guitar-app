import dataSource from './data-source';
import envConfig from './config/envConfig';
import express from 'express';
import { Request, Response } from 'express';
import 'reflect-metadata';
import helmet from 'helmet';
import path from 'path';
import cors from 'cors';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import session from 'express-session';

import userRouter from './routes/user.routes';
import authRouter from './routes/auth.routes';
import productRouter from './routes/product.routes';
import reportRouter from './routes/reporting.routes';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import { requestSanitizer } from './middlewares/requestSanitizer';

const { PORT } = envConfig;

export const main = async () => {
  try {
    const app = express();

    // This will initialize the passport object on every request
    app.use(passport.initialize());
    /**
     * API keys and Passport configuration.
     */
    require('./config/passport');
    app.use(session({ secret: 'SECRET' }));
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
        origin: ['http://localhost:5173', 'https://accounts.google.com'],
        optionsSuccessStatus: 200,
        credentials: true
      })
    );
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(errorHandler);
    app.use(requestSanitizer);
    app.use(requestLogger);
    app.use(express.static(path.join(__dirname, '..', 'src', '/images'))); // Serve images in directory images/

    app.use('/auth', authRouter);
    app.use('/user', userRouter);
    app.use('/guitar', productRouter);
    app.use('/reporting', reportRouter);

    app.get('*', (req: Request, res: Response) => {
      res.status(505).json({ message: 'Bad Request' });
    });

    await dataSource.AppDataSource.initialize();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

main();
