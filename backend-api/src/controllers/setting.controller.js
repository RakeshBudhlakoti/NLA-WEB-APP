const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendSuccess, sendError } = require('../utils/response');

// Get all settings
const getSettings = async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    // Convert array of {key, value} to an object {key: value}
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    
    return sendSuccess(res, 'Settings fetched successfully', settingsMap);
  } catch (error) {
    console.error('Get Settings Error:', error);
    return sendError(res, 'Failed to fetch settings', error.message);
  }
};

// Update multiple settings at once
const updateSettings = async (req, res) => {
  try {
    const updates = req.body; // Expects an object { key: value, key2: value2 }
    
    if (!updates || typeof updates !== 'object') {
      return sendError(res, 'Invalid updates format. Expected an object.', null, 400);
    }

    const promises = Object.entries(updates).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    });

    await Promise.all(promises);

    return sendSuccess(res, 'Settings updated successfully');
  } catch (error) {
    console.error('Update Settings Error:', error);
    return sendError(res, 'Failed to update settings', error.message);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
