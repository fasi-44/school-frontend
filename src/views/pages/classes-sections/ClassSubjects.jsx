import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Table } from 'antd';
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Chip, IconButton, TextField, InputAdornment, Menu, MenuItem, ListItemIcon,
    ListItemText, Divider, Tooltip
} from '@mui/material';
import {
    IconArrowLeft, IconPlus, IconEdit, IconTrash, IconDotsVertical,
    IconSearch, IconBook
} from '@tabler/icons-react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MainCard from '../../../ui-component/cards/MainCard';
import SubjectForm from '../subjects/SubjectForm';
import customAxios from '../../../utils/axiosConfig';
import { SUBJECTS_API_BASE_URL } from '../../../ApiConstants';
import { useSelector } from 'react-redux';
import Loader from '../../../ui-component/Loader';
import { useTheme } from '@mui/material';
import { toast } from 'react-toastify';

function ClassSubjects() {
    const { classId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const { loggedUser } = useSelector((state) => state.globalState || {});

    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [openSubjectModal, setOpenSubjectModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    // State for MUI Menu
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentSubject, setCurrentSubject] = useState(null);
    const openMenu = Boolean(anchorEl);

    const { class: classData } = location.state || {};

    useEffect(() => {
        fetchClassSubjects();
    }, [classId]);

    const fetchClassSubjects = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${SUBJECTS_API_BASE_URL}/list/${loggedUser?.skid}/${classId}`
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

    const handleOpenSubjectForm = (subject = null) => {
        setSelectedSubject(subject);
        setOpenSubjectModal(true);
        handleMenuClose();
    };

    const handleDeleteSubject = (subject) => {
        setSelectedSubject(subject);
        setOpenDeleteDialog(true);
        handleMenuClose();
    };

    const confirmDeleteSubject = async () => {
        try {
            setLoading(true);
            const resp = await customAxios.delete(
                `${SUBJECTS_API_BASE_URL}/delete/subject/${loggedUser?.skid}/${selectedSubject.id}`
            );

            if (resp.data.code === 200 && resp.data.status === 'success') {
                toast.success('Subject deleted successfully');
                fetchClassSubjects();
            } else {
                toast.error(resp.data.message || 'Failed to delete subject');
            }
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting subject:', error);
            toast.error('Failed to delete subject');
        } finally {
            setLoading(false);
        }
    };

    const handleMenuClick = (event, subject) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setCurrentSubject(subject);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setCurrentSubject(null);
    };

    const handleSubjectFormClose = (shouldRefresh = false) => {
        setOpenSubjectModal(false);
        setSelectedSubject(null);
        if (shouldRefresh) {
            fetchClassSubjects();
        }
    };

    const filteredSubjects = subjects.filter(subject =>
        subject.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.subject_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            title: 'Subject Name',
            dataIndex: 'subject_name',
            key: 'subject_name',
            render: (text) => (
                <Typography variant="subtitle2" fontWeight={600}>
                    {text}
                </Typography>
            ),
        },
        {
            title: 'Subject Code',
            dataIndex: 'subject_code',
            key: 'subject_code',
        },
        {
            title: 'Teachers',
            key: 'teachers',
            render: (_, subject) => (
                <Typography variant="body2">
                    {subject.teachers?.length > 0
                        ? subject.teachers.map((t) => `${t.first_name} ${t.last_name}`).join(', ')
                        : 'Not Assigned'
                    }
                </Typography>
            ),
        },
        {
            title: 'Credits',
            dataIndex: 'credits',
            key: 'credits',
            align: 'center',
            render: (credits) => (
                <Chip
                    label={credits || 1}
                    size="small"
                    variant="outlined"
                />
            ),
        },
        {
            title: 'Grade Level',
            dataIndex: 'grade_level',
            key: 'grade_level',
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Tooltip title="More actions">
                    <IconButton size="small" onClick={(e) => handleMenuClick(e, record)}>
                        <MoreVertIcon />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    return (
        <>
            {loading && <Loader />}
            <MainCard
                title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => navigate(-1)} size="small">
                            <IconArrowLeft />
                        </IconButton>
                        <Box>
                            <Typography variant="h4">
                                {classData?.class_name} - All Subjects
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Managing all subjects for this class
                            </Typography>
                        </Box>
                    </Box>
                }
                secondary={
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<IconPlus size={18} />}
                        onClick={() => handleOpenSubjectForm()}
                    >
                        Create New Subject
                    </Button>
                }
            >
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Search subjects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IconSearch size={20} />
                                </InputAdornment>
                            ),
                        }}
                        size="small"
                    />
                </Box>

                {subjects.length === 0 && !loading ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <IconBook size={64} stroke={1.5} color={theme.palette.text.disabled} />
                        <Typography variant="h5" color="text.secondary" sx={{ mt: 2 }}>
                            No subjects available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                            No subjects have been created for {classData?.class_name} yet.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<IconPlus size={18} />}
                            onClick={() => handleOpenSubjectForm()}
                        >
                            Create First Subject
                        </Button>
                    </Box>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredSubjects}
                        rowKey="id"
                        size='small'
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} subjects`,
                        }}
                    />
                )}
            </MainCard>

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        minWidth: 200,
                        boxShadow: theme.shadows[8],
                        borderRadius: 2,
                        mt: 0.5
                    }
                }}
            >
                <MenuItem onClick={() => handleOpenSubjectForm(currentSubject)}>
                    <ListItemIcon><IconEdit fontSize="medium" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }} primary="Edit Subject" />
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={() => handleDeleteSubject(currentSubject)}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon>
                        <IconTrash fontSize="medium" color={theme.palette.error.main} />
                    </ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }} primary="Delete Subject" />
                </MenuItem>
            </Menu>

            {/* Create or Edit Subject Modal */}
            <Dialog
                open={openSubjectModal}
                onClose={() => handleSubjectFormClose(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {selectedSubject ? <IconEdit size={24} /> : <IconPlus size={24} />}
                    <Typography variant="h5">
                        {selectedSubject ? 'Edit Subject' : 'Create New Subject'}
                    </Typography>
                </DialogTitle>
                <SubjectForm
                    classData={classData}
                    subjectData={selectedSubject}
                    loggedUser={loggedUser}
                    onClose={handleSubjectFormClose}
                />
            </Dialog>

            {/* Delete Subject Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon color="error" />
                    Delete Subject
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to permanently delete "{selectedSubject?.subject_name}"?
                        This action cannot be undone and will remove the subject from all sections.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={confirmDeleteSubject} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ClassSubjects;
