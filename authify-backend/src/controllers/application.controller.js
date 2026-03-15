const { v4: uuidv4 } = require('uuid');
const Application = require('../models/Application');
const { success } = require('../utils/responseHelper');

const createApplication = async (req, res) => {
  const companyId = req.companyId;
  const { name, redirectUris = [], allowedOrigins = [] } = req.body;

  const app = await Application.create({
    companyId,
    name,
    clientId: uuidv4(),
    redirectUris,
    allowedOrigins,
    active: true
  });

  return success(res, { applicationId: app._id, clientId: app.clientId }, 201);
};

const listApplications = async (req, res) => {
  const apps = await Application.find({ companyId: req.companyId });
  return success(res, apps);
};

const updateApplication = async (req, res) => {
  const { appId } = req.params;
  const updates = {};
  if (req.body.redirectUris) updates.redirectUris = req.body.redirectUris;
  if (req.body.allowedOrigins) updates.allowedOrigins = req.body.allowedOrigins;

  const app = await Application.findOneAndUpdate(
    { _id: appId, companyId: req.companyId },
    updates,
    { new: true }
  );

  if (!app) {
    return res.status(403).json({ success: false, error: { code: 'TENANT_VIOLATION', message: 'Access denied.' } });
  }

  return success(res, app);
};

const deleteApplication = async (req, res) => {
  const { appId } = req.params;
  const app = await Application.findOneAndUpdate(
    { _id: appId, companyId: req.companyId },
    { active: false },
    { new: true }
  );

  if (!app) {
    return res.status(403).json({ success: false, error: { code: 'TENANT_VIOLATION', message: 'Access denied.' } });
  }

  return success(res, { applicationId: app._id, active: app.active });
};

module.exports = { createApplication, listApplications, updateApplication, deleteApplication };
