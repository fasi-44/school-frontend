import React, { useState, useEffect } from 'react';
import {
    Grid, Card, CardContent, Typography, Box, Chip, Stack, Divider,
    List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton
} from '@mui/material';
import {
    IconUsers, IconSchool, IconUsersGroup, IconUser, IconRefresh, IconBell, IconAlertCircle
} from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import customAxios from '../../utils/axiosConfig';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import MainCard from '../../ui-component/cards/MainCard';
import Loader from '../../ui-component/Loader';
import StatsCard from '../../ui-component/cards/StatsCard';
import { ANNOUNCEMENT_API_BASE_URL, SCHOOL_ADMIN_DASHBOARD } from '../../ApiConstants';
import HeaderCard from '../../ui-component/cards/HeaderCard';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const SchoolAdminDashboard = () => {
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser,
        academicYear: state.globalState?.academicYear
    }));

    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        if (academicYear?.id) {
            fetchDashboardData();
            fetchAnnouncements();
        }
    }, [academicYear]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${SCHOOL_ADMIN_DASHBOARD}/stats/${loggedUser?.skid}`,
                {
                    params: {
                        academic_year_id: academicYear?.id
                    }
                }
            );

            if (response.data.code === 200) {
                setStats(response.data.data.stats);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnnouncements = async () => {
        try {
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
                setAnnouncements(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
            toast.error('Failed to load announcements');
        }
    };

    const handleRefresh = () => {
        fetchDashboardData();
        fetchAnnouncements();
    };

    if (loading || !stats) {
        return <Loader />;
    }

    // Gender Distribution Chart Data
    const genderChartData = {
        labels: ['Male', 'Female'],
        datasets: [
            {
                data: [stats.male_students, stats.female_students],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 2
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = stats.students_count;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH':
                return 'error';
            case 'MEDIUM':
                return 'warning';
            default:
                return 'info';
        }
    };

    return (
        <Box>
            {/* Header */}
            <HeaderCard
                heading={
                    <Box>
                        <Typography variant="h2" gutterBottom color='white'>
                            Hello School Admin, Welcome back !
                        </Typography>
                        <Typography variant="body2" color="white">
                            Academic Year: {academicYear?.year_name}
                        </Typography>
                    </Box>
                }
                breadcrumbLinks={false}
            />
            {/* Stats Cards */}
            <Grid container spacing={3}>
                <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }} >
                    <StatsCard
                        title="Total Students"
                        value={stats.students_count}
                        icon={IconSchool}
                        iconColor="#1976d2"
                        bgColor="#5E35B1"
                    />
                </Grid>

                <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }} >
                    <StatsCard
                        title="Total Teachers"
                        value={stats.teachers_count}
                        icon={IconUsersGroup}
                        iconColor="#2e7d32"
                        bgColor="#1E88E5"
                    />
                </Grid>

                <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }} >
                    <StatsCard
                        title="Total Parents"
                        value={stats.parents_count}
                        icon={IconUsers}
                        iconColor="#ed6c02"
                        bgColor="#43A047"
                    />
                </Grid>

                <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }} >
                    <StatsCard
                        title="Overall Users"
                        value={stats.overall_users_count}
                        icon={IconUser}
                        iconColor="#9c27b0"
                        bgColor="#FB8C00"
                    />
                </Grid>

                {/* Gender Distribution Chart */}
                <Grid item size={{ xl: 4, lg: 4, md: 6, sm: 12, xs: 12, }}>
                    <MainCard title="Students by Gender">
                        <Box sx={{ height: 300, position: 'relative' }}>
                            <Doughnut data={genderChartData} options={chartOptions} />
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="primary">
                                        {stats.male_students}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Male Students
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="secondary">
                                        {stats.female_students}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Female Students
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </MainCard>
                </Grid>

                {/* Announcements Card */}
                <Grid item size={{ xl: 8, lg: 8, md: 6, sm: 12, xs: 12, }}>
                    <MainCard
                        title={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconBell size={20} />
                                <Typography variant="h4">Recent Announcements</Typography>
                            </Box>
                        }
                    >
                        {announcements.length === 0 ? (
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    py: 4,
                                    color: 'text.secondary'
                                }}
                            >
                                <IconAlertCircle size={48} style={{ opacity: 0.5 }} />
                                <Typography variant="body1" sx={{ mt: 2 }}>
                                    No announcements available
                                </Typography>
                            </Box>
                        ) : (
                            <List sx={{ maxHeight: 380, overflow: 'auto' }}>
                                {announcements.map((announcement, index) => (
                                    <React.Fragment key={announcement.id}>
                                        <ListItem alignItems="flex-start">
                                            <ListItemAvatar>
                                                <Avatar
                                                    sx={{
                                                        color: 'white',
                                                        bgcolor: announcement.priority === 'HIGH'
                                                            ? 'error.main'
                                                            : 'primary.main'
                                                    }}
                                                >
                                                    <IconBell size={20} />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        mb: 0.5
                                                    }}>
                                                        <Typography variant="subtitle1" fontWeight={600}>
                                                            {announcement.title}
                                                        </Typography>
                                                        <Chip
                                                            label={announcement.priority}
                                                            size="small"
                                                            color={getPriorityColor(announcement.priority)}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="text.primary"
                                                            sx={{ display: 'block', mb: 1 }}
                                                        >
                                                            {announcement.description}
                                                        </Typography>
                                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                                            <Chip
                                                                label={announcement.announcement_type}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                            <Typography variant="caption" color="text.secondary">
                                                                By: {announcement.creator_name}
                                                            </Typography>
                                                        </Stack>
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItem>
                                        {index < announcements.length - 1 && <Divider variant="inset" component="li" />}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </MainCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SchoolAdminDashboard;
