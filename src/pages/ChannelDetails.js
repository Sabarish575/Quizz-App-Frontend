import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Tabs,
  Tab,
  Avatar,
  ListItemAvatar,
} from '@mui/material';
import {
  ArrowBack,
  ExpandMore,
  CheckCircle,
  RadioButtonUnchecked,
  Quiz as QuizIcon,
  PersonAdd,
  People,
  Email,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { quizService, channelService } from '../services';

const ChannelDetails = () => {
  const navigate = useNavigate();
  const { channelId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [channelInfo, setChannelInfo] = useState(null);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [addingUser, setAddingUser] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentTab, setCurrentTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (channelId) {
      fetchQuestions();
    }
    // eslint-disable-next-line 
  }, [channelId]);

  useEffect(() => {
    if (currentTab === 1 && channelId) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, channelId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await quizService.getAllQuizzes(channelId);
      console.log('Questions response:', response);
      
      // Handle different response structures
      const questionsData = response?.data
      const channelData = response.channel || response.data?.channel;
      
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
      setChannelInfo(channelData);
      setError(null);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await channelService.getChannelUsers(channelId);
      console.log('Users response:', response);
      
      const usersData = response.users || response.data?.users || response.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setSnackbar({ open: true, message: 'Failed to load users', severity: 'error' });
    } finally {
      setUsersLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleAddUser = async () => {
    if (!userEmail.trim()) {
      setSnackbar({ open: true, message: 'Please enter an email address', severity: 'warning' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setSnackbar({ open: true, message: 'Please enter a valid email address', severity: 'warning' });
      return;
    }

    setAddingUser(true);
    try {
      await channelService.addUserToChannel(channelId, { email: userEmail });
      
      setSnackbar({ 
        open: true, 
        message: `User ${userEmail} has been added to the channel!`, 
        severity: 'success' 
      });
      setOpenAddUserDialog(false);
      setUserEmail('');
      
      // Refresh users list if on Users tab
      if (currentTab === 1) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Error adding user:', err);
      setSnackbar({ 
        open: true, 
        message: err.message || 'Failed to add user to channel', 
        severity: 'error' 
      });
    } finally {
      setAddingUser(false);
    }
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
            onClick={() => navigate('/quiz-management')}
          >
            <ArrowBack />
          </IconButton>
          <QuizIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {channelInfo?.name || 'Channel Questions'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<PersonAdd />}
            onClick={() => setOpenAddUserDialog(true)}
            sx={{ 
              mr: 2,
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Add User
          </Button>
          {questions.length > 0 && (
            <Chip
              label={`${questions.length} Questions`}
              color="secondary"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {channelInfo && (
          <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea15 0%, #764ba205 100%)' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {channelInfo.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {channelInfo.description || 'No description available'}
            </Typography>
          </Paper>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, newValue) => setCurrentTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QuizIcon />
                  Questions
                  <Chip label={questions.length} size="small" color="primary" />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <People />
                  Users
                  <Chip label={users.length} size="small" color="secondary" />
                </Box>
              } 
            />
          </Tabs>
        </Paper>

        {/* Questions Tab */}
        {currentTab === 0 && (
          loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : questions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No questions found in this channel
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Add questions using the "Add Question" or "Add in Bulk" buttons
              </Typography>
            </Box>
          ) : (
            <Box>
              <Grid container spacing={2}>
                {questions.map((question, index) => (
                <Grid item xs={12} key={question._id || index}>
                  <Accordion
                    sx={{
                      '&:before': { display: 'none' },
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4,
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        '& .MuiAccordionSummary-content': {
                          alignItems: 'center',
                          gap: 2,
                        },
                      }}
                    >
                      <Chip
                        label={`Q${index + 1}`}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 600, minWidth: 50 }}
                      />
                      <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>
                        {question?.questionText}
                      </Typography>
                      <Chip
                        label={question.difficulty || 'Medium'}
                        size="small"
                        color={getDifficultyColor(question.difficulty)}
                      />
                      <Chip
                        label={`${question.marks || 0} pts`}
                        size="small"
                        variant="outlined"
                      />
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ pl: 2 }}>
                        {question.createdAt && (
                            
                          <Chip
                            label={question.createdAt}
                            size="small"
                            sx={{ mb: 2 }}
                          />
                        )}
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                          Options:
                        </Typography>
                        <List dense>
                          {question.options?.map((option, optIndex) => (
                            <ListItem
                              key={optIndex}
                              sx={{
                                bgcolor: option.isCorrect ? 'success.light' : 'transparent',
                                borderRadius: 1,
                                mb: 1,
                                border: option.isCorrect ? '2px solid' : '1px solid',
                                borderColor: option.isCorrect ? 'success.main' : 'divider',
                              }}
                            >
                              {option.isCorrect ? (
                                <CheckCircle sx={{ mr: 2, color: 'success.main' }} />
                              ) : (
                                <RadioButtonUnchecked sx={{ mr: 2, color: 'text.secondary' }} />
                              )}
                              <ListItemText
                                primary={option.text}
                                secondary={option.isCorrect && option.explanation}
                                primaryTypographyProps={{
                                  fontWeight: option.isCorrect ? 600 : 400,
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}

        {/* Users Tab */}
        {currentTab === 1 && (
          usersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No users added to this channel yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Click "Add User" button to invite users
              </Typography>
            </Box>
          ) : (
            <Paper>
              <List>
                {users.map((user, index) => (
                  <React.Fragment key={user._id || user.email || index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.name || user.username || 'User'}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Email fontSize="small" />
                            {user.email}
                          </Box>
                        }
                      />
                      {user.role && (
                        <Chip label={user.role} size="small" color="primary" variant="outlined" />
                      )}
                    </ListItem>
                    {index < users.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )
        )}
      </Container>

      {/* Add User Dialog */}
      <Dialog open={openAddUserDialog} onClose={() => setOpenAddUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add User to Channel</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the email address of the user you want to add to this channel.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label="Email Address"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={addingUser}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddUser();
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddUserDialog(false)} disabled={addingUser}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddUser}
            disabled={addingUser}
            startIcon={addingUser ? <CircularProgress size={20} /> : <PersonAdd />}
          >
            {addingUser ? 'Adding...' : 'Add User'}
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

      <Footer />
    </Box>
  );
};

export default ChannelDetails;
