const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const { env } = require('./config/env');
const { logger } = require('./utils/responseHelper');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { blockBiometricData } = require('./middleware/validateRequest');
const companyRoutes = require('./routes/company.routes');
const applicationRoutes = require('./routes/application.routes');
const registrationRoutes = require('./routes/registration.routes');
const authenticationRoutes = require('./routes/authentication.routes');
const recoveryRoutes = require('./routes/recovery.routes');
const auditRoutes = require('./routes/audit.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const { resolveCorsForRequest } = require('./middleware/validateRequest');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(blockBiometricData);

app.use(cors(resolveCorsForRequest));

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/register', registrationRoutes);
app.use('/api/v1/auth', authenticationRoutes);
app.use('/api/v1/recovery', recoveryRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
