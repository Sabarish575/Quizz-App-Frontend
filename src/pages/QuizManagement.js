import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { ArrowBack, Add, Upload, PostAdd } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { channelService } from '../services';

const QuizManagement = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddQuestionDialog, setOpenAddQuestionDialog] = useState(false);
  const [openBulkUploadDialog, setOpenBulkUploadDialog] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch channels on component mount
  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const response = await channelService.getAllChannels();
      console.log('Fetched channels:', response);
      setChannels(response.channels || response);
      setError(null);
    } catch (err) {
      console.error('Error fetching channels:', err);
      setError(err.message || 'Failed to load channels');
      setSnackbar({ open: true, message: 'Failed to load channels', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChannel = async () => {
    if (!channelName.trim()) {
      setSnackbar({ open: true, message: 'Channel name is required', severity: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const channelData = {
        name: channelName,
        description: channelDescription,
      };
      
      await channelService.createChannel(channelData);
      setSnackbar({ open: true, message: 'Channel created successfully', severity: 'success' });
      setOpenDialog(false);
      setChannelName('');
      setChannelDescription('');
      
      // Refresh channels list
      fetchChannels();
    } catch (err) {
      console.error('Error creating channel:', err);
      setSnackbar({ open: true, message: err.message || 'Failed to create channel', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = (channel) => {
    setSelectedQuiz(channel);
    setOpenAddQuestionDialog(true);
  };

  const handleBulkUpload = (channel) => {
    setSelectedQuiz(channel);
    setOpenBulkUploadDialog(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar 
        position="static"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Quiz Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Quiz Channels</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            disabled={loading}
          >
            Create Quiz Channel
          </Button>
        </Box>

        {loading && channels.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error && channels.length === 0 ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : channels.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No channels created yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Click "Create Quiz Channel" to get started
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {channels.map((channel, index) => (
              <Grid item xs={12} md={6} key={channel._id || index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {channel.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {channel.description || 'No description'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip label={`${channel.questionsCount || 0} Questions`} size="small" />
                      <Chip label={new Date(channel.createdAt).toLocaleDateString()} size="small" color="primary" />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    <Button 
                      size="small" 
                      startIcon={<PostAdd />}
                      onClick={() => handleAddQuestion(channel)}
                      variant="outlined"
                    >
                      Add Question
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<Upload />}
                      onClick={() => handleBulkUpload(channel)}
                      variant="outlined"
                      color="secondary"
                    >
                      Add in Bulk
                    </Button>
                    <Button size="small">Edit</Button>
                    <Button size="small" color="error">
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Quiz Channel</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Channel Name"
            fullWidth
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="e.g., Ai developer MCQ"
          />
          <TextField
            margin="dense"
            label="Channel Description"
            fullWidth
            multiline
            rows={3}
            value={channelDescription}
            onChange={(e) => setChannelDescription(e.target.value)}
            placeholder="e.g., Its about ai exam and its summary for quick learning of user."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={loading}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateChannel}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create 1'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Add Question Dialog */}
      <Dialog open={openAddQuestionDialog} onClose={() => setOpenAddQuestionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Question to {selectedQuiz?.title}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Question"
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Option A"
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Option B"
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Option C"
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Option D"
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Correct Answer"
            fullWidth
            select
            SelectProps={{ native: true }}
            sx={{ mb: 2 }}
          >
            <option value="">Select correct answer</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </TextField>
          <TextField
            margin="dense"
            label="Points"
            type="number"
            fullWidth
            defaultValue={10}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddQuestionDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenAddQuestionDialog(false)}>
            Add Question
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={openBulkUploadDialog} onClose={() => setOpenBulkUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Upload Questions to {selectedQuiz?.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload a CSV or JSON file containing multiple questions
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Choose File
              <input type="file" hidden accept=".csv,.json" />
            </Button>
            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                CSV Format:<br/>
                question,optionA,optionB,optionC,optionD,correctAnswer,points<br/>
                "What is 2+2?","2","3","4","5","C",10
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkUploadDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Upload />} onClick={() => setOpenBulkUploadDialog(false)}>
            Upload Questions
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
};

export default QuizManagement;
