import React, { useEffect, useState } from 'react';
import { Table, Tag } from 'antd';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Switch,
    Checkbox,
    Typography,
    Grid,
    Stack,
    IconButton,
    Fade,
    DialogContentText,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Tooltip
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MainCard from '../../../ui-component/cards/MainCard';
import { permission } from './permission';
import customAxios from '../../../utils/axiosConfig';
import { ROLES_API_BASE_URL } from '../../../ApiConstants';
import { useSelector } from 'react-redux';
import Loader from '../../../ui-component/Loader';
import { IconEdit, IconPlus, IconShieldCheck, IconShieldCheckFilled, IconTrash } from '@tabler/icons-react';

const RolesAndPermissions = () => {
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const [RoleList, setRoleList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [showRoleCreateModal, setShowRoleCreateModal] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [newRoleForm, setNewRoleForm] = useState({
        role_name: '',
        description: '',
    });
    const [permissionsForm, setPermissionsForm] = useState({
        permissions: [],
    });
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuRowData, setMenuRowData] = useState(null);


    useEffect(() => {
        getAllRoleList();
    }, []);

    const getAllRoleList = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(ROLES_API_BASE_URL + '/list/' + loggedUser?.skid);
            setRoleList(response.data.data);
        } catch (error) {
            console.error('An error occurred:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewRoleForm({ ...newRoleForm, [name]: value });
    };

    const handlePermissionChange = (permission) => {
        setPermissionsForm(prev => ({
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    const handleCreateRole = async () => {
        try {
            if (selectedRole?.id) {
                setLoading(true);
                const updatedRole = {
                    role_name: newRoleForm.role_name.trim(),
                    description: newRoleForm.description,
                };
                const resp = await customAxios.put(ROLES_API_BASE_URL + '/update/role/' + loggedUser?.skid + '/' + selectedRole.id, updatedRole);
                if (resp?.data?.code == 200 && resp?.data?.status === 'success') {
                    getAllRoleList();
                }
            } else {
                setLoading(true);
                const newRole = {
                    role_name: newRoleForm.role_name.trim(),
                    role_code: newRoleForm.role_name.trim().toUpperCase().replace(/\s+/g, '_'),
                    description: newRoleForm.description,
                    permissions: [],
                };

                const resp = await customAxios.post(ROLES_API_BASE_URL + '/create/role/' + loggedUser?.skid, newRole);
                if (resp?.data?.code == 200 && resp?.data?.status === 'success') {
                    getAllRoleList();
                }
            }
        } catch (error) {
            console.error('An error occurred:', error);
        } finally {
            setNewRoleForm({ name: '', description: '' });
            setShowRoleCreateModal(false);
            setLoading(false);
        }
    };

    const handlePermissionsDialog = (role) => {
        setSelectedRole(role);
        setPermissionsForm({ permissions: role.permissions || [] });
        setShowPermissionsModal(true);
    };

    const handleEditRole = (role) => {
        console.log(role)
        setSelectedRole(role);
        setNewRoleForm(role)
        setShowRoleCreateModal(true);
    }

    const savePermissions = async () => {
        try {
            setLoading(true);
            const payload = {
                permissions: permissionsForm.permissions
            };
            const resp = await customAxios.put(ROLES_API_BASE_URL + '/addPermissionsToRole/' + loggedUser.skid + '/' + selectedRole.id, payload);
            if (resp?.data?.code == 200 && resp?.data?.status === 'success') {
                getAllRoleList();
            }
        } catch (error) {
            console.error('Failed to save permissions:', error);
        } finally {
            setShowPermissionsModal(false);
            setSelectedRole(null);
            setLoading(false);
        }
    };


    const toggleRoleStatus = async (id) => {
        try {
            setLoading(true);
            const resp = await customAxios.patch(ROLES_API_BASE_URL + '/toggleRole/' + loggedUser?.skid + '/' + id);
            if (resp?.data?.code == 200 && resp?.data?.status === 'success') {
                getAllRoleList();
            }
        } catch (error) {
            console.error('An error occurred:', error);
        } finally {
            setDeleteDialogOpen(false);
            setSelectedRole(null);
            setLoading(false);
        }
    };

    const handleDeleteClick = (role) => {
        setSelectedRole(role);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            setLoading(true);
            const resp = await customAxios.delete(ROLES_API_BASE_URL + '/delete/role/' + loggedUser?.skid + '/' + selectedRole.id);
            if (resp?.data?.code == 200 && resp?.data?.status === 'success') {
                getAllRoleList();
            }
        } catch (error) {
            console.error('An error occurred:', error);
        } finally {
            setDeleteDialogOpen(false);
            setSelectedRole(null);
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

    const columns = [
        {
            title: 'Role Name',
            dataIndex: 'role_name',
            key: 'role_name',
            render: (text) => <Typography variant="subtitle2" fontWeight="bold">{text}</Typography>,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text) => <Typography variant="body2" color="text.secondary">{text}</Typography>,
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
            title: 'Toggle Status',
            key: 'is_active',
            render: (_, record) => (
                <Switch
                    checked={record.is_active}
                    onChange={() => toggleRoleStatus(record.id)}
                    size="small"
                    disabled={!menuRowData?.is_system_role}
                />
            )
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

    return (
        <>
            <Loader loading={loading} />
            <Fade in timeout={600}>
                <MainCard title={'Role List & Permissions Management'}>
                    <Grid container style={{ float: 'inline-end' }}>
                        <Grid item >
                            <Button
                                variant="contained"
                                startIcon={<IconPlus />}
                                onClick={() => setShowRoleCreateModal(true)}
                            >
                                Create Role
                            </Button>
                        </Grid>
                    </Grid>
                    <br />
                    <Table
                        dataSource={RoleList}
                        columns={columns}
                        bordered
                        rowKey="id"
                        size='small'
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} Roles`
                        }}
                    />
                </MainCard>
            </Fade>

            {/* Create Role Dialog */}
            <Dialog open={showRoleCreateModal} onClose={() => setShowRoleCreateModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconShieldCheckFilled />
                    {selectedRole?.id ? ("Edit Role - " + selectedRole?.role_name) : "Create New Role"}
                </DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        label="Role Name"
                        name="role_name"
                        value={newRoleForm.role_name}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={newRoleForm.description}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowRoleCreateModal(false)} color="error" variant='outlined'>Cancel</Button>
                    <Button onClick={handleCreateRole} variant="contained">
                        {selectedRole?.id ? "Update Role" : "Create Role"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Permissions Dialog */}
            <Dialog open={showPermissionsModal} onClose={() => setShowPermissionsModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>Set Permissions for: {selectedRole?.role_name}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2}>
                        {Object.entries(permission).map(([group, items]) => (
                            <div key={group}>
                                <Typography variant="subtitle1" fontWeight="bold">{group}</Typography>
                                <Grid container spacing={1}>
                                    {items.map(({ label, value }) => (
                                        <Grid item xs={12} sm={6} md={4} key={value}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={permissionsForm.permissions.includes(value)}
                                                        onChange={() => handlePermissionChange(value)}
                                                    />
                                                }
                                                label={label}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </div>
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowPermissionsModal(false)} color="primary">Cancel</Button>
                    <Button onClick={savePermissions} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                    <WarningAmberIcon color="error" />
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: '1rem', color: 'text.primary' }}>
                        Are you sure you want to delete the role "{selectedRole?.role_name}"?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        variant="outlined"
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={confirmDelete}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Actions menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {!menuRowData?.is_system_role && <>
                    <MenuItem onClick={() => { handleEditRole(menuRowData); handleMenuClose(); }}>
                        <ListItemIcon><IconEdit fontSize="medium" /></ListItemIcon>
                        <ListItemText primaryTypographyProps={{ fontSize: '1rem' }}>Edit Role </ListItemText>
                    </MenuItem>
                    <Divider />
                </>}
                <MenuItem onClick={() => { handlePermissionsDialog(menuRowData); handleMenuClose(); }}>
                    <ListItemIcon><IconShieldCheck fontSize="medium" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }}>Add Permissions </ListItemText>
                </MenuItem>
                {!menuRowData?.is_system_role && <>
                    <Divider />
                    <MenuItem onClick={() => { handleDeleteClick(menuRowData); handleMenuClose(); }}>
                        <ListItemIcon><IconTrash fontSize="medium" /></ListItemIcon>
                        <ListItemText primaryTypographyProps={{ fontSize: '1rem' }}>Delete Role </ListItemText>
                    </MenuItem>
                </>}
            </Menu>
        </>
    );
};

export default RolesAndPermissions;
