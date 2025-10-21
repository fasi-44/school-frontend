import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Table } from 'antd';
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Chip, IconButton, TextField, InputAdornment, Menu, MenuItem, ListItemIcon,
    ListItemText, Divider, Tooltip, Autocomplete, List, ListItem, ListItemAvatar,
    Avatar, ListItemSecondaryAction, Paper
} from '@mui/material';
import {
    IconArrowLeft, IconPlus, IconEdit, IconTrash, IconBookOff, IconDotsVertical,
    IconSearch, IconBook, IconX
} from '@tabler/icons-react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MainCard from '../../../ui-component/cards/MainCard';
import customAxios from '../../../utils/axiosConfig';
import { SUBJECTS_API_BASE_URL } from '../../../ApiConstants';
import { useSelector } from 'react-redux';
import Loader from '../../../ui-component/Loader';
import { useTheme } from '@mui/material';
import { toast } from 'react-toastify';

function SectionSubjects() {
    const { sectionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const { loggedUser } = useSelector((state) => state.globalState || {});

    const [subjects, setSubjects] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [selectedSubjectsToAdd, setSelectedSubjectsToAdd] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [openAddSubjectModal, setOpenAddSubjectModal] = useState(false);
    const [openRemoveDialog, setOpenRemoveDialog] = useState(false);

    // State for MUI Menu
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentSubject, setCurrentSubject] = useState(null);
    const openMenu = Boolean(anchorEl);

    const { section, class: classData } = location.state || {};

    useEffect(() => {
        fetchSectionSubjects();
    }, [sectionId]);

    const fetchSectionSubjects = async () => {
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

    const fetchAvailableSubjects = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${SUBJECTS_API_BASE_URL}/available/${loggedUser?.skid}/${sectionId}`
            );

            if (response.data.code === 200) {
                setAvailableSubjects(response.data.data || []);
            } else {
                toast.error('Failed to fetch available subjects');
            }
        } catch (error) {
            console.error('Error fetching available subjects:', error);
            toast.error('Failed to fetch available subjects');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddSubjectModal = () => {
        setSelectedSubjectsToAdd([]);
        fetchAvailableSubjects();
        setOpenAddSubjectModal(true);
    };

    const handleRemoveFromSelectedList = (subjectId) => {
        setSelectedSubjectsToAdd(prev => prev.filter(s => s.id !== subjectId));
    };

    const handleAddSubjects = async () => {
        if (selectedSubjectsToAdd.length === 0) {
            toast.warning('Please select at least one subject');
            return;
        }

        try {
            setLoading(true);
            const subjectIds = selectedSubjectsToAdd.map(s => s.id);

            const response = await customAxios.post(
                `${SUBJECTS_API_BASE_URL}/add-to-section/${loggedUser?.skid}/${sectionId}`,
                { subject_ids: subjectIds }
            );

            if (response.data.code === 200 && response.data.status === 'success') {
                toast.success(response.data.message || 'Subjects added successfully');
                fetchSectionSubjects();
                setOpenAddSubjectModal(false);
                setSelectedSubjectsToAdd([]);
            } else {
                toast.error(response.data.message || 'Failed to add subjects');
            }
        } catch (error) {
            console.error('Error adding subjects:', error);
            toast.error('Failed to add subjects to section');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSubject = (subject) => {
        setSelectedSubject(subject);
        setOpenRemoveDialog(true);
        handleMenuClose();
    };

    const confirmRemoveSubject = async () => {
        try {
            setLoading(true);
            const resp = await customAxios.put(
                `${SUBJECTS_API_BASE_URL}/remove-from-section/${loggedUser?.skid}/${sectionId}/${selectedSubject.id}`
            );

            if (resp.data.code === 200 && resp.data.status === 'success') {
                toast.success(resp.data.message || 'Subject removed successfully');
                fetchSectionSubjects();
            } else {
                toast.error(resp.data.message || 'Failed to remove subject');
            }
            setOpenRemoveDialog(false);
        } catch (error) {
            console.error('Error removing subject:', error);
            toast.error('Failed to remove subject from section');
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
                                {classData?.class_name} - {section?.section_name} Subjects
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Managing subjects for this section
                            </Typography>
                        </Box>
                    </Box>
                }
                secondary={
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<IconPlus size={18} />}
                        onClick={handleOpenAddSubjectModal}
                    >
                        Add Subjects
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

                <Table
                    columns={columns}
                    dataSource={filteredSubjects}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} subjects`,
                    }}
                    size='small'
                />
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
                <MenuItem onClick={() => handleRemoveSubject(currentSubject)}>
                    <ListItemIcon><IconBookOff size={18} /></ListItemIcon>
                    <ListItemText primary="Remove from Section" />
                </MenuItem>
            </Menu>

            {/* Add Subjects Modal */}
            <Dialog
                open={openAddSubjectModal}
                onClose={() => setOpenAddSubjectModal(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconBook size={24} />
                        <Typography variant="h5">
                            Add Subjects to {section?.section_name}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setOpenAddSubjectModal(false)} size="small">
                        <IconX />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Select Subjects from {classData?.class_name}
                        </Typography>
                        <Autocomplete
                            options={availableSubjects}
                            getOptionLabel={(option) => `${option.subject_name} (${option.subject_code})`}
                            loading={loading}
                            renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                            <IconBook size={18} />
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {option.subject_name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Code: {option.subject_code} • Credits: {option.credits || 1}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                            onChange={(event, value) => {
                                if (value && !selectedSubjectsToAdd.find(s => s.id === value.id)) {
                                    setSelectedSubjectsToAdd([...selectedSubjectsToAdd, value]);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Search and select subjects..."
                                    variant="outlined"
                                />
                            )}
                            value={null}
                            disabled={loading}
                        />
                    </Box>

                    {/* Selected Subjects List */}
                    {selectedSubjectsToAdd.length > 0 ? (
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Selected Subjects ({selectedSubjectsToAdd.length})
                            </Typography>
                            <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                                <List>
                                    {selectedSubjectsToAdd.map((subject, index) => (
                                        <React.Fragment key={subject.id}>
                                            <ListItem>
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                        <IconBook size={18} />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {subject.subject_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {subject.subject_code} • {subject.credits || 1} Credits
                                                    </Typography>
                                                </Box>
                                                <ListItemSecondaryAction>
                                                    <IconButton
                                                        edge="end"
                                                        size="small"
                                                        onClick={() => handleRemoveFromSelectedList(subject.id)}
                                                        sx={{ color: 'error.main' }}
                                                    >
                                                        <IconX size={18} />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                            {index < selectedSubjectsToAdd.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            </Paper>
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <IconBook size={48} stroke={1.5} color={theme.palette.text.disabled} />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                No subjects selected yet. Search and select subjects from the dropdown above.
                            </Typography>
                        </Box>
                    )}

                    {availableSubjects.length === 0 && !loading && (
                        <Box sx={{
                            textAlign: 'center',
                            py: 4,
                            bgcolor: 'warning.lighter',
                            borderRadius: 2,
                            mt: 2
                        }}>
                            <Typography variant="body2" color="warning.dark">
                                ⚠️ All subjects from {classData?.class_name} are already added to this section.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setOpenAddSubjectModal(false)} variant="outlined" disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color='primary'
                        onClick={handleAddSubjects}
                        disabled={selectedSubjectsToAdd.length === 0 || loading}
                        startIcon={<IconPlus size={18} />}
                    >
                        Add {selectedSubjectsToAdd.length > 0 ? `(${selectedSubjectsToAdd.length})` : ''} Subjects
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Remove Subject Dialog */}
            <Dialog open={openRemoveDialog} onClose={() => setOpenRemoveDialog(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon color="warning" />
                    Remove Subject
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to remove "{selectedSubject?.subject_name}" from this section?
                        The subject will not be deleted but will be unassigned from this section.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRemoveDialog(false)} variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={confirmRemoveSubject} variant="contained" color="warning">
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default SectionSubjects;
