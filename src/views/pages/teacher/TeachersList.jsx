import React, { useEffect, useState } from 'react';
import { Table, Tag } from 'antd';
import { useSelector } from 'react-redux';
import customAxios from '../../../utils/axiosConfig';
import { TEACHERS_API_BASE_URL } from '../../../ApiConstants';
import Loader from '../../../ui-component/Loader';
import { useNavigate } from 'react-router';
import {
    IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Box, Typography, Grid, Avatar, Chip, Divider as MuiDivider
} from '@mui/material';
import { IconEdit, IconEyeShare, IconTrash, IconUser, IconX } from '@tabler/icons-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Divider } from 'antd';

const TeachersList = () => {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuRowData, setMenuRowData] = useState(null);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'full_name',
            key: 'name',
            sorter: (a, b) => a.full_name.localeCompare(b.full_name)
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Phone Number',
            dataIndex: 'phone_number',
            key: 'phone_number',
            render: (phone) => phone || 'N/A'
        },
        {
            title: 'Employee ID',
            dataIndex: ['profile', 'employee_id'],
            key: 'employee_id',
            render: (id) => id || 'N/A'
        },
        {
            title: 'Qualifications',
            dataIndex: ['profile', 'qualifications'],
            key: 'qualifications',
            render: (qual) => qual || 'N/A'
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (is_active) => (
                <Tag color={is_active ? 'green' : 'red'}>
                    {is_active ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Tooltip title="More actions">
                    <IconButton onClick={(event) => handleMenuOpen(event, record)}>
                        <MoreVertIcon />
                    </IconButton>
                </Tooltip>
            )
        },
    ];

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await customAxios.get(`${TEACHERS_API_BASE_URL}/list/${loggedUser?.skid}`);
            if (response.data.code === 200 && response.data.status === 'success') {
                setTeachers(response.data.teachers);
            }
        } catch (err) {
            console.error('Error fetching teachers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewTeacherDialog = (record) => {
        setSelectedTeacher(record);
        setOpenViewDialog(true);
        handleMenuClose();
    };

    const handleMenuOpen = (event, row) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuRowData(row);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setMenuRowData(null);
    };

    const handleEditTeacher = (record) => {
        navigate(`/teacher/update`, { state: { user: record, mode: 'update' } });
        handleMenuClose();
    };

    const handleDeleteTeacher = (record) => {
        setSelectedTeacher(record);
        setOpenDeleteDialog(true);
        handleMenuClose();
    };

    const confirmDeleteTeacher = async () => {
        try {
            setLoading(true);
            const response = await customAxios.delete(
                `${TEACHERS_API_BASE_URL}/delete/${loggedUser?.skid}/${selectedTeacher.id}`
            );
            if (response.data.code === 200 && response.data.status === 'success') {
                // Show success message
                fetchTeachers();
            }
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting teacher:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Loader loading={loading} />
            <Table
                dataSource={teachers}
                columns={columns}
                rowKey="id"
                bordered
                size='small'
                pagination={{ pageSize: 10 }}
                scroll={{ x: 680, y: 400 }}
                locale={{ emptyText: 'No teachers found' }}
            />

            {/* Actions Menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => handleViewTeacherDialog(menuRowData)}>
                    <ListItemIcon><IconEyeShare fontSize="medium" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }}>View Teacher</ListItemText>
                </MenuItem>
                <MuiDivider />
                <MenuItem onClick={() => handleEditTeacher(menuRowData)}>
                    <ListItemIcon><IconEdit fontSize="medium" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }}>Edit Teacher</ListItemText>
                </MenuItem>
                <MuiDivider />
                <MenuItem onClick={() => handleDeleteTeacher(menuRowData)} sx={{ color: 'error.main' }}>
                    <ListItemIcon><IconTrash fontSize="medium" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }}>Delete Teacher</ListItemText>
                </MenuItem>
            </Menu>

            {/* View Teacher Dialog */}
            <Dialog
                open={openViewDialog}
                onClose={() => setOpenViewDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconUser size={24} />
                        <Typography variant="h5">Teacher Details</Typography>
                    </Box>
                    <IconButton onClick={() => setOpenViewDialog(false)} size="small">
                        <IconX />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    {selectedTeacher && (
                        <Box>
                            {/* Header with Avatar and Status */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: 'primary.main',
                                        fontSize: '2rem'
                                    }}
                                >
                                    {selectedTeacher.first_name?.[0]?.toUpperCase()}
                                    {selectedTeacher.last_name?.[0]?.toUpperCase()}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h4">
                                        {selectedTeacher.full_name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedTeacher.username}
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Chip
                                            label={selectedTeacher.is_active ? 'Active' : 'Inactive'}
                                            color={selectedTeacher.is_active ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            <MuiDivider sx={{ my: 2 }} />

                            {/* Basic Information */}
                            <Typography variant="h6" sx={{ mb: 2 }}>Basic Information</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Email
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedTeacher.email || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Phone Number
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedTeacher.phone_number || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Date of Birth
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedTeacher.date_of_birth || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Gender
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedTeacher.gender || 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <MuiDivider sx={{ my: 2 }} />

                            {/* Professional Information */}
                            <Typography variant="h6" sx={{ mb: 2 }}>Professional Information</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Employee ID
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedTeacher.profile?.employee_id || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Qualifications
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedTeacher.profile?.qualifications || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Department
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedTeacher.profile?.department || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Joining Date
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedTeacher.profile?.joining_date || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">
                                        Address
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedTeacher.address || 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {/* Subjects Taught (if available) */}
                            {selectedTeacher.subjects && selectedTeacher.subjects.length > 0 && (
                                <>
                                    <MuiDivider sx={{ my: 2 }} />
                                    <Typography variant="h6" sx={{ mb: 2 }}>Subjects Taught</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {selectedTeacher.subjects.map((subject, index) => (
                                            <Chip
                                                key={index}
                                                label={subject.subject_name}
                                                variant="outlined"
                                                color="primary"
                                            />
                                        ))}
                                    </Box>
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setOpenViewDialog(false)}
                        variant="outlined"
                        size="small"
                    >
                        Close
                    </Button>
                    <Button
                        onClick={() => {
                            setOpenViewDialog(false);
                            handleEditTeacher(selectedTeacher);
                        }}
                        variant="contained"
                        size="small"
                        startIcon={<IconEdit fontSize="medium" />}
                    >
                        Edit Teacher
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconTrash fontSize="medium" />
                    Delete Teacher
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{selectedTeacher?.full_name}"?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={confirmDeleteTeacher} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TeachersList;
