import React, { useState, useEffect } from 'react';
import { Card as ACard } from 'antd';
import {
    Box,
    Typography,
    List,
    ListItem,
    IconButton,
    TextField,
    Card,
    CardContent,
    Grid,
    Divider,
    InputAdornment,
    useTheme,
    useMediaQuery,
    ListItemButton,
    Fade,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Alert
} from '@mui/material';
import {
    IconPlus,
    IconSearch,
    IconEdit,
    IconTrash,
    IconSchool,
    IconBook,
    IconBooks,
    IconUser,
} from '@tabler/icons-react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
// import { toast } from 'react-toastify';
import MainCard from '../../../ui-component/cards/MainCard';
import SubjectForm from './SubjectForm';
import customAxios from '../../../utils/axiosConfig';
import { CLASSES_API_BASE_URL, SUBJECTS_API_BASE_URL } from '../../../ApiConstants';
import { useSelector } from 'react-redux';
import Loader from '../../../ui-component/Loader';

function Subjects() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState({});
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openCreateSubjectModal, setOpenCreateSubjectModal] = useState(false);
    const [confirmOpenSubject, setConfirmOpenSubject] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load initial data
    useEffect(() => {
        fetchClasses();
    }, []);

    // Set first class as selected when classes load
    useEffect(() => {
        if (classes.length > 0 && !selectedClassId) {
            const firstClass = classes[0];
            setSelectedClassId(firstClass.id);
            setSelectedClass(firstClass);
            fetchSubjects(firstClass.id);
        }
    }, [classes]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(CLASSES_API_BASE_URL + '/list/' + loggedUser?.skid);
            if (response.data.code === 200 && response.data.status === 'success') {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            // toast.error('Error fetching classes');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async (classId) => {
        try {
            setLoading(true);
            const response = await customAxios.get(SUBJECTS_API_BASE_URL + '/list/' + loggedUser?.skid + '/' + classId);
            if (response.data.code === 200 && response.data.status === 'success') {
                setSubjects(prev => ({
                    ...prev,
                    [classId]: response.data.data || []
                }));
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            // toast.error('Error fetching subjects');
        } finally {
            setLoading(false);
        }
    };

    // Filter classes based on search term
    const filteredClasses = classes.filter(cls =>
        cls.class_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentSubjects = selectedClassId ? subjects[selectedClassId] || [] : [];

    const handleClassSelect = (cls) => {
        setSelectedClassId(cls.id);
        setSelectedClass(cls);
        if (!subjects[cls.id]) {
            fetchSubjects(cls.id);
        }
    };

    const handleAddSubject = () => {
        setSelectedSubject(null);
        setOpenCreateSubjectModal(true);
    };

    const handleEditSubject = (subject) => {
        setSelectedSubject(subject);
        setOpenCreateSubjectModal(true);
    };

    const handleDeleteSubject = (subject) => {
        setSelectedSubject(subject);
        setConfirmOpenSubject(true);
    };

    const handleConfirmDeleteSubject = async () => {
        try {
            setLoading(true);
            const response = await customAxios.delete(SUBJECTS_API_BASE_URL + "/delete/subject/" + loggedUser?.skid + '/' + selectedSubject?.id);
            if (response.data.code === 200 && response.data.status === 'success') {
                // toast.success('Subject deleted successfully');
                if (selectedClassId) {
                    fetchSubjects(selectedClassId);
                }
            }
        } catch (error) {
            console.error('Error deleting subject:', error);
            // toast.error('Error deleting subject');
        } finally {
            setConfirmOpenSubject(false);
            setLoading(false);
        }
    };

    const handleSubjectFormClose = (shouldRefresh = false) => {
        setOpenCreateSubjectModal(false);
        setSelectedSubject(null);
        if (shouldRefresh && selectedClassId) {
            fetchSubjects(selectedClassId);
        }
    };

    return (
        <>
            <Loader loading={loading} />
            <MainCard>
                <Grid container mt={-2}>
                    <Grid item size={{ xl: 12, lg: 12, md: 12, sm: 12, xs: 12 }}>
                        <Alert severity="info" sx={{ mt: 1 }}>
                            To create Subjects make sure classes are created
                        </Alert>
                    </Grid>
                </Grid>
                <br />
                <Box sx={{
                    display: 'flex',
                    height: isMobile ? 'auto' : 'auto',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: 2
                }}>
                    {/* Left Sidebar - Class List */}
                    <Card sx={{
                        width: isMobile ? '100%' : (isTablet ? 280 : 320),
                        flexShrink: 0,
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: isMobile ? 'auto' : 'fit-content',
                        maxHeight: isMobile ? 'none' : '100vh'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconSchool size={24} color={theme.palette.primary.main} style={{ marginRight: 8 }} />
                                <Typography variant="h3" component="div">
                                    Classes
                                </Typography>
                            </Box>
                        </Box>

                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search classes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconSearch size={20} color={theme.palette.action.active} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 },
                            }}
                            sx={{ mb: 2 }}
                            size="small"
                        />

                        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            <List dense>
                                {filteredClasses.map((cls) => {
                                    const subjectsCount = subjects[cls.id]?.length || 0;
                                    return (
                                        <ListItem key={cls.id} disablePadding>
                                            <ListItemButton
                                                selected={cls.id === selectedClassId}
                                                onClick={() => handleClassSelect(cls)}
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    py: 1.5,
                                                    px: 2,
                                                    mb: 1,
                                                    borderRadius: 2,
                                                    border: cls.id === selectedClassId ? `2px solid ${theme.palette.primary.main}` : '1px solid #e3e8ef',
                                                    backgroundColor: cls.id === selectedClassId ? theme.palette.primary.light + '20' : 'transparent',
                                                    '&:hover': {
                                                        backgroundColor: cls.id === selectedClassId
                                                            ? theme.palette.primary.light + '30'
                                                            : theme.palette.action.hover,
                                                        border: cls.id === selectedClassId
                                                            ? `2px solid ${theme.palette.primary.main}`
                                                            : `1px solid ${theme.palette.divider}`,
                                                    },
                                                    '&.Mui-selected': {
                                                        backgroundColor: theme.palette.primary.light + '20',
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.primary.light + '30',
                                                        }
                                                    }
                                                }}
                                            >
                                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography
                                                            component="div"
                                                            variant="body1"
                                                            fontWeight={cls.id === selectedClassId ? "bold" : "medium"}
                                                            color={cls.id === selectedClassId ? "primary" : "inherit"}
                                                        >
                                                            {cls.class_name}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                            <IconBooks size={16} color={theme.palette.text.secondary} style={{ marginRight: 4 }} />
                                                            <Typography component="span" variant="body2" color="text.secondary">
                                                                {subjectsCount} subjects
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </ListItemButton>
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Box>
                    </Card>

                    {/* {!isMobile && <Divider orientation="vertical" flexItem />} */}

                    <ACard
                        style={{
                            flex: 1,
                            border: `2px solid ${theme.palette.divider}`,
                        }}
                        title={<Typography variant={isMobile ? "h6" : "h4"} component="div">
                            {selectedClass ? `${selectedClass.class_name} - Subjects` : 'Select a Class'}
                        </Typography>}
                        extra={
                            <IconButton
                                size='small'
                                color="primary"
                                onClick={handleAddSubject}
                                variant="outlined"
                                sx={{
                                    border: `1px solid ${theme.palette.primary.main}`,
                                    borderRadius: 2,
                                    px: isMobile ? 1 : 2
                                }}
                            >
                                <IconPlus size={20} />
                                {!isMobile && (
                                    <Typography variant="button" sx={{ ml: 0.5 }}>
                                        Add Subject
                                    </Typography>
                                )}
                            </IconButton>
                        }
                    >
                        <Grid container spacing={isMobile ? 2 : 3}>
                            {currentSubjects.length > 0 ? (
                                currentSubjects.map((subject) => (
                                    <Grid item xs={12} sm={6} lg={4} xl={3} key={subject.id}>
                                        <Card
                                            sx={{
                                                p: 2,
                                                border: `1px solid ${theme.palette.divider}`,
                                                borderRadius: 2,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    borderColor: theme.palette.primary.main,
                                                    boxShadow: theme.shadows[4],
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: '16px !important' }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    mb: 2
                                                }}>
                                                    <Typography variant="h4" component="div" color="primary">
                                                        {subject.subject_name}
                                                    </Typography>
                                                    <Box>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEditSubject(subject)}
                                                            sx={{
                                                                '&:hover': {
                                                                    backgroundColor: theme.palette.primary.light + '20'
                                                                }
                                                            }}
                                                        >
                                                            <IconEdit size={20} />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteSubject(subject)}
                                                            sx={{
                                                                color: 'error.main',
                                                                '&:hover': {
                                                                    backgroundColor: theme.palette.error.light + '20'
                                                                }
                                                            }}
                                                        >
                                                            <IconTrash size={20} />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <IconBook size={18} style={{ marginRight: 8 }} />
                                                        <Typography component="span" variant="body2" color="text.secondary">
                                                            Subject Code:
                                                        </Typography>
                                                        <Typography component="span" variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', ml: 0.5 }}>
                                                            {subject.subject_code || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <IconUser size={18} style={{ marginRight: 8 }} />
                                                        <Typography component="span" variant="body2" color="text.secondary">
                                                            Teacher:
                                                        </Typography>
                                                        <Typography component="span" variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', ml: 0.5 }}>
                                                            {subject.teachers.map((t) => t.first_name + ' ' + t.last_name).join(', ') || 'Not Assigned'}
                                                        </Typography>
                                                    </Box>
                                                    {subject.description && (
                                                        <Box sx={{ mt: 1 }}>
                                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                                {subject.description}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Box sx={{
                                        textAlign: 'center',
                                        mt: 4,
                                        p: 4,
                                        border: `1px dashed ${theme.palette.divider}`,
                                        borderRadius: 2
                                    }}>
                                        <IconBooks size={48} color={theme.palette.text.disabled} />
                                        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                                            No subjects available
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedClass
                                                ? `No subjects have been created for ${selectedClass.class_name} yet.`
                                                : 'Select a class to view its subjects.'
                                            }
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </ACard>
                </Box>
            </MainCard>

            {/* Create/Edit Subject Modal */}
            <Dialog open={openCreateSubjectModal} onClose={() => handleSubjectFormClose(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconBook color="primary" />
                    {selectedSubject ? 'Edit Subject' : 'Create Subject'}
                </DialogTitle>
                {selectedClass && (
                    <SubjectForm
                        classData={selectedClass}
                        subjectData={selectedSubject}
                        loggedUser={loggedUser}
                        onClose={handleSubjectFormClose}
                    />
                )}
            </Dialog>

            {/* Delete dialog for Subject */}
            <Dialog open={confirmOpenSubject} onClose={() => setConfirmOpenSubject(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                    <WarningAmberIcon color="error" />
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: '1rem', color: 'text.primary' }}>
                        Are you sure you want to delete the subject <strong>"{selectedSubject?.subject_name}"</strong>? This action is final and cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setConfirmOpenSubject(false)}
                        variant="outlined"
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDeleteSubject}
                        variant="contained"
                        color="error"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Subjects;