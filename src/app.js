import express from 'express';
import { initialize } from './app/models/index.js';
import routes from './routes/index.js';

const app = express();

const startApp = async () => {
  try {
    await initialize();
    console.log('Database connections and models initialized successfully');

    app.use(express.json());
    app.use('/api/v1', routes);

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
};

startApp();

export default app;
