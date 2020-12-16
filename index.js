const express = require('express');
const config = require('config');
const cors = require('cors');

const app = express();
const PORT = config.get('port') || 5000;

// middleware
app.use(cors(config.get('corsOptions')));
app.use(express.json());

app.use('/api', require('./routes/staff.routes'));
app.use('/api', require('./routes/lines.routes'));
app.use('/api', require('./routes/tickets.routes'));
app.use('/api', require('./routes/stations.routes'));
app.use('/api', require('./routes/stationcrossings.routes'));
app.use('/api', require('./routes/lostthings.routes'));

app.listen(PORT, () => {
    console.log(`server has started on port ${PORT}...`)
});