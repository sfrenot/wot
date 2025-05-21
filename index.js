import express from 'express';

import extract from './extract.js';

const app = express();
app.listen(3030);
app.use('/', extract);
