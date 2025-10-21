import React, { useState, useEffect } from 'react';
import { Card as ACard, Table } from 'antd';
import {
    Box, Typography, List, ListItem, IconButton, TextField, Card, Divider, InputAdornment, useTheme, useMediaQuery,
    ListItemButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Button, Chip, Menu, MenuItem, ListItemIcon, ListItemText,
    Tooltip
} from '@mui/material';
import {
    IconPlus, IconSearch, IconEdit, IconTrash, IconSchool, IconUsers, IconX, IconUserCheck, IconBook,
    IconDotsVertical,
} from '@tabler/icons-react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MoreVertIcon from '@mui/icons-material/MoreVert';
// import { toast } from 'react-toastify';
import MainCard from '../../../ui-component/cards/MainCard';
import ClassForm from './ClassForm';
import SectionForm from '../classes-sections/SectionForm';
import customAxios from '../../../utils/axiosConfig';
import { CLASSES_API_BASE_URL, STUDENTS_API_BASE_URL } from '../../../ApiConstants';
import { useSelector } from 'react-redux';
import Loader from '../../../ui-component/Loader';
import StudentsListView from '../student/StudentsListSectionWise';
import { useNavigate } from 'react-router-dom';


function Classes() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState({});
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openCreateClassModal, setOpenCreateClassModal] = useState(false);
    const [openCreateSectionModal, setOpenCreateSectionModal] = useState(false);
    const [openEditTeacherModal, setOpenEditTeacherModal] = useState(false);
    const [studentListViewModal, setStudentListViewModal] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmOpenSection, setConfirmOpenSection] = useState(false);
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentSection, setCurrentSection] = useState(null);
    const openMenu = Boolean(anchorEl);

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
            fetchSections(firstClass.id);
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

    const fetchSections = async (classId) => {
        try {
            setLoading(true);
            const response = await customAxios.get(CLASSES_API_BASE_URL + '/sections/' + loggedUser?.skid + '/' + classId);
            if (response.data.code === 200 && response.data.status === 'success') {
                setSections(prev => ({
                    ...prev,
                    [classId]: response.data.data || []
                }));
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
            // toast.error('Error fetching sections');
        } finally {
            setLoading(false);
        }
    };

    // Filter classes based on search term
    const filteredClasses = classes.filter(cls =>
        cls.class_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentSections = selectedClassId ? sections[selectedClassId] || [] : [];

    const handleClassSelect = (cls) => {
        setSelectedClassId(cls.id);
        setSelectedClass(cls);
        if (!sections[cls.id]) {
            fetchSections(cls.id);
        }
    };

    const handleAddClass = () => {
        setSelectedClass(null);
        setOpenCreateClassModal(true);
    };

    const handleEditClass = (cls) => {
        setSelectedClass(cls);
        setOpenCreateClassModal(true);
    };

    const handleDeleteClass = (cls) => {
        setSelectedClass(cls);
        setConfirmOpen(true);
    };

    const handleConfirmDeleteClass = async () => {
        try {
            setLoading(true);
            const response = await customAxios.delete(CLASSES_API_BASE_URL + "/class/delete/" + loggedUser?.skid + '/' + selectedClass?.id);
            if (response.data.code === 200 && response.data.status === 'success') {
                // toast.success('Class deleted successfully');
                fetchClasses();

                // Reset selection if deleted class was selected
                if (selectedClassId === selectedClass?.id) {
                    setSelectedClassId(null);
                    setSelectedClass(null);
                    setSections(prev => {
                        const newSections = { ...prev };
                        delete newSections[selectedClass?.id];
                        return newSections;
                    });
                }
            }
        } catch (error) {
            console.error('Error deleting class:', error);
            // toast.error('Error deleting class');
        } finally {
            setConfirmOpen(false);
            setLoading(false)
        }
    };

    const handleViewClassSubjects = () => {
        navigate(`/class/${selectedClass.id}/subjects`, {
            state: {
                class: selectedClass
            }
        });
    };

    const handleAddSection = () => {
        setSelectedSection(null);
        setOpenCreateSectionModal(true);
    };

    const handleEditSection = (section) => {
        setSelectedSection(section);
        setOpenCreateSectionModal(true);
    };

    const handleDeleteSection = (section) => {
        setSelectedSection(section);
        setConfirmOpenSection(true);
    };

    const handleConfirmDeleteSection = async () => {
        try {
            setLoading(true);
            const response = await customAxios.delete(CLASSES_API_BASE_URL + "/section/delete/" + loggedUser?.skid + '/' + selectedSection?.id);
            if (response.data.code === 200 && response.data.status === 'success') {
                // toast.success('Section deleted successfully');
                if (selectedClassId) {
                    fetchSections(selectedClassId);
                }
            }
        } catch (error) {
            console.error('Error deleting section:', error);
            // toast.error('Error deleting section');
        } finally {
            setConfirmOpenSection(false)
            setLoading(false)
        }
    };

    const handleClassFormClose = (shouldRefresh = false) => {
        setOpenCreateClassModal(false);
        setSelectedClass(null);
        if (shouldRefresh) {
            fetchClasses();
        }
    };

    const handleSectionFormClose = (shouldRefresh = false) => {
        setOpenCreateSectionModal(false);
        setSelectedSection(null);
        if (shouldRefresh && selectedClassId) {
            fetchSections(selectedClassId);
        }
    };

    const handleEditClassTeacher = (section) => {
        setSelectedSection(section);
        setOpenEditTeacherModal(true);
        handleMenuClose();
    };

    const handleTeacherFormClose = (shouldRefresh = false) => {
        setOpenEditTeacherModal(false);
        setSelectedSection(null);
        if (shouldRefresh && selectedClassId) {
            fetchSections(selectedClassId);
        }
    };

    const handleViewStudents = (section) => {
        handleMenuClose();
        // Navigate to students page with section info
        navigate(`/section/${section.id}/students`, {
            state: {
                section: section,
                class: selectedClass
            }
        });
    };

    const handleViewSubjects = (section) => {
        handleMenuClose();
        // Navigate to subjects page with section info
        navigate(`/section/${section.id}/subjects`, {
            state: {
                section: section,
                class: selectedClass
            }
        });
    };

    // Handle Menu Open
    const handleMenuClick = (event, section) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setCurrentSection(section);
    };

    // Handle Menu Close
    const handleMenuClose = () => {
        setAnchorEl(null);
        setCurrentSection(null);
    };

    // Ant Design Table Columns
    const columns = [
        {
            title: 'Section Name',
            dataIndex: 'section_name',
            key: 'section_name',
            render: (text) => (
                <Typography variant="subtitle1" fontWeight={500}>
                    {text}
                </Typography>
            ),
        },
        {
            title: 'Class Teacher',
            dataIndex: 'teacher_name',
            key: 'teacher_name',
            render: (text) => (
                <Typography variant="body2">
                    {text || 'Not Assigned'}
                </Typography>
            ),
        },
        {
            title: 'Students',
            dataIndex: 'student_count',
            key: 'student_count',
            align: 'center',
            render: (count) => (
                <Chip
                    label={count || 0}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Tooltip title="More actions">
                    <IconButton onClick={(e) => handleMenuClick(e, record)}>
                        <MoreVertIcon />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];


    return (
        <>
            <Loader loading={loading} />
            <MainCard>
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
                            <IconButton color="primary" onClick={handleAddClass}>
                                <IconPlus size={25} />
                            </IconButton>
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
                                    const sectionsCount = sections[cls.id]?.length || 0;
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
                                                            {cls.class_name} - {sectionsCount} sections
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                            <IconUsers size={16} color={theme.palette.text.secondary} style={{ marginRight: 4 }} />
                                                            <Typography component="span" variant="body2" color="text.secondary">
                                                                {cls.student_count}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ opacity: cls.id === selectedClassId ? 1 : 0.7 }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => { e.stopPropagation(); handleEditClass(cls); }}
                                                        >
                                                            <IconEdit size={20} />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls); }}
                                                            sx={{ color: 'error.main' }}
                                                        >
                                                            <IconTrash size={20} />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            </ListItemButton>
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Box>
                    </Card>


                    {/* Right Content Area - Sections for Selected Class */}
                    <ACard
                        style={{
                            flex: 1,
                            border: `2px solid ${theme.palette.divider}`,
                        }}
                        title={<Typography variant={isMobile ? "h6" : "h4"} component="div">
                            {selectedClass ? selectedClass.class_name : 'Select a Class'}
                        </Typography>}
                        extra={
                            selectedClass && (
                                <>
                                    <IconButton
                                        size='small'
                                        color="primary"
                                        onClick={handleViewClassSubjects}
                                        variant="contained"
                                        sx={{
                                            border: `1px solid ${theme.palette.primary.main}`,
                                            borderRadius: 2,
                                            px: isMobile ? 1 : 2,
                                            mr: 1
                                        }}
                                    >
                                        <IconBook size={20} />
                                        {!isMobile && (
                                            <Typography variant="button" sx={{ ml: 0.5 }}>
                                                View Subjects
                                            </Typography>
                                        )}
                                    </IconButton>
                                    <IconButton
                                        size='small'
                                        color="primary"
                                        onClick={handleAddSection}
                                        variant="contained"
                                        sx={{
                                            border: `1px solid ${theme.palette.primary.main}`,
                                            borderRadius: 2,
                                            px: isMobile ? 1 : 2
                                        }}
                                    >
                                        <IconPlus size={20} />
                                        {!isMobile && (
                                            <Typography variant="button" sx={{ ml: 0.5 }}>
                                                Add Section
                                            </Typography>
                                        )}
                                    </IconButton>
                                </>
                            )
                        }
                    >
                        {currentSections.length > 0 ? (
                            <Table
                                columns={columns}
                                dataSource={currentSections}
                                rowKey="id"
                                pagination={false}
                                locale={{
                                    emptyText: 'No sections available'
                                }}
                                size='small'
                                onRow={(record) => {
                                    return {
                                        onClick: (e) => {
                                            if (e.target.cellIndex >= 0)
                                                handleViewStudents(record)
                                        }, // click row
                                    };
                                }}
                            />
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <IconSchool size={64} stroke={1.5} color={theme.palette.text.disabled} />
                                <Typography variant="h5" color="text.secondary" sx={{ mt: 2 }}>
                                    No sections available
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {selectedClass
                                        ? `No sections have been created for ${selectedClass.class_name} yet.`
                                        : 'Select a class to view its sections.'}
                                </Typography>
                            </Box>
                        )}
                    </ACard>
                </Box>
            </MainCard>

            {/* Material-UI Menu for Actions */}
            <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => { handleEditSection(currentSection); handleMenuClose(); }}>
                    <ListItemIcon><IconEdit fontSize="medium" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }} primary="Edit Section" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleEditSection(currentSection); handleMenuClose(); }}>
                    <ListItemIcon><IconUserCheck fontSize="medium" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }} primary="Edit Class Teacher" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleViewStudents(currentSection)}>
                    <ListItemIcon><IconUsers fontSize="medium" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }} primary="View Students" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleViewSubjects(currentSection)}>
                    <ListItemIcon><IconBook fontSize="medium" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }} primary="View Subjects" />
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={() => { handleDeleteSection(currentSection); handleMenuClose(); }}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon><IconTrash fontSize="medium" color={theme.palette.error.main} /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }} primary="Delete Section" />
                </MenuItem>
            </Menu >


            {/* Create/Edit Class Modal */}
            < Dialog open={openCreateClassModal} onClose={() => handleClassFormClose(false)} maxWidth="md" fullWidth >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconSchool color="primary" />
                    {selectedClass ? 'Edit Class' : 'Create Class'}
                </DialogTitle>
                <ClassForm
                    classData={selectedClass}
                    loggedUser={loggedUser}
                    onClose={handleClassFormClose}
                />
            </Dialog >


            {/* Create/Edit Section Modal */}
            < Dialog open={openCreateSectionModal} onClose={() => handleSectionFormClose(false)} maxWidth="md" fullWidth >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconUsers color="primary" />
                    {selectedSection ? 'Edit Section' : 'Create Section'}
                </DialogTitle>
                {
                    selectedClass && (
                        <SectionForm
                            classData={selectedClass}
                            sectionData={selectedSection}
                            loggedUser={loggedUser}
                            onClose={handleSectionFormClose}
                        />
                    )
                }
            </Dialog >

            {/* View students for the selected sections - Modal */}
            < Dialog open={studentListViewModal} onClose={() => { setStudentListViewModal(false); setSelectedSection(null) }} maxWidth="md" fullWidth >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {selectedSection?.section_name}
                    <IconButton
                        onClick={() => { setStudentListViewModal(false); setSelectedSection(null) }}
                        sx={{ marginLeft: 'auto' }}
                        aria-label="close"
                    >
                        <IconX />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <StudentsListView selectedSection={selectedSection} />
                </DialogContent>
            </Dialog >


            {/* Delete dialog for Class */}
            < Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                    <WarningAmberIcon color="error" />
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: '1rem', color: 'text.primary' }}>
                        Are you sure you want to delete the Class <strong>"{selectedClass?.class_name}"</strong> ? The respective sections will also get deleted, This action is final and cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setConfirmOpen(false)}
                        variant="outlined"
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDeleteClass}
                        variant="contained"
                        color="error"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog >


            {/* Delete dialog for Section */}
            < Dialog open={confirmOpenSection} onClose={() => setConfirmOpenSection(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                    <WarningAmberIcon color="error" />
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: '1rem', color: 'text.primary' }}>
                        Are you sure you want to delete the section <strong>"{selectedSection?.section_name}"</strong>  ? This action is final and cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setConfirmOpenSection(false)}
                        variant="outlined"
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDeleteSection}
                        variant="contained"
                        color="error"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog >
        </>
    );
}
export default Classes;