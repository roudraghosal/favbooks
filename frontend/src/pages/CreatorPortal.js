import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Container,
    Box,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    CardContent,
    CardActions,
    Grid,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tab,
    Tabs,
    IconButton,
    Paper
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    ThumbUp as ThumbUpIcon,
    Publish as PublishIcon,
    Add as AddIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const CreatorPortal = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [creatorProfile, setCreatorProfile] = useState(null);
    const [myContent, setMyContent] = useState([]);
    const [publicContent, setPublicContent] = useState([]);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
    const [openLoginDialog, setOpenLoginDialog] = useState(false);

    // Form states
    const [uploadForm, setUploadForm] = useState({
        title: '',
        category: 'quote',
        content_text: ''
    });

    const [registerForm, setRegisterForm] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        bio: ''
    });

    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        checkCreatorAuth();
        loadPublicContent();
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            loadMyContent();
        }
    }, [isLoggedIn]);

    const checkCreatorAuth = () => {
        const token = localStorage.getItem('creator_token');
        if (token) {
            setIsLoggedIn(true);
            loadCreatorProfile(token);
        }
    };

    const loadCreatorProfile = async (token) => {
        try {
            const response = await axios.get(`${API_URL}/creator/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCreatorProfile(response.data);
        } catch (error) {
            console.error('Error loading creator profile:', error);
            localStorage.removeItem('creator_token');
            setIsLoggedIn(false);
        }
    };

    const loadMyContent = async () => {
        try {
            const token = localStorage.getItem('creator_token');
            const response = await axios.get(`${API_URL}/creator/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyContent(response.data);
        } catch (error) {
            console.error('Error loading my content:', error);
            toast.error('Failed to load your content');
        }
    };

    const loadPublicContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/creator/content`);
            setPublicContent(response.data);
        } catch (error) {
            console.error('Error loading public content:', error);
        }
    };

    const handleRegister = async () => {
        try {
            await axios.post(`${API_URL}/creator/register`, registerForm);
            toast.success('Registration successful! Please login.');
            setOpenRegisterDialog(false);
            setOpenLoginDialog(true);
            setRegisterForm({ name: '', email: '', username: '', password: '', bio: '' });
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Registration failed');
        }
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${API_URL}/creator/login`, loginForm);
            localStorage.setItem('creator_token', response.data.access_token);
            setIsLoggedIn(true);
            setCreatorProfile(response.data.creator);
            setOpenLoginDialog(false);
            setLoginForm({ email: '', password: '' });
            toast.success('Logged in successfully!');
            loadMyContent();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Login failed');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('creator_token');
        setIsLoggedIn(false);
        setCreatorProfile(null);
        setMyContent([]);
        toast.success('Logged out successfully');
    };

    const handleUpload = async () => {
        try {
            const token = localStorage.getItem('creator_token');
            await axios.post(`${API_URL}/creator/upload`, uploadForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Content uploaded! Awaiting admin approval.');
            setOpenUploadDialog(false);
            setUploadForm({ title: '', category: 'quote', content_text: '' });
            loadMyContent();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Upload failed');
        }
    };

    const handlePublishRequest = async (contentId) => {
        try {
            const token = localStorage.getItem('creator_token');
            await axios.post(
                `${API_URL}/creator/publish-request`,
                { content_id: contentId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Publication request submitted!');
            loadMyContent();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Request failed');
        }
    };

    const handleLike = async (contentId) => {
        try {
            await axios.post(`${API_URL}/creator/like`, { content_id: contentId });
            loadPublicContent();
        } catch (error) {
            console.error('Error liking content:', error);
        }
    };

    const renderPublicContent = () => (
        <Grid container spacing={3}>
            {publicContent.map((content) => (
                <Grid item xs={12} md={6} lg={4} key={content.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#282828' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Chip
                                label={content.category}
                                size="small"
                                sx={{ mb: 1, bgcolor: '#1db954', color: 'white' }}
                            />
                            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                                {content.title}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#b3b3b3',
                                    maxHeight: '150px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {content.content_text}
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                <Chip
                                    icon={<VisibilityIcon />}
                                    label={content.views_count || 0}
                                    size="small"
                                    variant="outlined"
                                    sx={{ color: '#b3b3b3', borderColor: '#404040' }}
                                />
                                <Chip
                                    icon={<ThumbUpIcon />}
                                    label={content.likes_count || 0}
                                    size="small"
                                    variant="outlined"
                                    sx={{ color: '#b3b3b3', borderColor: '#404040' }}
                                />
                            </Box>
                        </CardContent>
                        <CardActions>
                            <Button
                                size="small"
                                startIcon={<ThumbUpIcon />}
                                onClick={() => handleLike(content.id)}
                                sx={{ color: '#1db954' }}
                            >
                                Like
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    const renderMyContent = () => (
        <Grid container spacing={3}>
            {myContent.map((content) => (
                <Grid item xs={12} md={6} lg={4} key={content.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#282828' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Chip
                                    label={content.category}
                                    size="small"
                                    sx={{ bgcolor: '#1db954', color: 'white' }}
                                />
                                {content.approved && (
                                    <Chip label="Approved" size="small" color="success" />
                                )}
                                {content.rejected && (
                                    <Chip label="Rejected" size="small" color="error" />
                                )}
                                {!content.approved && !content.rejected && (
                                    <Chip label="Pending" size="small" sx={{ bgcolor: '#ffa500', color: 'white' }} />
                                )}
                            </Box>
                            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                                {content.title}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#b3b3b3',
                                    maxHeight: '150px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {content.content_text}
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                <Chip
                                    icon={<VisibilityIcon />}
                                    label={content.views_count || 0}
                                    size="small"
                                    variant="outlined"
                                    sx={{ color: '#b3b3b3', borderColor: '#404040' }}
                                />
                                <Chip
                                    icon={<ThumbUpIcon />}
                                    label={content.likes_count || 0}
                                    size="small"
                                    variant="outlined"
                                    sx={{ color: '#b3b3b3', borderColor: '#404040' }}
                                />
                            </Box>
                            {content.publish_request && (
                                <Chip
                                    label={`Publish Status: ${content.publish_request_status}`}
                                    size="small"
                                    sx={{ mt: 1, bgcolor: '#404040', color: 'white' }}
                                />
                            )}
                        </CardContent>
                        <CardActions>
                            {content.approved && !content.publish_request && (
                                <Button
                                    size="small"
                                    startIcon={<PublishIcon />}
                                    onClick={() => handlePublishRequest(content.id)}
                                    sx={{ color: '#1db954' }}
                                >
                                    Request Publication
                                </Button>
                            )}
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#121212' }}>
            {/* Header */}
            <Paper
                elevation={3}
                sx={{
                    bgcolor: '#181818',
                    borderBottom: '1px solid #282828',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ py: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton onClick={() => navigate('/')} sx={{ color: 'white' }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                ✍️ Creator Portal
                            </Typography>
                        </Box>
                        <Box>
                            {isLoggedIn ? (
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Typography sx={{ color: '#b3b3b3' }}>
                                        Welcome, {creatorProfile?.name}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        onClick={handleLogout}
                                        sx={{ color: 'white', borderColor: '#404040' }}
                                    >
                                        Logout
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setOpenLoginDialog(true)}
                                        sx={{ color: 'white', borderColor: '#404040' }}
                                    >
                                        Creator Login
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => setOpenRegisterDialog(true)}
                                        sx={{ bgcolor: '#1db954', '&:hover': { bgcolor: '#1ed760' } }}
                                    >
                                        Become a Creator
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Container>
            </Paper>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Description */}
                <Box sx={{ mb: 4, p: 3, bgcolor: '#282828', borderRadius: 2 }}>
                    <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
                        📚 Share Your Creative Work
                    </Typography>
                    <Typography sx={{ color: '#b3b3b3', mb: 2 }}>
                        Welcome to the Creator Portal! Here you can share your original quotes, poems, short stories,
                        and book excerpts with our community. Once approved, your work will be visible to all users,
                        and you can even request publication on Flipkart!
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip label="📝 Share Quotes" sx={{ bgcolor: '#404040', color: 'white' }} />
                        <Chip label="📖 Publish Poems" sx={{ bgcolor: '#404040', color: 'white' }} />
                        <Chip label="📚 Write Stories" sx={{ bgcolor: '#404040', color: 'white' }} />
                        <Chip label="🚀 Get Published on Flipkart" sx={{ bgcolor: '#1db954', color: 'white' }} />
                    </Box>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: '#282828', mb: 3 }}>
                    <Tabs
                        value={tabValue}
                        onChange={(e, newValue) => setTabValue(newValue)}
                        sx={{
                            '& .MuiTab-root': { color: '#b3b3b3' },
                            '& .Mui-selected': { color: '#1db954' },
                            '& .MuiTabs-indicator': { bgcolor: '#1db954' }
                        }}
                    >
                        <Tab label="Discover Content" />
                        {isLoggedIn && <Tab label="My Content" />}
                    </Tabs>
                </Box>

                {/* Upload Button */}
                {isLoggedIn && tabValue === 1 && (
                    <Box sx={{ mb: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenUploadDialog(true)}
                            sx={{ bgcolor: '#1db954', '&:hover': { bgcolor: '#1ed760' } }}
                        >
                            Upload New Content
                        </Button>
                    </Box>
                )}

                {/* Content Display */}
                {tabValue === 0 && renderPublicContent()}
                {tabValue === 1 && isLoggedIn && renderMyContent()}
            </Container>

            {/* Upload Dialog */}
            <Dialog
                open={openUploadDialog}
                onClose={() => setOpenUploadDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { bgcolor: '#282828' } }}
            >
                <DialogTitle sx={{ color: 'white' }}>Upload New Content</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Title"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                        margin="normal"
                        sx={{
                            '& .MuiInputLabel-root': { color: '#b3b3b3' },
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: '#404040' }
                            }
                        }}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel sx={{ color: '#b3b3b3' }}>Category</InputLabel>
                        <Select
                            value={uploadForm.category}
                            onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                            sx={{
                                color: 'white',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#404040' }
                            }}
                        >
                            <MenuItem value="quote">Quote</MenuItem>
                            <MenuItem value="poem">Poem</MenuItem>
                            <MenuItem value="short_story">Short Story</MenuItem>
                            <MenuItem value="book_excerpt">Book Excerpt</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Content"
                        value={uploadForm.content_text}
                        onChange={(e) => setUploadForm({ ...uploadForm, content_text: e.target.value })}
                        margin="normal"
                        multiline
                        rows={6}
                        sx={{
                            '& .MuiInputLabel-root': { color: '#b3b3b3' },
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: '#404040' }
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUploadDialog(false)} sx={{ color: '#b3b3b3' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        sx={{ bgcolor: '#1db954', '&:hover': { bgcolor: '#1ed760' } }}
                    >
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Register Dialog */}
            <Dialog
                open={openRegisterDialog}
                onClose={() => setOpenRegisterDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { bgcolor: '#282828' } }}
            >
                <DialogTitle sx={{ color: 'white' }}>Become a Creator</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Name"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        margin="normal"
                        sx={{
                            '& .MuiInputLabel-root': { color: '#b3b3b3' },
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: '#404040' }
                            }
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        margin="normal"
                        sx={{
                            '& .MuiInputLabel-root': { color: '#b3b3b3' },
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: '#404040' }
                            }
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Username"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                        margin="normal"
                        sx={{
                            '& .MuiInputLabel-root': { color: '#b3b3b3' },
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: '#404040' }
                            }
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        margin="normal"
                        sx={{
                            '& .MuiInputLabel-root': { color: '#b3b3b3' },
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: '#404040' }
                            }
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Bio (Optional)"
                        value={registerForm.bio}
                        onChange={(e) => setRegisterForm({ ...registerForm, bio: e.target.value })}
                        margin="normal"
                        multiline
                        rows={3}
                        sx={{
                            '& .MuiInputLabel-root': { color: '#b3b3b3' },
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: '#404040' }
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRegisterDialog(false)} sx={{ color: '#b3b3b3' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRegister}
                        variant="contained"
                        sx={{ bgcolor: '#1db954', '&:hover': { bgcolor: '#1ed760' } }}
                    >
                        Register
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Login Dialog */}
            <Dialog
                open={openLoginDialog}
                onClose={() => setOpenLoginDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { bgcolor: '#282828' } }}
            >
                <DialogTitle sx={{ color: 'white' }}>Creator Login</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        margin="normal"
                        sx={{
                            '& .MuiInputLabel-root': { color: '#b3b3b3' },
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: '#404040' }
                            }
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        margin="normal"
                        sx={{
                            '& .MuiInputLabel-root': { color: '#b3b3b3' },
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: '#404040' }
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLoginDialog(false)} sx={{ color: '#b3b3b3' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleLogin}
                        variant="contained"
                        sx={{ bgcolor: '#1db954', '&:hover': { bgcolor: '#1ed760' } }}
                    >
                        Login
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CreatorPortal;
