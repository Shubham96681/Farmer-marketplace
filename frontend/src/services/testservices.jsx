import { api } from './api';

export const testService = {
  testAllEndpoints: async () => {
    const tests = [];

    // Test health endpoint
    try {
      const healthResponse = await api.get('/health');
      tests.push({
        endpoint: '/health',
        status: '✅ Success',
        data: healthResponse.data
      });
    } catch (error) {
      tests.push({
        endpoint: '/health',
        status: '❌ Failed',
        error: error.message
      });
    }

    // Test products endpoint
    try {
      const productsResponse = await api.get('/products');
      tests.push({
        endpoint: '/products',
        status: '✅ Success',
        data: productsResponse.data
      });
    } catch (error) {
      tests.push({
        endpoint: '/products',
        status: '❌ Failed',
        error: error.message
      });
    }

    return tests;
  }
};