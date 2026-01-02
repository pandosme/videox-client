/**
 * Server Configuration Management
 * Manages multiple VideoX server connections stored locally in the browser
 */

const SERVERS_KEY = 'videox_servers';
const SELECTED_SERVER_KEY = 'videox_selected_server';

/**
 * Get all configured servers
 * @returns {Array<Object>} Array of server configurations
 */
export const getServers = () => {
  try {
    const data = localStorage.getItem(SERVERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load server configurations:', error);
    return [];
  }
};

/**
 * Get a specific server by ID
 * @param {string} serverId - Server ID
 * @returns {Object|null} Server configuration or null
 */
export const getServer = (serverId) => {
  const servers = getServers();
  return servers.find((s) => s.id === serverId) || null;
};

/**
 * Add a new server configuration
 * @param {Object} serverConfig - Server configuration
 * @returns {Object} Created server with ID
 */
export const addServer = (serverConfig) => {
  const servers = getServers();
  const newServer = {
    id: generateId(),
    name: serverConfig.name,
    address: serverConfig.address,
    port: serverConfig.port || 3002,
    useTLS: serverConfig.useTLS || false,
    createdAt: new Date().toISOString(),
  };

  servers.push(newServer);
  localStorage.setItem(SERVERS_KEY, JSON.stringify(servers));
  return newServer;
};

/**
 * Update an existing server configuration
 * @param {string} serverId - Server ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated server or null
 */
export const updateServer = (serverId, updates) => {
  const servers = getServers();
  const index = servers.findIndex((s) => s.id === serverId);

  if (index === -1) return null;

  servers[index] = {
    ...servers[index],
    ...updates,
    id: serverId, // Ensure ID doesn't change
    createdAt: servers[index].createdAt, // Preserve creation date
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(SERVERS_KEY, JSON.stringify(servers));
  return servers[index];
};

/**
 * Delete a server configuration
 * @param {string} serverId - Server ID
 * @returns {boolean} Success status
 */
export const deleteServer = (serverId) => {
  const servers = getServers();
  const filtered = servers.filter((s) => s.id !== serverId);

  if (filtered.length === servers.length) return false;

  localStorage.setItem(SERVERS_KEY, JSON.stringify(filtered));

  // If deleted server was selected, clear selection
  if (getSelectedServerId() === serverId) {
    clearSelectedServer();
  }

  return true;
};

/**
 * Get the currently selected server ID
 * @returns {string|null} Selected server ID or null
 */
export const getSelectedServerId = () => {
  return localStorage.getItem(SELECTED_SERVER_KEY);
};

/**
 * Get the currently selected server
 * @returns {Object|null} Selected server configuration or null
 */
export const getSelectedServer = () => {
  const serverId = getSelectedServerId();
  return serverId ? getServer(serverId) : null;
};

/**
 * Set the currently selected server
 * @param {string} serverId - Server ID
 * @returns {boolean} Success status
 */
export const setSelectedServer = (serverId) => {
  const server = getServer(serverId);
  if (!server) return false;

  localStorage.setItem(SELECTED_SERVER_KEY, serverId);
  return true;
};

/**
 * Clear the selected server
 */
export const clearSelectedServer = () => {
  localStorage.removeItem(SELECTED_SERVER_KEY);
};

/**
 * Get the API base URL for a server
 * @param {Object} server - Server configuration
 * @returns {string|null} Base URL or null for same-origin (proxy) mode
 */
export const getServerUrl = (server) => {
  // Same-origin mode: use relative URLs (for nginx reverse proxy setups)
  if (!server.address || server.address === 'same-origin' || server.address === 'local') {
    return null;
  }

  const protocol = server.useTLS ? 'https' : 'http';
  return `${protocol}://${server.address}:${server.port}`;
};

/**
 * Get display text for a server URL (for UI purposes)
 * @param {Object} server - Server configuration
 * @returns {string} Display text
 */
export const getServerDisplayUrl = (server) => {
  const url = getServerUrl(server);
  return url || 'Same-origin (proxy mode)';
};

/**
 * Get the API base URL for the currently selected server
 * @returns {string|null} Base URL or null if no server selected
 */
export const getSelectedServerUrl = () => {
  const server = getSelectedServer();
  return server ? getServerUrl(server) : null;
};

/**
 * Test connection to a server
 * @param {Object} server - Server configuration
 * @returns {Promise<Object>} Test result with status and message
 */
export const testServerConnection = async (server) => {
  const url = getServerUrl(server);

  try {
    const response = await fetch(`${url}/api/system/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Server responded with status ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: 'Connection successful',
      health: data,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Connection timeout - server did not respond',
      };
    }

    return {
      success: false,
      message: `Connection failed: ${error.message}`,
    };
  }
};

/**
 * Generate a unique ID for a server
 * @returns {string} Unique ID
 */
function generateId() {
  return `server_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Export all server configurations (for backup)
 * @returns {string} JSON string of all servers
 */
export const exportServers = () => {
  return JSON.stringify(getServers(), null, 2);
};

/**
 * Import server configurations (from backup)
 * @param {string} jsonData - JSON string of servers
 * @returns {boolean} Success status
 */
export const importServers = (jsonData) => {
  try {
    const servers = JSON.parse(jsonData);
    if (!Array.isArray(servers)) {
      throw new Error('Invalid server data format');
    }

    localStorage.setItem(SERVERS_KEY, JSON.stringify(servers));
    return true;
  } catch (error) {
    console.error('Failed to import servers:', error);
    return false;
  }
};
