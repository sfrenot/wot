import express from 'express';

import extract from './extract.js';
import history from './history.js';

const app = express();
app.listen(3030);
app.use('/crawl', extract);
app.use('/history', history)
app.use(express.static('public'))
