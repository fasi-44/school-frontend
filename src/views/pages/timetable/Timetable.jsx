import React, { useEffect, useState } from "react";
import {
    Box, Card, CardContent, TextField, Button, Typography, FormControl, InputLabel,
    Select, MenuItem, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, Alert, Autocomplete, styled, useTheme,
    Grid, Stack, OutlinedInput, CircularProgress, Snackbar, Stepper, Step, StepLabel, ButtonGroup, Divider,
} from "@mui/material";
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Schedule as ScheduleIcon,
    Class as ClassIcon,
    School as SchoolIcon,
    Add as AddIcon,
    Visibility as VisibilityIcon,
    Settings as SettingsIcon,
    PlayArrow as GenerateIcon,
    CheckCircle as ValidateIcon,
    Save as SaveIcon,
    SaveAlt as DraftIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import MainCard from "../../../ui-component/cards/MainCard";
import customAxios from "../../../utils/axiosConfig";
import { CLASSES_API_BASE_URL, SUBJECTS_API_BASE_URL, TEACHERS_API_BASE_URL, TIME_TABLE_API_BASE_URL } from "../../../ApiConstants";
import { useNavigate } from "react-router";

const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
}));

const ClickableCell = styled(TableCell)(({ theme, isEmpty }) => ({
    padding: theme.spacing(1),
    textAlign: "center",
    cursor: isEmpty ? "pointer" : "default",
    transition: "all 0.3s ease",
    position: "relative",
    "&:hover": isEmpty ? {
        backgroundColor: theme.palette.action.hover,
        transform: "scale(1.02)",
    } : {},
}));

const TimeSlotCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    border: `2px solid ${theme.palette.primary.main}`,
    transition: "all 0.3s ease",
    minHeight: "80px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    "&:hover": {
        borderColor: "red",
        boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
    },
}));

const EmptySlot = styled(Box)(({ theme }) => ({
    height: 80,
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.text.secondary,
    transition: "all 0.3s ease",
    "&:hover": {
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.primary.main,
    },
}));

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const steps = ['Configuration', 'Generate Time Slots', 'Create Timetable', 'Validate & Save'];

export default function Timetable() {
    const theme = useTheme();
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const navigate = useNavigate();

    // Stepper state
    const [activeStep, setActiveStep] = useState(0);

    // Basic configuration states
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [academicYear, setAcademicYear] = useState("2024-25");
    const [semester, setSemester] = useState("1");
    const [periodDuration, setPeriodDuration] = useState(45);
    const [schoolStartTime, setSchoolStartTime] = useState("09:00");
    const [lunchStartTime, setLunchStartTime] = useState("12:30");
    const [lunchDuration, setLunchDuration] = useState(30);
    const [totalPeriods, setTotalPeriods] = useState(7);

    // Data states
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState({});
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);

    // Timetable states
    const [timetableEntries, setTimetableEntries] = useState({});
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState({ day: "", timeSlot: "" });
    const [currentEntry, setCurrentEntry] = useState({
        subject: null,
        teacher: "",
        room: "",
        type: "Regular",
    });
    const [conflictDialog, setConflictDialog] = useState({
        open: false,
        conflicts: [],
        conflictCount: 0
    });

    // UI states
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [validating, setValidating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [mode, setMode] = useState('create'); // 'create' or 'view'
    const [existingTimetable, setExistingTimetable] = useState(null);
    const [isDraft, setIsDraft] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [validationResult, setValidationResult] = useState(null);

    // Load initial data
    useEffect(() => {
        if (loggedUser?.skid) {
            fetchClasses();
            fetchTeachers();
        }
    }, [loggedUser?.skid]);

    // Fetch sections when class changes
    useEffect(() => {
        if (selectedClass && loggedUser?.skid) {
            fetchSections();
        }
    }, [selectedClass]);

    // Check for existing timetable when class/section/year/semester changes
    // useEffect(() => {
    //     if (selectedClass && selectedSection && academicYear && semester) {
    //         checkExistingTimetable();
    //     }
    // }, [selectedClass, selectedSection, academicYear, semester]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(CLASSES_API_BASE_URL + '/list/' + loggedUser?.skid);
            if (response.data.code === 200 && response.data.status === 'success') {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            showSnackbar('Error fetching classes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchSections = async () => {
        try {
            const response = await customAxios.get(CLASSES_API_BASE_URL + '/sections/' + loggedUser?.skid + '/' + selectedClass);
            if (response.data.code === 200 && response.data.status === 'success') {
                setSections(prev => ({
                    ...prev,
                    [selectedClass]: response.data.data || []
                }));
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
            showSnackbar('Error fetching sections', 'error');
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await customAxios.get(TEACHERS_API_BASE_URL + '/list/' + loggedUser?.skid);
            if (response.data.code === 200 && response.data.status === 'success') {
                setTeachers(response.data.teachers || []);
            } else {
                setTeachers([]);
            }
        } catch (error) {
            console.error("Error fetching teachers:", error);
            showSnackbar("Error fetching teachers", 'error');
            setTeachers([]);
        }
    };

    const fetchSubjectsForClass = async () => {
        try {
            const resp = await customAxios.get(SUBJECTS_API_BASE_URL + "/list/" + loggedUser?.skid + '/' + selectedClass);
            if (resp.data.code === 200) {
                setSubjects(resp.data.data || []);
            }
        } catch (e) {
            console.error("Error fetching subjects", e);
            showSnackbar("Error fetching subjects", 'error');
        }
    };

    const generateTimeSlots = async () => {
        try {
            setGenerating(true);
            const response = await customAxios.post(TIME_TABLE_API_BASE_URL + '/generate/time-slots', {
                school_start_time: schoolStartTime,
                lunch_start_time: lunchStartTime,
                lunch_duration: lunchDuration,
                period_duration: periodDuration,
                total_periods: totalPeriods
            });

            if (response.data.code === 200 && response.data.status === 'success') {
                setTimeSlots(response.data.data || []);
                setActiveStep(2);
                fetchSubjectsForClass()
                showSnackbar('Time slots generated successfully', 'success');
            }
        } catch (error) {
            console.error('Error generating time slots:', error);
            showSnackbar('Error generating time slots', 'error');
        } finally {
            setGenerating(false);
        }
    };

    const checkTeacherConflict = async (teacherId, day, startTime, endTime) => {
        try {
            const conflictData = {
                skid: loggedUser.skid,
                teacher_id: teacherId,
                day: day,
                start_time: startTime,
                end_time: endTime,
                academic_year: academicYear,
                semester: semester,
                exclude_timetable_id: existingTimetable?.id
            };
            const response = await customAxios.post(TIME_TABLE_API_BASE_URL + '/check-teacher-conflict', conflictData);
            const result = response.data;
            return result.data;
        } catch (error) {
            console.error('Error checking teacher conflict:', error);
            return { has_conflict: false, conflicts: [] };
        }
    };

    const checkExistingTimetable = async () => {
        try {
            const response = await customAxios.get(TIME_TABLE_API_BASE_URL + '/view', {
                params: {
                    skid: loggedUser.skid,
                    class_id: selectedClass,
                    section_id: selectedSection,
                    academic_year: academicYear,
                    semester: semester
                }
            });

            if (response.data.code === 200 && response.data.status === 'success') {
                const timetable = response.data.data;
                setExistingTimetable(timetable);
                setIsDraft(timetable.is_draft || false);
                setMode(timetable.is_draft ? 'create' : 'view');

                if (timetable.is_draft) {
                    setActiveStep(2); // Allow editing
                } else {
                    setActiveStep(3); // View mode
                }

                // Load existing entries
                setTimetableEntries(timetable.entries || {});

                // Load configuration
                const config = timetable.configuration;
                setPeriodDuration(config.period_duration);
                setSchoolStartTime(config.school_start_time);
                setLunchStartTime(config.lunch_start_time);
                setLunchDuration(config.lunch_duration);
                setTotalPeriods(config.total_periods);
                setTimeSlots(timetable.time_slots || []);

                const statusText = timetable.is_draft ? 'Draft timetable loaded' : 'Existing timetable loaded';
                showSnackbar(statusText, 'info');
            } else if (response.data.code === 404) {
                // No existing timetable
                setExistingTimetable(null);
                setIsDraft(false);
                setMode('create');
                setActiveStep(0);
                setTimetableEntries({});
                setTimeSlots([]);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setExistingTimetable(null);
                setIsDraft(false);
                setMode('create');
                setActiveStep(0);
                setTimetableEntries({});
                setTimeSlots([]);
            } else {
                console.error('Error checking existing timetable:', error);
                showSnackbar('Error checking existing timetable', 'error');
            }
        }
    };

    const validateTimetableConflicts = async () => {
        try {
            setValidating(true);

            const transformedEntries = {};
            Object.entries(timetableEntries).forEach(([key, entry]) => {
                transformedEntries[key] = {
                    subject_id: entry.subject.id,
                    teacher_id: entry.teacher.id,
                    room: entry.room,
                    type: entry.type,
                };
            });

            const validationData = {
                skid: loggedUser.skid,
                class_id: selectedClass,
                section_id: selectedSection,
                academic_year: academicYear,
                semester: semester,
                entries: transformedEntries,
            };

            const response = await customAxios.post(TIME_TABLE_API_BASE_URL + '/validate-conflicts', validationData);

            if (response.data.code === 200 && response.data.status === 'success') {
                const result = response.data.data;
                setValidationResult(result);

                if (result.is_valid) {
                    showSnackbar('Timetable validation successful! Ready to save.', 'success');
                } else {
                    showSnackbar(`Validation failed: ${result.validation_message}`, 'error');
                }
            }
        } catch (error) {
            console.error('Error validating timetable:', error);
            showSnackbar('Error validating timetable', 'error');
            setValidationResult({ is_valid: false, validation_message: 'Validation failed' });
        } finally {
            setValidating(false);
        }
    };

    const handleCellClick = (day, timeSlot, isLunch = false) => {
        if (isLunch || (mode === 'view' && !isDraft)) return;

        const existingEntry = timetableEntries[`${day}-${timeSlot}`];
        if (existingEntry) {
            const subject = subjects.find(s => s.id === existingEntry.subject.id);
            const teacher = teachers.find(t => t.id === existingEntry.teacher.id);

            setCurrentEntry({
                subject: subject,
                teacher: teacher?.id || existingEntry.teacher.id,
                room: existingEntry.room,
                type: existingEntry.type,
            });
        } else {
            setCurrentEntry({
                subject: null,
                teacher: "",
                room: "",
                type: "Regular",
            });
        }

        setSelectedSlot({ day, timeSlot });
        setOpenDialog(true);
    };

    const handleSaveEntry = async () => {
        if (!currentEntry.subject || !currentEntry.teacher) {
            showSnackbar('Please select both subject and teacher', 'error');
            return;
        }

        const timeSlot = selectedSlot.timeSlot;
        if (timeSlot.includes(' - ')) {
            const [startTime, endTime] = timeSlot.split(' - ');

            const conflictResult = await checkTeacherConflict(
                currentEntry.teacher,
                selectedSlot.day,
                startTime,
                endTime
            );

            if (conflictResult.has_conflict) {
                setSnackbar({ open: true, message: conflictResult.message, severity: 'error' });
                setConflictDialog({
                    open: true,
                    conflicts: conflictResult.conflicts,
                    conflictCount: conflictResult.conflict_count
                });
                return;
            }
        }

        const teacherData = teachers.find(t => t.id === parseInt(currentEntry.teacher));

        const key = `${selectedSlot.day}-${selectedSlot.timeSlot}`;
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
        showSnackbar('Entry added successfully', 'success');
        setValidationResult(null);
    };

    const handleDeleteEntry = () => {
        const key = `${selectedSlot.day}-${selectedSlot.timeSlot}`;
        setTimetableEntries(prev => {
            const newEntries = { ...prev };
            delete newEntries[key];
            return newEntries;
        });

        handleCloseDialog();
        showSnackbar('Entry deleted successfully', 'success');
        setValidationResult(null);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedSlot({ day: "", timeSlot: "" });
        setCurrentEntry({
            subject: null,
            teacher: "",
            room: "",
            type: "Regular",
        });
    };

    // function to close conflict dialog
    const handleCloseConflictDialog = () => {
        setConflictDialog({
            open: false,
            conflicts: [],
            conflictCount: 0
        });
    };

    const handleSaveTimetable = async (saveAsDraft = false) => {
        try {
            if (saveAsDraft) {
                setSavingDraft(true);
            } else {
                setSaving(true);
            }

            // Transform entries for API
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
                class_id: selectedClass,
                section_id: selectedSection,
                academic_year: academicYear,
                semester: semester,
                period_duration: periodDuration,
                school_start_time: schoolStartTime,
                lunch_start_time: lunchStartTime,
                lunch_duration: lunchDuration,
                total_periods: totalPeriods,
                entries: transformedEntries,
                is_draft: saveAsDraft,
            };

            // Choose the appropriate endpoint based on saveAsDraft flag
            const endpoint = saveAsDraft
                ? TIME_TABLE_API_BASE_URL + '/save-draft'
                : TIME_TABLE_API_BASE_URL + '/create';

            const response = await customAxios.post(endpoint, timetableData);

            if (response.data.code === 201 && response.data.status === 'success') {
                showSnackbar(response.data.message, 'success');

                if (saveAsDraft) {
                    setMode('create');
                    setIsDraft(true);
                } else {
                    setMode('view');
                    setIsDraft(false);
                }
                navigate(-1);
            } else {
                showSnackbar(response.data.message || 'Error saving timetable', 'error');
            }
        } catch (error) {
            console.error('Error saving timetable:', error);
            const errorMessage = error.response?.data?.message || 'Error saving timetable';
            showSnackbar(errorMessage, 'error');
        } finally {
            setSaving(false);
            setSavingDraft(false);
        }
    };

    const handleCreateNew = () => {
        setMode('create');
        setExistingTimetable(null);
        setIsDraft(false);
        setTimetableEntries({});
        setTimeSlots([]);
        setValidationResult(null);
        setActiveStep(0);
    };

    const getAvailableSections = () => {
        return sections[selectedClass] || [];
    };

    const getAvailableTeachersForSubject = (subject) => {
        if (!subject) return [];
        return subject.teachers || [];
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const isConfigurationComplete = () => {
        return selectedClass && selectedSection && academicYear && semester &&
            periodDuration && schoolStartTime && lunchStartTime && lunchDuration && totalPeriods;
    };

    const canGenerateSlots = () => {
        return isConfigurationComplete() && activeStep === 0;
    };

    const canValidate = () => {
        return Object.keys(timetableEntries).length > 0 && activeStep === 2;
    };

    const canSave = () => {
        return Object.keys(timetableEntries).length > 0 && activeStep >= 2;
    };

    const canSaveDraft = () => {
        return Object.keys(timetableEntries).length > 0 && activeStep >= 2;
    };

    const getPageTitle = () => {
        if (isDraft) return "Edit Draft Timetable";
        if (mode === 'view') return "View Timetable";
        return "Create Timetable";
    };

    return (
        <>
            <MainCard title={getPageTitle()}
                secondary={
                    <Button variant="outlined" color="primary"
                        onClick={() => navigate('/timetable/list')}
                    >
                        Return
                    </Button>
                }>
                {/* Draft Status Alert */}
                {isDraft && (
                    <Alert
                        severity="warning"
                        sx={{ mb: 3 }}
                        icon={<DraftIcon />}
                    >
                        This is a draft timetable. You can continue editing and save it as final when ready.
                    </Alert>
                )}

                {/* Stepper */}
                <Box sx={{ width: '100%', mb: 4 }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label, index) => (
                            <Step key={label}>
                                <StepLabel>
                                    <Typography variant="body2">{label}</Typography>
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                {/* Step 0: Configuration */}
                <StyledCard>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <ClassIcon color="primary" />
                            Class Configuration
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="class">Select Class *</InputLabel>
                                    <Select
                                        id="class"
                                        name="class"
                                        value={selectedClass}
                                        onChange={(e) => {
                                            setSelectedClass(e.target.value);
                                            setSelectedSection("");
                                            setTimetableEntries({});
                                            setTimeSlots([]);
                                            setActiveStep(0);
                                            setValidationResult(null);
                                        }}
                                        displayEmpty
                                        required
                                        disabled={loading || (mode === 'view' && !isDraft)}
                                    >
                                        <MenuItem value=""><em>Select Class</em></MenuItem>
                                        {classes.map((cls) => (
                                            <MenuItem key={cls.id} value={cls.id}>
                                                {cls.class_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Stack>
                            </Grid>
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="section">Section</InputLabel>
                                    <Select
                                        id="section"
                                        name="section"
                                        value={selectedSection}
                                        disabled={!selectedClass || loading || (mode === 'view' && !isDraft)}
                                        onChange={(e) => {
                                            setSelectedSection(e.target.value);
                                            setTimetableEntries({});
                                            setTimeSlots([]);
                                            setActiveStep(0);
                                            setValidationResult(null);
                                        }}
                                    >
                                        {getAvailableSections().map((section) => (
                                            <MenuItem key={section.id} value={section.id}>
                                                {section.section_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Stack>
                            </Grid>
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="academic_year">Academic Year</InputLabel>
                                    <OutlinedInput
                                        id="academic_year"
                                        name="academic_year"
                                        value={academicYear}
                                        onChange={(e) => {
                                            setAcademicYear(e.target.value);
                                            setTimetableEntries({});
                                            setTimeSlots([]);
                                            setActiveStep(0);
                                            setValidationResult(null);
                                        }}
                                        placeholder="Enter academic year"
                                        fullWidth
                                        required
                                        disabled={mode === 'view' && !isDraft}
                                    />
                                </Stack>
                            </Grid>
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel>Semester</InputLabel>
                                    <Select
                                        value={semester}
                                        onChange={(e) => {
                                            setSemester(e.target.value);
                                            setTimetableEntries({});
                                            setTimeSlots([]);
                                            setActiveStep(0);
                                            setValidationResult(null);
                                        }}
                                        disabled={mode === 'view' && !isDraft}
                                    >
                                        <MenuItem value="1">Semester 1</MenuItem>
                                        <MenuItem value="2">Semester 2</MenuItem>
                                    </Select>
                                </Stack>
                            </Grid>
                        </Grid>
                    </CardContent>
                </StyledCard>

                {/* Step 1: Period Configuration */}
                <StyledCard>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <SettingsIcon color="primary" />
                                Period Configuration
                                {existingTimetable && (
                                    <Chip
                                        label={isDraft ? "Draft" : "Published"}
                                        color={isDraft ? "warning" : "success"}
                                        size="small"
                                        icon={isDraft ? <DraftIcon /> : <VisibilityIcon />}
                                        sx={{ ml: 2 }}
                                    />
                                )}
                            </Typography>

                            <Box display="flex" gap={2}>
                                {canGenerateSlots() && (
                                    <Button
                                        variant="contained"
                                        onClick={generateTimeSlots}
                                        disabled={generating || !isConfigurationComplete()}
                                        startIcon={generating ? <CircularProgress size={20} /> : <GenerateIcon />}
                                        sx={{ textTransform: "none" }}
                                    >
                                        {generating ? 'Generating...' : 'Generate Time Slots'}
                                    </Button>
                                )}

                                {mode === 'view' && existingTimetable && !isDraft && (
                                    <Button
                                        variant="outlined"
                                        onClick={handleCreateNew}
                                        startIcon={<EditIcon />}
                                        sx={{ textTransform: "none" }}
                                    >
                                        Create New Timetable
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="period_duration">Period Duration (min) *</InputLabel>
                                    <OutlinedInput
                                        type="number"
                                        value={periodDuration}
                                        onChange={(e) => {
                                            setPeriodDuration(Number(e.target.value));
                                            setTimeSlots([]);
                                            setActiveStep(0);
                                        }}
                                        fullWidth
                                        variant="outlined"
                                        inputProps={{ min: 30, max: 90 }}
                                        disabled={(mode === 'view' && !isDraft) || activeStep > 0}
                                    />
                                </Stack>
                            </Grid>
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="total_periods">Total Periods *</InputLabel>
                                    <OutlinedInput
                                        type="number"
                                        value={totalPeriods}
                                        onChange={(e) => {
                                            setTotalPeriods(Number(e.target.value));
                                            setTimeSlots([]);
                                            setActiveStep(0);
                                        }}
                                        fullWidth
                                        variant="outlined"
                                        inputProps={{ min: 4, max: 10 }}
                                        disabled={(mode === 'view' && !isDraft) || activeStep > 0}
                                    />
                                </Stack>
                            </Grid>
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="school_start_time">School Start Time *</InputLabel>
                                    <OutlinedInput
                                        type="time"
                                        value={schoolStartTime}
                                        onChange={(e) => {
                                            setSchoolStartTime(e.target.value);
                                            setTimeSlots([]);
                                            setActiveStep(0);
                                        }}
                                        fullWidth
                                        variant="outlined"
                                        disabled={(mode === 'view' && !isDraft) || activeStep > 0}
                                    />
                                </Stack>
                            </Grid>
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="lunch_start_time">Lunch Start Time *</InputLabel>
                                    <OutlinedInput
                                        type="time"
                                        value={lunchStartTime}
                                        onChange={(e) => {
                                            setLunchStartTime(e.target.value);
                                            setTimeSlots([]);
                                            setActiveStep(0);
                                        }}
                                        fullWidth
                                        variant="outlined"
                                        disabled={(mode === 'view' && !isDraft) || activeStep > 0}
                                    />
                                </Stack>
                            </Grid>
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="lunch_duration">Lunch Duration (min) *</InputLabel>
                                    <OutlinedInput
                                        type="number"
                                        value={lunchDuration}
                                        onChange={(e) => {
                                            setLunchDuration(Number(e.target.value));
                                            setTimeSlots([]);
                                            setActiveStep(0);
                                        }}
                                        fullWidth
                                        variant="outlined"
                                        inputProps={{ min: 15, max: 60 }}
                                        disabled={(mode === 'view' && !isDraft) || activeStep > 0}
                                    />
                                </Stack>
                            </Grid>
                        </Grid>

                        {!isConfigurationComplete() && activeStep === 0 && (
                            <Alert severity="info" sx={{ mt: 3 }}>
                                Please fill in all required fields to proceed with time slot generation.
                            </Alert>
                        )}
                    </CardContent>
                </StyledCard>

                {/* Step 2 & 3: Timetable Grid */}
                {timeSlots.length > 0 && (
                    <StyledCard>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <ScheduleIcon color="primary" />
                                    Timetable Schedule
                                    {isConfigurationComplete() && (
                                        <Chip
                                            label={`${classes.find(c => c.id === selectedClass)?.class_name} - Section ${getAvailableSections().find(s => s.id === selectedSection)?.section_name}`}
                                            color="primary"
                                            size="small"
                                            sx={{ ml: 2 }}
                                        />
                                    )}
                                </Typography>

                                <Box display="flex" gap={2}>
                                    {canValidate() && (
                                        <Button
                                            variant="outlined"
                                            onClick={validateTimetableConflicts}
                                            disabled={validating}
                                            startIcon={validating ? <CircularProgress size={20} /> : <ValidateIcon />}
                                            sx={{ textTransform: "none" }}
                                        >
                                            {validating ? 'Validating...' : 'Validate Conflicts'}
                                        </Button>
                                    )}
                                </Box>
                            </Box>

                            {/* Validation Results */}
                            {validationResult && (
                                <Alert
                                    severity={validationResult.is_valid ? "success" : "error"}
                                    sx={{ mb: 2 }}
                                >
                                    {validationResult.is_valid
                                        ? "No conflicts found! Timetable is ready to save."
                                        : `${validationResult.validation_message}`
                                    }
                                </Alert>
                            )}

                            {activeStep === 2 && !validationResult && Object.keys(timetableEntries).length > 0 && (
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    Click "Validate Conflicts" to check for teacher scheduling conflicts before saving.
                                </Alert>
                            )}

                            {activeStep === 2 && Object.keys(timetableEntries).length === 0 && (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    Click on any empty time slot to add a subject. Click on existing entries to edit or delete.
                                </Alert>
                            )}

                            {mode === 'view' && existingTimetable && !isDraft && (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    Viewing finalized timetable. Create a new timetable to make changes.
                                </Alert>
                            )}

                            <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                                            <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                                                Time / Day
                                            </TableCell>
                                            {daysOfWeek.map((day) => (
                                                <TableCell key={day} sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                                                    {day}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {timeSlots.map((slot) => (
                                            <TableRow key={slot.time_display}>
                                                <TableCell sx={{
                                                    fontWeight: "bold",
                                                    backgroundColor: slot.is_lunch ? theme.palette.warning.light : theme.palette.grey[50],
                                                    textAlign: "center",
                                                    color: slot.is_lunch ? theme.palette.warning.contrastText : "inherit"
                                                }}>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {slot.label}
                                                        </Typography>
                                                        <Typography variant="caption">
                                                            {slot.time_display}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                {daysOfWeek.map((day) => {
                                                    if (slot.is_lunch) {
                                                        return (
                                                            <TableCell
                                                                key={`${day}-${slot.time_display}`}
                                                                sx={{
                                                                    backgroundColor: theme.palette.warning.light,
                                                                    textAlign: "center",
                                                                    color: theme.palette.warning.contrastText
                                                                }}
                                                            >
                                                                <Typography variant="body2" fontWeight="bold">
                                                                    LUNCH BREAK
                                                                </Typography>
                                                            </TableCell>
                                                        );
                                                    }

                                                    const entry = timetableEntries[`${day}-${slot.time_display}`];
                                                    return (
                                                        <ClickableCell
                                                            key={`${day}-${slot.time_display}`}
                                                            isEmpty={!entry}
                                                            onClick={() => (activeStep === 2 && (mode === 'create' || isDraft)) && handleCellClick(day, slot.time_display)}
                                                        >
                                                            {entry ? (
                                                                <TimeSlotCard elevation={1}>
                                                                    <Box>
                                                                        <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                                                            {entry.subject.subject_name}({entry.subject.subject_code})
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                                                            {entry.teacher.first_name} {entry.teacher.last_name}
                                                                        </Typography>
                                                                        {entry.room && (
                                                                            <Typography variant="caption" display="block" noWrap>
                                                                                Room: {entry.room}
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                                                                        <Chip
                                                                            label={entry.type}
                                                                            size="small"
                                                                            color={entry.type === "Lab" ? "secondary" : "primary"}
                                                                        />
                                                                        {activeStep === 2 && (mode === 'create' || isDraft) && (
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Click to edit
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                </TimeSlotCard>
                                                            ) : activeStep === 2 && (mode === 'create' || isDraft) ? (
                                                                <EmptySlot>
                                                                    <Box textAlign="center">
                                                                        <AddIcon sx={{ fontSize: 20, mb: 0.5 }} />
                                                                        <Typography variant="caption" display="block">
                                                                            Add Subject
                                                                        </Typography>
                                                                    </Box>
                                                                </EmptySlot>
                                                            ) : (
                                                                <Box height={80} display="flex" alignItems="center" justifyContent="center">
                                                                    <Typography variant="caption" color="text.disabled">
                                                                        Free Period
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </ClickableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {!validationResult && Object.keys(timetableEntries).length > 0 && activeStep === 2 && !isDraft && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    Validate your timetable before final save, or save as draft to continue editing later.
                                </Alert>
                            )}
                            {/* Save Buttons */}
                            {(canSave() || canSaveDraft()) && (
                                <Box mt={3} display="flex" justifyContent="center" gap={2}>
                                    {canSaveDraft() && (
                                        <Button
                                            variant="outlined"
                                            size="large"
                                            onClick={() => handleSaveTimetable(true)}
                                            disabled={savingDraft}
                                            startIcon={savingDraft ? <CircularProgress size={20} /> : <DraftIcon />}
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: "none",
                                                px: 4,
                                                py: 1.5,
                                            }}
                                        >
                                            {savingDraft ? 'Saving Draft...' : 'Save as Draft'}
                                        </Button>
                                    )}

                                    {(canSave() && (validationResult?.is_valid || isDraft)) && (
                                        <Button
                                            variant="contained"
                                            size="large"
                                            onClick={() => handleSaveTimetable(false)}
                                            disabled={saving || (!validationResult?.is_valid && !isDraft)}
                                            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: "none",
                                                px: 4,
                                                py: 1.5,
                                            }}
                                        >
                                            {saving ? 'Saving...' : 'Save Final Timetable'}
                                        </Button>
                                    )}
                                </Box>
                            )}

                        </CardContent>
                    </StyledCard>
                )}
            </MainCard>

            {/* Add/Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle>
                    {timetableEntries[`${selectedSlot.day}-${selectedSlot.timeSlot}`] ? "Edit Time Slot" : "Add Subject to Time Slot"}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <strong>{selectedSlot.day}</strong> - {selectedSlot.timeSlot}
                        </Alert>

                        <Grid container spacing={2}>
                            <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 12, xs: 12 }}>
                                <Autocomplete
                                    options={subjects}
                                    getOptionLabel={(option) => `${option.subject_name} (${option.subject_code})`}
                                    value={currentEntry.subject}
                                    onChange={(event, newValue) =>
                                        setCurrentEntry(prev => ({
                                            ...prev,
                                            subject: newValue,
                                            teacher: ""
                                        }))
                                    }
                                    renderInput={(params) => (
                                        <TextField {...params} label="Subject" variant="outlined" required />
                                    )}
                                />
                            </Grid>
                            <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 12, xs: 12 }}>
                                <FormControl fullWidth disabled={!currentEntry.subject}>
                                    <InputLabel>Teacher</InputLabel>
                                    <Select
                                        value={currentEntry.teacher}
                                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, teacher: e.target.value }))}
                                        label="Teacher"
                                    >
                                        {getAvailableTeachersForSubject(currentEntry.subject)?.map((teacher) => (
                                            <MenuItem key={teacher.id} value={teacher.id}>
                                                {teacher.first_name} {teacher.last_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                                <TextField
                                    label="Room Number"
                                    value={currentEntry.room}
                                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, room: e.target.value }))}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Class Type</InputLabel>
                                    <Select
                                        value={currentEntry.type}
                                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, type: e.target.value }))}
                                        label="Class Type"
                                    >
                                        <MenuItem value="Regular">Regular</MenuItem>
                                        <MenuItem value="Lab">Lab</MenuItem>
                                        <MenuItem value="Tutorial">Tutorial</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    {timetableEntries[`${selectedSlot.day}-${selectedSlot.timeSlot}`] && (
                        <Button
                            onClick={handleDeleteEntry}
                            color="error"
                            startIcon={<DeleteIcon />}
                            sx={{ textTransform: "none" }}
                        >
                            Delete
                        </Button>
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    <Button onClick={handleCloseDialog} sx={{ textTransform: "none" }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveEntry}
                        variant="contained"
                        disabled={!currentEntry.subject || !currentEntry.teacher}
                        sx={{ textTransform: "none" }}
                    >
                        {timetableEntries[`${selectedSlot.day}-${selectedSlot.timeSlot}`] ? "Update" : "Add"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Conflict Warning Dialog */}
            <Dialog
                open={conflictDialog.open}
                onClose={handleCloseConflictDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{
                    backgroundColor: theme.palette.error.main,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <ScheduleIcon />
                    Teacher Scheduling Conflict Detected
                </DialogTitle>

                <DialogContent sx={{ mt: 2 }}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                        <Typography variant="body1" fontWeight="bold">
                            {conflictDialog.conflictCount} conflict{conflictDialog.conflictCount > 1 ? 's' : ''} found!
                        </Typography>
                        <Typography variant="body2">
                            The selected teacher is already scheduled during this time slot in another class.
                        </Typography>
                    </Alert>

                    {conflictDialog.conflicts.map((conflict, index) => (
                        <Paper
                            key={index}
                            elevation={2}
                            sx={{
                                p: 2,
                                mb: 2,
                                border: `2px solid ${theme.palette.error.light}`,
                                borderRadius: 2,
                                backgroundColor: theme.palette.error.lighter || '#ffebee'
                            }}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" fontWeight="bold" color="error">
                                        Conflict #{index + 1}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Teacher
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {conflict.teacher_name}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Day & Time
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {conflict.day}, {conflict.start_time} - {conflict.end_time}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Class & Section
                                    </Typography>
                                    <Typography variant="body2">
                                        {conflict.class_name} - {conflict.section_name}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Subject
                                    </Typography>
                                    <Typography variant="body2">
                                        {conflict.subject_name} ({conflict.subject_code})
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Period Number
                                    </Typography>
                                    <Typography variant="body2">
                                        Period {conflict.period_number}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Room
                                    </Typography>
                                    <Typography variant="body2">
                                        Room {conflict.room_number}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}

                    <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            <strong>Recommendation:</strong> Please select a different teacher or time slot to avoid scheduling conflicts.
                        </Typography>
                    </Alert>
                </DialogContent>

                <DialogActions sx={{ p: 2, backgroundColor: theme.palette.grey[50] }}>
                    <Button
                        onClick={handleCloseConflictDialog}
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: 'none' }}
                    >
                        Choose Different Teacher
                    </Button>

                    {isDraft && (
                        <Button
                            onClick={handleForceSave}
                            variant="outlined"
                            color="warning"
                            sx={{ textTransform: 'none' }}
                        >
                            Save Anyway (Draft)
                        </Button>
                    )}
                </DialogActions>
            </Dialog>


            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}