import healthService from '../services/healthService.js';

export const checkHealth = async (req, res) => {
  const health = await healthService.checkHealth();
  return res.status(health.status === 'success' ? 200 : 500).json(health);
};
