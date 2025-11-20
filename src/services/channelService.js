import apiClient from './api';

/**
 * Channel Service
 * Handles all channel-related API calls
 */

const channelService = {
  /**
   * Get all channels
   * @returns {Promise} List of channels
   */
  getAllChannels: async () => {
    try {
      const response = await apiClient.get('/channel');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get channel by ID
   * @param {string} channelId - Channel ID
   * @returns {Promise} Channel details
   */
  getChannelById: async (channelId) => {
    try {
      const response = await apiClient.get(`/channel/${channelId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create new channel
   * @param {Object} channelData - { name, description }
   * @returns {Promise} Created channel
   */
  createChannel: async (channelData) => {
    try {
      const response = await apiClient.post('/channel', channelData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update channel
   * @param {string} channelId - Channel ID
   * @param {Object} channelData - Updated channel data
   * @returns {Promise} Updated channel
   */
  updateChannel: async (channelId, channelData) => {
    try {
      const response = await apiClient.put(`/channel/${channelId}`, channelData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete channel
   * @param {string} channelId - Channel ID
   * @returns {Promise} Deletion confirmation
   */
  deleteChannel: async (channelId) => {
    try {
      const response = await apiClient.delete(`/channel/${channelId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default channelService;
