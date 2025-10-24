import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Paper, Tab, Tabs, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Alert } from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`admin-tabpanel-${index}`}
            aria-labelledby={`admin-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function Admin() {
    const [tabValue, setTabValue] = useState(0);
    const [pendingContent, setPendingContent] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const token = localStorage.getItem('admin_token');

    const axiosConfig = {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    const fetchPendingContent = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/pending-content`, axiosConfig);
            setPendingContent(response.data);
        } catch (err) {
            setError('Failed to fetch pending content: ' + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchDashboardStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard/stats`, axiosConfig);
            setDashboardStats(response.data);
        } catch (err) {
            setError('Failed to fetch dashboard stats: ' + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!token) {
            window.location.href = '/admin-login';
            return;
        }

        if (tabValue === 0) {
            fetchPendingContent();
        } else if (tabValue === 1) {
            fetchDashboardStats();
        }
    }, [tabValue, token, fetchPendingContent, fetchDashboardStats]);

    const handleReviewContent = async (contentId, action, comment = '') => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await axios.post(
                `${API_BASE_URL}/api/admin/review-content`,
                {
                    content_id: contentId,
                    action: action,
                    admin_comment: comment
                },
                axiosConfig
            );
            setSuccess(`Content ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
            fetchPendingContent(); // Refresh the list
        } catch (err) {
            setError('Failed to review content: ' + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h3" gutterBottom>
                Admin Dashboard
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
                    <Tab label="Content Moderation" />
                    <Tab label="Dashboard" />
                    <Tab label="Flipkart Requests" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <Typography variant="h5" gutterBottom>
                        Pending Content Review
                    </Typography>
                    {loading ? (
                        <Typography>Loading...</Typography>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Creator</TableCell>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Content</TableCell>
                                        <TableCell>Created</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingContent.map((content) => (
                                        <TableRow key={content.id}>
                                            <TableCell>{content.id}</TableCell>
                                            <TableCell>{content.creator_username || 'N/A'}</TableCell>
                                            <TableCell>{content.title}</TableCell>
                                            <TableCell>
                                                <Chip label={content.category} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                {content.content_text?.substring(0, 100)}
                                                {content.content_text?.length > 100 ? '...' : ''}
                                            </TableCell>
                                            <TableCell>{new Date(content.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        onClick={() => handleReviewContent(content.id, 'approve')}
                                                        disabled={loading}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => {
                                                            const comment = prompt('Enter rejection reason:');
                                                            if (comment) handleReviewContent(content.id, 'reject', comment);
                                                        }}
                                                        disabled={loading}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {pendingContent.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                No pending content to review
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h5" gutterBottom>
                        Dashboard Statistics
                    </Typography>
                    {loading ? (
                        <Typography>Loading...</Typography>
                    ) : dashboardStats ? (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6">Total Creators</Typography>
                                <Typography variant="h4">{dashboardStats.total_creators}</Typography>
                            </Paper>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6">Total Content</Typography>
                                <Typography variant="h4">{dashboardStats.total_content}</Typography>
                            </Paper>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6">Pending Review</Typography>
                                <Typography variant="h4">{dashboardStats.pending_content}</Typography>
                            </Paper>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6">Approved Content</Typography>
                                <Typography variant="h4">{dashboardStats.approved_content}</Typography>
                            </Paper>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6">Rejected Content</Typography>
                                <Typography variant="h4">{dashboardStats.rejected_content}</Typography>
                            </Paper>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6">Publish Requests</Typography>
                                <Typography variant="h4">{dashboardStats.publish_requests}</Typography>
                            </Paper>
                        </Box>
                    ) : (
                        <Typography>No stats available</Typography>
                    )}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <Typography variant="h5" gutterBottom>
                        Flipkart Publishing Requests
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Flipkart publishing integration coming soon...
                    </Typography>
                </TabPanel>
            </Paper>
        </Container>
    );
}
