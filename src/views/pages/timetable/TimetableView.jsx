import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Grid,
    Divider,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Print as PrintIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import customAxios from '../../../utils/axiosConfig';
import { TIME_TABLE_API_BASE_URL } from '../../../ApiConstants';
import dayjs from 'dayjs';
import { generateTimetablePdf } from '../../../prints/timetablePdfGenerator';
import { schoolData } from '../../../AppConstants';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimetableView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const printRef = useRef();
    const { loggedUser } = useSelector((state) => state.globalState || {});

    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTimetable();
    }, [id]);

    const fetchTimetable = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${TIME_TABLE_API_BASE_URL}/view/${loggedUser?.skid}/${id}`
            );

            if (response.data.code === 200 && response.data.status === 'success') {
                setTimetable(response.data.data);
            } else {
                setError(response.data.message || 'Failed to load timetable');
            }
        } catch (err) {
            console.error('Error fetching timetable:', err);
            setError('Failed to load timetable');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = async () => {
        await generateTimetablePdf(timetable, schoolData, 'print');
    };

    const handleEdit = () => {
        navigate(`/timetable/edit/${id}`, {
            state: {
                timetable: timetable,
                mode: 'edit',
                isDraft: timetable.is_draft
            }
        });
    };

    const renderTimeSlotContent = (day, slot) => {
        if (slot.is_lunch) {
            return (
                <TableCell
                    key={day}
                    align="center"
                    sx={{
                        backgroundColor: 'info.lighter',
                        fontWeight: 'bold',
                        color: 'info.main',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    LUNCH BREAK
                </TableCell>
            );
        }

        const entry = timetable?.entries[`${day}-${slot.time_display}`];

        return (
            <TableCell
                key={day}
                align="center"
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    padding: 2,
                    backgroundColor: entry ? 'background.paper' : 'grey.50'
                }}
            >
                {entry ? (
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="primary">
                            {entry.subject.subject_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            ({entry.subject.subject_code})
                        </Typography>
                        <Divider sx={{ my: 0.5 }} />
                        <Typography variant="body2" fontSize="0.85rem">
                            {entry.teacher.first_name} {entry.teacher.last_name}
                        </Typography>
                        {entry.room && (
                            <Chip
                                label={`Room: ${entry.room}`}
                                size="small"
                                sx={{ mt: 0.5, fontSize: '0.7rem', height: 20 }}
                            />
                        )}
                    </Box>
                ) : (
                    <Typography variant="caption" color="text.disabled">
                        Free Period
                    </Typography>
                )}
            </TableCell>
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/timetable/list')}
                    sx={{ mt: 2 }}
                >
                    Back to List
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/timetable/list')}
                        variant="outlined"
                    >
                        Back
                    </Button>
                    <Typography variant="h4" fontWeight="bold">
                        View Timetable
                    </Typography>
                    {timetable?.is_draft && (
                        <Chip label="DRAFT" color="warning" />
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {timetable?.is_draft && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={handleEdit}
                        >
                            Edit Draft
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                    >
                        Print
                    </Button>
                </Box>
            </Box>

            {/* Timetable Info Card */}
            <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                                Class
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                                {timetable?.class_name}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                                Section
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                                {timetable?.section_name}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                                Academic Year
                            </Typography>
                            <Typography variant="h6">
                                {timetable?.academic_year}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                                Semester
                            </Typography>
                            <Typography variant="h6">
                                Semester {timetable?.semester}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                                Period Duration
                            </Typography>
                            <Typography variant="body2">
                                {timetable?.configuration.period_duration} minutes
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                                School Start Time
                            </Typography>
                            <Typography variant="body2">
                                {timetable?.configuration.school_start_time}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                                Lunch Time
                            </Typography>
                            <Typography variant="body2">
                                {timetable?.configuration.lunch_start_time}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                                Total Periods
                            </Typography>
                            <Typography variant="body2">
                                {timetable?.configuration.total_periods}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Timetable Table */}
            <div ref={printRef}>
                <TableContainer component={Paper} elevation={3}>
                    <Table sx={{ minWidth: 800 }} size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        width: 120,
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    Time / Day
                                </TableCell>
                                {daysOfWeek.map((day) => (
                                    <TableCell
                                        key={day}
                                        align="center"
                                        sx={{
                                            fontWeight: 'bold',
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            border: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        {day}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {timetable?.time_slots.map((slot, index) => (
                                <TableRow key={index}>
                                    <TableCell
                                        sx={{
                                            fontWeight: 'bold',
                                            backgroundColor: 'grey.100',
                                            border: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <Typography variant="body2" fontWeight="bold">
                                            {slot.label}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {slot.time_display}
                                        </Typography>
                                    </TableCell>
                                    {daysOfWeek.map((day) => renderTimeSlotContent(day, slot))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

            {/* Footer Info */}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                    Last Updated: {dayjs(timetable?.updated_at).format('DD MMM YYYY, HH:mm')}
                </Typography>
            </Box>
        </Box>
    );
};

export default TimetableView;