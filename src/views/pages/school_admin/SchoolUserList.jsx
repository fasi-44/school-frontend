import React, { useEffect, useState } from 'react';
import { Table, Tag, Button } from 'antd';
import { useSelector } from 'react-redux';
import customAxios from '../../../utils/axiosConfig';
import { ROLES_API_BASE_URL, USER_ROLES_API_BASE_URL, USERS_API_BASE_URL } from '../../../ApiConstants';
import Loader from '../../../ui-component/Loader';
import { Avatar, Box, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fade, FormControl, FormControlLabel, Grid, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Radio, RadioGroup, Tooltip, Typography } from '@mui/material';
import MainCard from '../../../ui-component/cards/MainCard';
import { IconEdit, IconEyeShare, IconShieldCheck, IconTrash, IconX } from '@tabler/icons-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router';

const SchoolUserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuRowData, setMenuRowData] = useState(null);
    const [showRoleAssignDialog, setShowRoleAssignDialog] = useState(false);
    const [viewUserDetailsDialog, setViewUserDetailsDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [userCurrentRole, setUserCurrentRole] = useState(null);
    const labelStyle = { fontWeight: 600, color: 'gray' };
    const columns = [
        {
            title: 'Name',
            dataIndex: 'full_name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: ['role', 'role_name'],
            key: 'role',
            render: (role) => <Tag color="blue">{role}</Tag>,
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
        fetchSchoolUsers();
        fetchRoles();
    }, []);

    const fetchSchoolUsers = async () => {
        setLoading(true);
        try {
            const response = await customAxios.get(USERS_API_BASE_URL + "/list/" + loggedUser?.skid);
            if (response.data.code === 200 && response.data.status === 'success') {
                setUsers(response.data.users);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(ROLES_API_BASE_URL + '/list/' + loggedUser?.skid);
            setRoles(response.data.data);
        } catch (error) {
            console.error('An error occurred:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event, row) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuRowData(row);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setMenuRowData(null);
    };

    const handleEditUser = (record) => {
        if (record?.role?.id && record?.role?.role_code === "STUDENT") {
            navigate(`/student/update/${record.id}`, { state: { user: record, mode: 'update' } });
        } else if (record?.role?.id && record?.role?.role_code === "TEACHER") {
            navigate('/teacher/update', { state: { user: record, mode: 'update' } })
        } else if (record?.role?.id && record?.role?.role_code === "SCHOOL_ADMIN") {
            navigate('/teacher/update', { state: { user: record, mode: 'update' } })
        }
    }

    const handleViewUserDialog = (record) => {
        setSelectedUser(record);
        setViewUserDetailsDialog(true);
    }

    const handleAssignRoleDialog = async (record) => {
        setSelectedUser(record);
        setShowRoleAssignDialog(true);
        // await fetchUserRoles(record.id);
    };

    const handleRoleChange = (event) => {
        setSelectedRole(parseInt(event.target.value));
    };

    const handleAssignRoles = async () => {
        if (!selectedUser || !selectedRole) {
            message.warning('Please select a role');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                user_id: selectedUser.id,
                role_id: selectedRole
            }
            const response = await customAxios.post(USER_ROLES_API_BASE_URL + "/assign-role/" + loggedUser?.skid, payload);

            if (response.data.code === 200 && response.data.status === 'success') {
                // message.success('Role assigned successfully');
                setShowRoleAssignDialog(false);
                setSelectedUser(null);
                setSelectedRole(null);
                setUserCurrentRole(null);
                await fetchSchoolUsers(); // Refresh the user list
            } else {
                message.error(response.data.message || 'Failed to assign role');
            }
        } catch (err) {
            console.error('Error assigning role:', err);
            message.error('Failed to assign role');
        } finally {
            setLoading(false);
        }
    };
    const handleCancelRoleAssignment = () => {
        setShowRoleAssignDialog(false);
        setSelectedUser(null);
        setSelectedRole(null);
        setUserCurrentRole(null);
    };

    const handleDeleteUser = () => { }

    return (
        <>
            <Loader loading={loading} />
            <Fade in timeout={600}>
                <MainCard title={'School Users List'}>
                    <Table
                        dataSource={users}
                        columns={columns}
                        rowKey="id"
                        bordered
                        size='small'
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 680, y: 400 }}
                    />
                </MainCard>
            </Fade>

            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => { handleEditUser(menuRowData); handleMenuClose(); }}>
                    <ListItemIcon><IconEdit fontSize="medium" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }}>Edit User </ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleViewUserDialog(menuRowData); handleMenuClose(); }}>
                    <ListItemIcon><IconEyeShare fontSize="medium" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }}>View User </ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleAssignRoleDialog(menuRowData); handleMenuClose(); }}>
                    <ListItemIcon><IconShieldCheck fontSize="medium" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }}>Assign Role </ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleDeleteUser(menuRowData); handleMenuClose(); }}>
                    <ListItemIcon><IconTrash fontSize="medium" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }}>Delete User </ListItemText>
                </MenuItem>
            </Menu>

            {/* Role Assignment Dialog */}
            <Dialog
                open={showRoleAssignDialog}
                onClose={handleCancelRoleAssignment}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Assign Role to {selectedUser?.full_name}
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            User: {selectedUser?.email}
                        </Typography>

                        {userCurrentRole && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Current Role:
                                </Typography>
                                <Chip
                                    label={userCurrentRole.role_name}
                                    color="primary"
                                    size="small"
                                />
                            </Box>
                        )}
                    </Box>

                    <FormControl component="fieldset" fullWidth>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Select New Role:
                        </Typography>
                        <RadioGroup
                            value={selectedRole || ''}
                            onChange={handleRoleChange}
                        >
                            {roles?.map((role) => (
                                <FormControlLabel
                                    key={role.id}
                                    value={role.id}
                                    control={<Radio />}
                                    label={
                                        <Box>
                                            <Typography variant="body1" fontWeight="medium">
                                                {role.role_name}
                                            </Typography>
                                            {role.description && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {role.description}
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCancelRoleAssignment}
                        color="default"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssignRoles}
                        type="primary"
                        disabled={!selectedRole}
                    >
                        Assign Role
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View students for the selected sectiions - Modal */}
            <Dialog open={viewUserDetailsDialog} onClose={() => setViewUserDetailsDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#1976d2', color: 'white' }}>
                            {selectedUser?.first_name[0]}
                        </Avatar>
                        <Box>
                            <Typography variant="h6">{selectedUser?.full_name}</Typography>
                            <Typography variant="caption" color="textSecondary">{selectedUser?.email}</Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={() => setViewUserDetailsDialog(false)}
                        sx={{ marginLeft: 'auto' }}
                        aria-label="close"
                    >
                        <IconX />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <Typography sx={labelStyle}>Role</Typography>
                            <Chip label={selectedUser?.role?.role_name || 'N/A'} color="primary" size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography sx={labelStyle}>Phone Number</Typography>
                            <Typography>{selectedUser?.phone_number || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography sx={labelStyle}>Date of Birth</Typography>
                            <Typography>{selectedUser?.date_of_birth || 'N/A'}</Typography>
                        </Grid>
                        {selectedUser?.profile?.admission_date && (
                            <Grid item xs={12} sm={6}>
                                <Typography sx={labelStyle}>Admission Date</Typography>
                                <Typography>{selectedUser?.profile.admission_date}</Typography>
                            </Grid>
                        )}
                        {selectedUser?.profile?.class_name && (
                            <Grid item xs={12} sm={6}>
                                <Typography sx={labelStyle}>Class</Typography>
                                <Typography>{selectedUser?.profile.class_name}</Typography>
                            </Grid>
                        )}
                        {selectedUser?.profile?.section_name && (
                            <Grid item xs={12} sm={6}>
                                <Typography sx={labelStyle}>Section</Typography>
                                <Typography>{selectedUser?.profile.section_name}</Typography>
                            </Grid>
                        )}
                        {selectedUser?.profile?.qualification && (
                            <Grid item xs={12} sm={6}>
                                <Typography sx={labelStyle}>Qualification</Typography>
                                <Typography>{selectedUser?.profile.qualification}</Typography>
                            </Grid>
                        )}
                        {selectedUser?.profile?.designation && (
                            <Grid item xs={12} sm={6}>
                                <Typography sx={labelStyle}>Designation</Typography>
                                <Typography>{selectedUser?.profile.designation}</Typography>
                            </Grid>
                        )}
                        {selectedUser?.address && (
                            <Grid item xs={12}>
                                <Typography sx={labelStyle}>Address</Typography>
                                <Typography>{selectedUser.address}</Typography>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
            </Dialog>

        </>
    );
};

export default SchoolUserList;
