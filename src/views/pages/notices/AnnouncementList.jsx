import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Button, Chip,
    TextField, InputAdornment, Stack, Avatar, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Divider, Badge, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
    IconSearch, IconPlus, IconEye, IconEdit, IconTrash,
    IconCalendar, IconUser, IconAlertCircle, IconCheck
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import customAxios from '../../../utils/axiosConfig';
import MainCard from '../../../ui-component/cards/MainCard';
import Loader from '../../../ui-component/Loader';
import { ANNOUNCEMENT_API_BASE_URL } from '../../../ApiConstants';
import HeaderCard from '../../../ui-component/cards/HeaderCard';
import { announcementTypes, priorities } from '../../../AppConstants';

dayjs.extend(relativeTime);

const AnnouncementList = () => {
    const navigate = useNavigate();
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser,
        academicYear: state.globalState?.academicYear
    }));

    const [loading, setLoading] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filterPriority, setFilterPriority] = useState('ALL');
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    useEffect(() => {
        if (academicYear?.id) {
            fetchAnnouncements();
        }
    }, [academicYear]);

    useEffect(() => {
        applyFilters();
    }, [announcements, searchTerm, filterType, filterPriority]);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${ANNOUNCEMENT_API_BASE_URL}/list/${loggedUser?.skid}`,
                {
                    params: {
                        academic_year_id: academicYear?.id,
                        user_role: loggedUser?.role,
                        school_user_id: loggedUser?.school_user_id
                    }
                }
            );

            if (response.data.code === 200) {
                setAnnouncements(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
            toast.error('Failed to fetch announcements');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...announcements];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(announcement =>
                announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                announcement.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Type filter
        if (filterType !== 'ALL') {
            filtered = filtered.filter(announcement => announcement.announcement_type === filterType);
        }

        // Priority filter
        if (filterPriority !== 'ALL') {
            filtered = filtered.filter(announcement => announcement.priority === filterPriority);
        }

        setFilteredAnnouncements(filtered);
    };

    const handleViewAnnouncement = async (announcement) => {
        setSelectedAnnouncement(announcement);
        setViewDialogOpen(true);
    };

    const handleDeleteAnnouncement = async (announcementId) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;

        try {
            await customAxios.delete(
                `${ANNOUNCEMENT_API_BASE_URL}/delete/${loggedUser?.skid}/${announcementId}`
            );
            toast.success('Announcement deleted successfully');
            fetchAnnouncements();
        } catch (error) {
            console.error('Error deleting announcement:', error);
            toast.error('Failed to delete announcement');
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            LOW: 'default',
            NORMAL: 'primary',
            HIGH: 'warning',
            URGENT: 'error'
        };
        return colors[priority] || 'default';
    };

    const getTypeIcon = (type) => {
        const icons = {
            GENERAL: '📢',
            ACADEMIC: '📚',
            EXAMINATION: '📝',
            EVENT: '🎉',
            HOLIDAY: '🏖️',
            URGENT: '🚨',
            FEE: '💰',
            SPORTS: '⚽'
        };
        return icons[type] || '📢';
    };

    const canManageAnnouncements = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'].includes(loggedUser?.role);

    const unreadCount = announcements.filter(n => !n.is_read).length;

    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: 'Announcements', to: '/announcements/list' },
    ];

    return (
        <Box>
            {/* Header */}
            <HeaderCard
                heading={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        Announcements & Notices
                        {unreadCount > 0 && (
                            <Badge badgeContent={unreadCount} color="error" />
                        )}
                    </Box>
                }
                breadcrumbLinks={breadcrumbLinks}
                buttonColor={'primary'}
                buttonvariant={'contained'}
                buttonText=" Create Announcement"
                onButtonClick={() => navigate('/announcements/create')}
                buttonIcon={<IconPlus size={20} />}
            />

            {/* Filters */}
            <MainCard sx={{ mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item size={{ xs: 12, md: 6 }} >
                        <TextField
                            fullWidth
                            placeholder="Search announcements..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconSearch size={20} />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} size={{ xs: 6, md: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                label="Type"
                            >
                                <MenuItem value="ALL">All Types</MenuItem>
                                {announcementTypes.map(type => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} size={{ xs: 6, md: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                label="Priority"
                            >
                                <MenuItem value="ALL">All Priorities</MenuItem>
                                {priorities.map(type => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <br />
                {/* Announcement Cards */}
                {loading ? (
                    <Loader loading={loading} />
                ) : filteredAnnouncements.length === 0 ? (
                    <Card sx={{ textAlign: 'center', py: 6 }}>
                        <CardContent>
                            <IconAlertCircle size={48} style={{ opacity: 0.5 }} />
                            <Typography variant="h5" sx={{ mt: 2 }}>
                                No announcements found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {searchTerm || filterType !== 'ALL' || filterPriority !== 'ALL'
                                    ? 'Try adjusting your filters'
                                    : 'No announcements have been posted yet'}
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <Grid container spacing={2}>
                        {filteredAnnouncements.map((announcement) => (
                            <Grid item xs={12} key={announcement.id}>
                                <Card
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        border: !announcement.is_read ? '2px solid' : '1px solid',
                                        borderColor: !announcement.is_read ? 'primary.main' : 'divider',
                                        bgcolor: !announcement.is_read ? 'primary.lighter' : 'background.paper',
                                        '&:hover': {
                                            boxShadow: 6,
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                    onClick={() => handleViewAnnouncement(announcement)}
                                >
                                    <CardContent>
                                        <Stack direction="row" spacing={2} alignItems="flex-start">
                                            {/* Icon */}
                                            <Avatar
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    fontSize: '2rem',
                                                    bgcolor: !announcement.is_read ? 'primary.main' : 'action.selected'
                                                }}
                                            >
                                                {getTypeIcon(announcement.announcement_type)}
                                            </Avatar>

                                            {/* Content */}
                                            <Box sx={{ flex: 1 }}>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                    <Typography variant="h4" sx={{ flex: 1 }}>
                                                        {announcement.title}
                                                        {!announcement.is_read && (
                                                            <Chip
                                                                label="NEW"
                                                                color="primary"
                                                                size="small"
                                                                sx={{ ml: 1 }}
                                                            />
                                                        )}
                                                    </Typography>
                                                    <Chip
                                                        label={announcement.priority}
                                                        color={getPriorityColor(announcement.priority)}
                                                        size="small"
                                                    />
                                                </Stack>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        mb: 2,
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {announcement.description}
                                                </Typography>

                                                <Stack direction="row" spacing={2} flexWrap="wrap">
                                                    <Chip
                                                        icon={<IconCalendar size={16} />}
                                                        label={dayjs(announcement.created_at).fromNow()}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Chip
                                                        icon={<IconUser size={16} />}
                                                        label={announcement.creator_name}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Chip
                                                        label={announcement.announcement_type}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    {announcement.read_count > 0 && (
                                                        <Chip
                                                            icon={<IconEye size={16} />}
                                                            label={`${announcement.read_count} views`}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Stack>
                                            </Box>

                                            {/* Actions */}
                                            {canManageAnnouncements && (
                                                <Stack direction="row" spacing={1}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/announcements/edit/${announcement.id}`);
                                                        }}
                                                    >
                                                        <IconEdit size={20} />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteAnnouncement(announcement.id);
                                                        }}
                                                    >
                                                        <IconTrash size={20} />
                                                    </IconButton>
                                                </Stack>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </MainCard>

            {/* View Announcement Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedAnnouncement && (
                    <>
                        <DialogTitle>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                                    {getTypeIcon(selectedAnnouncement.announcement_type)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h4">{selectedAnnouncement.title}</Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                        <Chip
                                            label={selectedAnnouncement.priority}
                                            color={getPriorityColor(selectedAnnouncement.priority)}
                                            size="small"
                                        />
                                        <Chip
                                            label={selectedAnnouncement.announcement_type}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Stack>
                                </Box>
                                {selectedAnnouncement.is_read && (
                                    <Chip
                                        icon={<IconCheck size={16} />}
                                        label="Read"
                                        color="success"
                                        size="small"
                                    />
                                )}
                            </Stack>
                        </DialogTitle>
                        <Divider />
                        <DialogContent>
                            <Stack spacing={3}>
                                {/* Metadata */}
                                <Stack direction="row" spacing={2} flexWrap="wrap">
                                    <Chip
                                        icon={<IconUser size={16} />}
                                        label={`Posted by ${selectedAnnouncement.creator_name}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                    <Chip
                                        icon={<IconCalendar size={16} />}
                                        label={dayjs(selectedAnnouncement.created_at).format('MMM DD, YYYY hh:mm A')}
                                        size="small"
                                        variant="outlined"
                                    />
                                    {selectedAnnouncement.expiry_date && (
                                        <Chip
                                            label={`Expires: ${dayjs(selectedAnnouncement.expiry_date).format('MMM DD, YYYY')}`}
                                            size="small"
                                            variant="outlined"
                                            color="warning"
                                        />
                                    )}
                                </Stack>

                                {/* Description */}
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        Description
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
                                    >
                                        {selectedAnnouncement.description}
                                    </Typography>
                                </Box>

                                {/* Target Audience */}
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        Target Audience
                                    </Typography>
                                    <Chip
                                        label={selectedAnnouncement.target_audience}
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Box>
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setViewDialogOpen(false)}>
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default AnnouncementList;
