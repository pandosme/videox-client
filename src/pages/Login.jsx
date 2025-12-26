import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as serverConfigService from '../services/serverConfig';

function Login() {
  const [step, setStep] = useState('server'); // 'server' or 'credentials'
  const [servers, setServers] = useState([]);
  const [selectedServerId, setSelectedServerId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Server management dialog
  const [serverDialog, setServerDialog] = useState(false);
  const [editingServer, setEditingServer] = useState(null);
  const [serverForm, setServerForm] = useState({
    name: '',
    address: '',
    port: 3002,
    useTLS: false,
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState(null);

  const { login } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = () => {
    const loadedServers = serverConfigService.getServers();
    setServers(loadedServers);

    // Auto-select if only one server or previously selected
    const previouslySelected = serverConfigService.getSelectedServerId();
    if (previouslySelected && loadedServers.find((s) => s.id === previouslySelected)) {
      setSelectedServerId(previouslySelected);
    } else if (loadedServers.length === 1) {
      setSelectedServerId(loadedServers[0].id);
    }
  };

  const handleAddServer = () => {
    setEditingServer(null);
    setServerForm({
      name: '',
      address: '',
      port: 3002,
      useTLS: false,
    });
    setConnectionTestResult(null);
    setServerDialog(true);
  };

  const handleEditServer = (server) => {
    setEditingServer(server);
    setServerForm({
      name: server.name,
      address: server.address,
      port: server.port,
      useTLS: server.useTLS,
    });
    setConnectionTestResult(null);
    setServerDialog(true);
  };

  const handleDeleteServer = (serverId) => {
    if (window.confirm('Are you sure you want to delete this server?')) {
      serverConfigService.deleteServer(serverId);
      loadServers();
      if (selectedServerId === serverId) {
        setSelectedServerId('');
      }
      success('Server deleted successfully');
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionTestResult(null);

    const testServer = {
      ...serverForm,
      id: 'test',
    };

    const result = await serverConfigService.testServerConnection(testServer);
    setConnectionTestResult(result);
    setTestingConnection(false);
  };

  const handleSaveServer = () => {
    if (!serverForm.name || !serverForm.address) {
      showError('Name and address are required');
      return;
    }

    if (editingServer) {
      serverConfigService.updateServer(editingServer.id, serverForm);
      success('Server updated successfully');
    } else {
      const newServer = serverConfigService.addServer(serverForm);
      setSelectedServerId(newServer.id);
      success('Server added successfully');
    }

    loadServers();
    setServerDialog(false);
  };

  const handleSelectServer = () => {
    if (!selectedServerId) {
      showError('Please select a server');
      return;
    }

    serverConfigService.setSelectedServer(selectedServerId);
    setStep('credentials');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      navigate('/cameras');
    } else {
      showError(result.error);
    }

    setLoading(false);
  };

  const handleBack = () => {
    setStep('server');
    setPassword('');
  };

  const selectedServer = servers.find((s) => s.id === selectedServerId);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            VideoX
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
            Video Management System
          </Typography>

          {step === 'server' ? (
            // Server Selection Step
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Select Server
              </Typography>

              {servers.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No servers configured. Please add a server to continue.
                </Alert>
              ) : (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>VideoX Server</InputLabel>
                  <Select
                    value={selectedServerId}
                    label="VideoX Server"
                    onChange={(e) => setSelectedServerId(e.target.value)}
                  >
                    {servers.map((server) => (
                      <MenuItem key={server.id} value={server.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1">{server.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {serverConfigService.getServerUrl(server)}
                            </Typography>
                          </Box>
                          <Box onClick={(e) => e.stopPropagation()}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditServer(server);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteServer(server.id);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddServer}
                sx={{ mb: 2 }}
              >
                Add New Server
              </Button>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSelectServer}
                disabled={!selectedServerId}
              >
                Continue
              </Button>
            </Box>
          ) : (
            // Credentials Step
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Server
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedServer?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {serverConfigService.getServerUrl(selectedServer)}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => handleEditServer(selectedServer)}>
                    <SettingsIcon />
                  </IconButton>
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
                autoFocus
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
              />

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ flex: 2 }}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Add/Edit Server Dialog */}
      <Dialog open={serverDialog} onClose={() => setServerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingServer ? 'Edit Server' : 'Add New Server'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Server Name"
            value={serverForm.name}
            onChange={(e) => setServerForm({ ...serverForm, name: e.target.value })}
            margin="normal"
            placeholder="My VideoX Server"
            helperText="A friendly name to identify this server"
          />
          <TextField
            fullWidth
            label="Address"
            value={serverForm.address}
            onChange={(e) => setServerForm({ ...serverForm, address: e.target.value })}
            margin="normal"
            placeholder="192.168.1.100 or videox.example.com"
            helperText="IP address or hostname"
          />
          <TextField
            fullWidth
            label="Port"
            type="number"
            value={serverForm.port}
            onChange={(e) => setServerForm({ ...serverForm, port: parseInt(e.target.value) })}
            margin="normal"
          />
          <FormControlLabel
            control={
              <Switch
                checked={serverForm.useTLS}
                onChange={(e) => setServerForm({ ...serverForm, useTLS: e.target.checked })}
              />
            }
            label="Use TLS/HTTPS"
            sx={{ mt: 2 }}
          />

          <Divider sx={{ my: 2 }} />

          <Button
            fullWidth
            variant="outlined"
            onClick={handleTestConnection}
            disabled={testingConnection || !serverForm.address}
            startIcon={testingConnection ? <CircularProgress size={20} /> : null}
          >
            {testingConnection ? 'Testing Connection...' : 'Test Connection'}
          </Button>

          {connectionTestResult && (
            <Alert
              severity={connectionTestResult.success ? 'success' : 'error'}
              icon={connectionTestResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
              sx={{ mt: 2 }}
            >
              {connectionTestResult.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServerDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveServer}
            variant="contained"
            disabled={!serverForm.name || !serverForm.address}
          >
            {editingServer ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Login;
