import healthService from '../services/healthService.js';
export class HealthController {
  async checkHealth(req, res) {
    try {
      const health = await healthService.checkHealth();
      return res.status(health.status === 'success' ? 200 : 500).json(health);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error checking health status',
        error: error.message,
      });
    }
  }
}
