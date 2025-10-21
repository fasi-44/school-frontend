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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    IconButton,
    Snackbar,
    Tooltip,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    SaveAlt as DraftIcon,
    CheckCircle as ValidateIcon,
} from '@mui/icons-material';
import customAxios from '../../../utils/axiosConfig';
import {
    TIME_TABLE_API_BASE_URL,
    SUBJECTS_API_BASE_URL,
    TEACHERS_API_BASE_URL
} from '../../../ApiConstants';
import dayjs from 'dayjs';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimetableEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { loggedUser } = useSelector((state) => state.globalState || {});

    // State
    const [timetable, setTimetable] = useState(null);
    const [timetableEntries, setTimetableEntries] = useState({});
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [validationResult, setValidationResult] = useState(null);

    // Dialog states
    const [entryDialog, setEntryDialog] = useState({
        open: false,
        day: '',
        timeSlot: '',
        isEditing: false
    });
    const [currentEntry, setCurrentEntry] = useState({
        subject: null,
        teacher: '',
        room: '',
        type: 'Regular'
    });
    const [conflictDialog, setConflictDialog] = useState({
        open: false,
        conflicts: [],
        conflictCount: 0
    });

    useEffect(() => {
        fetchTimetable();
        fetchTeachers();
    }, [id]);

    useEffect(() => {
        if (timetable?.class_id && timetable?.section_id) {
            fetchSectionSubjects(timetable.section_id);
        }
    }, [timetable?.class_id, timetable?.section_id]);

    const fetchTimetable = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${TIME_TABLE_API_BASE_URL}/view/${loggedUser?.skid}/${id}`
            );

            if (response.data.code === 200 && response.data.status === 'success') {
                const data = response.data.data;
                setTimetable(data);

                // Transform entries to the format needed for editing
                const transformedEntries = {};
                Object.entries(data.entries).forEach(([key, entry]) => {
                    transformedEntries[key] = {
                        subject: {
                            id: entry.subject.id,
                            subject_name: entry.subject.subject_name,
                            subject_code: entry.subject.subject_code
                        },
                        teacher: {
                            id: entry.teacher.id,
                            first_name: entry.teacher.first_name,
                            last_name: entry.teacher.last_name
                        },
                        room: entry.room,
                        type: entry.type
                    };
                });
                setTimetableEntries(transformedEntries);
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

    const fetchSectionSubjects = async (sectionId) => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${SUBJECTS_API_BASE_URL}/section/${loggedUser?.skid}/${sectionId}`
            );

            if (response.data.code === 200) {
                setSubjects(response.data.data || []);
            } else {
                toast.error('Failed to fetch subjects');
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            toast.error('Failed to fetch subjects');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await customAxios.get(
                `${TEACHERS_API_BASE_URL}/list/${loggedUser?.skid}`
            );
            if (response.data.code === 200 && response.data.status === 'success') {
                setTeachers(response.data.teachers || []);
            }
        } catch (err) {
            console.error('Error fetching teachers:', err);
        }
    };

    const handleOpenDialog = (day, slot) => {
        if (slot.is_lunch) return;

        const key = `${day}-${slot.time_display}`;
        const existingEntry = timetableEntries[key];

        if (existingEntry) {
            // Edit mode
            setCurrentEntry({
                subject: existingEntry.subject,
                teacher: existingEntry.teacher.id,
                room: existingEntry.room || '',
                type: existingEntry.type || 'Regular'
            });
            setEntryDialog({
                open: true,
                day,
                timeSlot: slot.time_display,
                isEditing: true
            });
        } else {
            // Add mode
            setCurrentEntry({
                subject: null,
                teacher: '',
                room: '',
                type: 'Regular'
            });
            setEntryDialog({
                open: true,
                day,
                timeSlot: slot.time_display,
                isEditing: false
            });
        }
    };

    const handleCloseDialog = () => {
        setEntryDialog({ open: false, day: '', timeSlot: '', isEditing: false });
        setCurrentEntry({ subject: null, teacher: '', room: '', type: 'Regular' });
    };

    const handleSaveEntry = async () => {
        if (!currentEntry.subject || !currentEntry.teacher) {
            showSnackbar('Please select both subject and teacher', 'error');
            return;
        }

        // Check for conflicts
        const timeSlot = entryDialog.timeSlot;
        if (timeSlot.includes(' - ')) {
            const [startTime, endTime] = timeSlot.split(' - ');
            const conflictResult = await checkTeacherConflict(
                currentEntry.teacher,
                entryDialog.day,
                startTime,
                endTime
            );

            if (conflictResult.has_conflict) {
                setConflictDialog({
                    open: true,
                    conflicts: conflictResult.conflicts,
                    conflictCount: conflictResult.conflict_count
                });
                return;
            }
        }

        const teacherData = teachers.find(t => t.id === parseInt(currentEntry.teacher));
        const key = `${entryDialog.day}-${entryDialog.timeSlot}`;

        setTimetableEntries(prev => ({
            ...prev,
            [key]: {
                subject: currentEntry.subject,
                teacher: teacherData,
                room: currentEntry.room,
                type: currentEntry.type,
            }
        }));

        handleCloseDialog();
        showSnackbar('Entry saved successfully', 'success');
    };

    const handleDeleteEntry = () => {
        const key = `${entryDialog.day}-${entryDialog.timeSlot}`;
        setTimetableEntries(prev => {
            const newEntries = { ...prev };
            delete newEntries[key];
            return newEntries;
        });
        handleCloseDialog();
        showSnackbar('Entry deleted successfully', 'success');
    };

    const checkTeacherConflict = async (teacherId, day, startTime, endTime) => {
        try {
            const response = await customAxios.post(
                `${TIME_TABLE_API_BASE_URL}/check-teacher-conflict`,
                {
                    skid: loggedUser.skid,
                    teacher_id: teacherId,
                    day: day,
                    start_time: startTime,
                    end_time: endTime,
                    academic_year: timetable.academic_year,
                    semester: timetable.semester,
                    exclude_timetable_id: timetable.id
                }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error checking conflict:', error);
            return { has_conflict: false, conflicts: [] };
        }
    };

    const handleValidate = async () => {
        try {
            setLoading(true);
            const transformedEntries = {};
            Object.entries(timetableEntries).forEach(([key, entry]) => {
                transformedEntries[key] = {
                    subject_id: entry.subject.id,
                    teacher_id: entry.teacher.id,
                    room: entry.room,
                    type: entry.type,
                };
            });

            const response = await customAxios.post(
                `${TIME_TABLE_API_BASE_URL}/validate-conflicts`,
                {
                    skid: loggedUser.skid,
                    academic_year: timetable.academic_year,
                    semester: timetable.semester,
                    entries: transformedEntries,
                    exclude_timetable_id: timetable.id
                }
            );

            if (response.data.code === 200 && response.data.status === 'success') {
                setValidationResult(response.data.data);
                if (response.data.data.is_valid) {
                    showSnackbar('No conflicts found!', 'success');
                } else {
                    showSnackbar('Conflicts detected', 'warning');
                }
            }
        } catch (err) {
            console.error('Error validating:', err);
            showSnackbar('Validation failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTimetable = async (saveAsDraft = false) => {
        try {
            if (saveAsDraft) {
                setSavingDraft(true);
            } else {
                setSaving(true);
            }

            const transformedEntries = {};
            Object.entries(timetableEntries).forEach(([key, entry]) => {
                transformedEntries[key] = {
                    subject: entry.subject,
                    teacher: entry.teacher,
                    teacher_id: entry.teacher.id,
                    room: entry.room,
                    type: entry.type,
                };
            });

            const timetableData = {
                skid: loggedUser.skid,
                class_id: timetable.class_id,
                section_id: timetable.section_id,
                academic_year: timetable.academic_year,
                semester: timetable.semester,
                period_duration: timetable.configuration.period_duration,
                school_start_time: timetable.configuration.school_start_time,
                lunch_start_time: timetable.configuration.lunch_start_time,
                lunch_duration: timetable.configuration.lunch_duration,
                total_periods: timetable.configuration.total_periods,
                entries: transformedEntries,
            };

            const endpoint = saveAsDraft
                ? `${TIME_TABLE_API_BASE_URL}/save-draft`
                : `${TIME_TABLE_API_BASE_URL}/create`;

            const response = await customAxios.post(endpoint, timetableData);

            if (response.data.code === 201 && response.data.status === 'success') {
                showSnackbar(response.data.message, 'success');
                setTimeout(() => {
                    navigate('/timetable/list');
                }, 1500);
            } else {
                showSnackbar(response.data.message || 'Error saving timetable', 'error');
            }
        } catch (error) {
            console.error('Error saving timetable:', error);
            showSnackbar('Error saving timetable', 'error');
        } finally {
            setSaving(false);
            setSavingDraft(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
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

        const key = `${day}-${slot.time_display}`;
        const entry = timetableEntries[key];

        return (
            <TableCell
                key={day}
                align="center"
                onClick={() => handleOpenDialog(day, slot)}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    padding: 1,
                    cursor: 'pointer',
                    backgroundColor: entry ? 'background.paper' : 'grey.50',
                    '&:hover': {
                        backgroundColor: entry ? 'action.hover' : 'action.selected',
                    },
                    position: 'relative'
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
                        <Typography variant="body2" fontSize="0.85rem" sx={{ mt: 0.5 }}>
                            {entry.teacher.first_name} {entry.teacher.last_name}
                        </Typography>
                        {entry.room && (
                            <Chip
                                label={`Room: ${entry.room}`}
                                size="small"
                                sx={{ mt: 0.5, fontSize: '0.7rem', height: 20 }}
                            />
                        )}
                        <IconButton
                            size="small"
                            sx={{ position: 'absolute', top: 4, right: 4 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(day, slot);
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ) : (
                    <Box sx={{ py: 2 }}>
                        <AddIcon color="action" />
                        <Typography variant="caption" color="text.secondary" display="block">
                            Click to add
                        </Typography>
                    </Box>
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
                        Edit Timetable
                    </Typography>
                    {timetable?.is_draft && (
                        <Chip label="DRAFT" color="warning" />
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<ValidateIcon />}
                        onClick={handleValidate}
                        disabled={Object.keys(timetableEntries).length === 0}
                    >
                        Validate
                    </Button>
                    <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<DraftIcon />}
                        onClick={() => handleSaveTimetable(true)}
                        disabled={savingDraft}
                    >
                        {savingDraft ? 'Saving...' : 'Save as Draft'}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={() => handleSaveTimetable(false)}
                        disabled={saving || (validationResult && !validationResult.is_valid)}
                    >
                        {saving ? 'Saving...' : 'Save Final'}
                    </Button>
                </Box>
            </Box>

            {/* Validation Alert */}
            {validationResult && (
                <Alert
                    severity={validationResult.is_valid ? 'success' : 'error'}
                    sx={{ mb: 2 }}
                >
                    {validationResult.is_valid
                        ? '✓ No conflicts found! Timetable is ready to save.'
                        : `✗ ${validationResult.validation_message || 'Validation failed'}`}
                </Alert>
            )}

            {/* Timetable Info */}
            <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="caption" color="text.secondary">Class</Typography>
                            <Typography variant="h6" fontWeight="bold">{timetable?.class_name}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="caption" color="text.secondary">Section</Typography>
                            <Typography variant="h6" fontWeight="bold">{timetable?.section_name}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="caption" color="text.secondary">Academic Year</Typography>
                            <Typography variant="h6">{timetable?.academic_year}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="caption" color="text.secondary">Semester</Typography>
                            <Typography variant="h6">Semester {timetable?.semester}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Timetable Grid */}
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

            {/* Entry Dialog */}
            <Dialog open={entryDialog.open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {entryDialog.isEditing ? 'Edit Time Slot' : 'Add Subject to Time Slot'}
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">Time Slot Details</Typography>
                        <Typography variant="h6">
                            {entryDialog.day} - {entryDialog.timeSlot}
                        </Typography>
                    </Box>

                    <Autocomplete
                        options={subjects}
                        getOptionLabel={(option) => `${option.subject_name} (${option.subject_code})`}
                        value={currentEntry.subject}
                        onChange={(event, newValue) => {
                            setCurrentEntry({ ...currentEntry, subject: newValue, teacher: '' });
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Select Subject *" variant="outlined" required />
                        )}
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth sx={{ mb: 2 }} disabled={!currentEntry.subject}>
                        <InputLabel>Teacher *</InputLabel>
                        <Select
                            value={currentEntry.teacher}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, teacher: e.target.value })}
                            label="Teacher *"
                            required
                        >
                            {teachers.map((teacher) => (
                                <MenuItem key={teacher.id} value={teacher.id}>
                                    {teacher.first_name} {teacher.last_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Room Number"
                        value={currentEntry.room}
                        onChange={(e) => setCurrentEntry({ ...currentEntry, room: e.target.value })}
                        fullWidth
                        variant="outlined"
                        placeholder="e.g., 101, Lab-A"
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth>
                        <InputLabel>Class Type</InputLabel>
                        <Select
                            value={currentEntry.type}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, type: e.target.value })}
                            label="Class Type"
                        >
                            <MenuItem value="Regular">Regular</MenuItem>
                            <MenuItem value="Lab">Lab</MenuItem>
                            <MenuItem value="Tutorial">Tutorial</MenuItem>
                            <MenuItem value="Practical">Practical</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2, backgroundColor: 'grey.50' }}>
                    {entryDialog.isEditing && (
                        <Button
                            onClick={handleDeleteEntry}
                            color="error"
                            startIcon={<DeleteIcon />}
                            sx={{ textTransform: 'none', mr: 'auto' }}
                        >
                            Delete
                        </Button>
                    )}
                    <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveEntry}
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        sx={{ textTransform: 'none' }}
                        disabled={!currentEntry.subject || !currentEntry.teacher}
                    >
                        {entryDialog.isEditing ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Conflict Dialog */}
            <Dialog
                open={conflictDialog.open}
                onClose={() => setConflictDialog({ open: false, conflicts: [], conflictCount: 0 })}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ backgroundColor: 'error.main', color: 'white' }}>
                    Teacher Scheduling Conflict Detected
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body1" fontWeight="bold">
                            {conflictDialog.conflictCount} conflict{conflictDialog.conflictCount > 1 ? 's' : ''} found!
                        </Typography>
                        <Typography variant="body2">
                            The selected teacher is already scheduled during this time slot.
                        </Typography>
                    </Alert>
                    {conflictDialog.conflicts.map((conflict, index) => (
                        <Paper key={index} elevation={2} sx={{ p: 2, mb: 2, border: '2px solid', borderColor: 'error.light' }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="error">
                                Conflict #{index + 1}
                            </Typography>
                            <Grid container spacing={1} sx={{ mt: 1 }}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Teacher</Typography>
                                    <Typography variant="body2" fontWeight="bold">{conflict.teacher_name}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Time</Typography>
                                    <Typography variant="body2">{conflict.day}, {conflict.start_time} - {conflict.end_time}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Class</Typography>
                                    <Typography variant="body2">{conflict.class_name} - {conflict.section_name}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Subject</Typography>
                                    <Typography variant="body2">{conflict.subject_name}</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setConflictDialog({ open: false, conflicts: [], conflictCount: 0 })}
                        variant="contained"
                        color="primary"
                    >
                        Choose Different Teacher
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TimetableEdit;
