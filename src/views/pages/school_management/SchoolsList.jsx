import React, { useEffect, useState } from "react";
import {
    styled, Box, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, Divider,
    DialogActions, Button, IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
    Fade
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from "react-router-dom";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import customAxios from "../../../utils/axiosConfig";
import MainCard from "../../../ui-component/cards/MainCard";
import SchoolAdminForm from "./schoolAdminForm";
import { ClipLoader } from 'react-spinners';
import Loader from "../../../ui-component/Loader";
import { SCHOOL_API_BASE_URL } from "../../../ApiConstants";

function SchoolsList() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [assignAdminOpen, setAssignAdminOpen] = useState(false);
    const [schoolForAdmin, setSchoolForAdmin] = useState(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuRowData, setMenuRowData] = useState(null);

    const handleMenuOpen = (event, row) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuRowData(row);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setMenuRowData(null);
    };


    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            setLoading(true);
            const resp = await customAxios.get(SCHOOL_API_BASE_URL + '/list');
            if (resp.data.code === 200 && resp.data.status === 'success') {
                const schools = resp.data.data.schools.map((school, index) => ({
                    ...school,
                    slNo: index + 1
                }));
                setRows(schools);
            }
        } catch (error) {
            console.error("Error fetching schools:", error);
            setRows([]);
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = (school) => {
        navigate('/school/update', { state: { school, mode: 'update' } });
    };

    const handleDelete = (school) => {
        setSelectedSchool(school);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setLoading(true);
            const resp = await customAxios.delete(SCHOOL_API_BASE_URL + '/delete/' + selectedSchool.id);
            if (resp.data.code === 200 && resp.data.status === 'success') {
                toast.success(resp.data.message || "School deleted successfully!");
                fetchSchools();
            } else {
                toast.error(resp.data.message || "Failed to delete school.");
            }
        } catch (err) {
            console.error("Delete error:", err);
            toast.error("Something went wrong.");
        } finally {
            setConfirmOpen(false);
            setLoading(false);
        }
    }

    const openAssignAdminModal = (school) => {
        setSchoolForAdmin(school);
        setAssignAdminOpen(true);
    };

    const columns = [
        { field: "slNo", headerName: "Sl. No", width: 70, align: "center" },
        { field: "name", headerName: "School Name", flex: 1, sortable: true },
        { field: "code", headerName: "Code", flex: 1 },
        { field: "city", headerName: "City", flex: 1 },
        { field: "phone", headerName: "phone", flex: 1 },
        { field: "plan", headerName: "Plan", flex: 1, sortable: true },
        {
            field: "actions",
            headerName: "Actions",
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Tooltip title="More actions">
                    <IconButton onClick={(event) => handleMenuOpen(event, params.row)}>
                        <MoreVertIcon />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    return (
        <>
            <Loader loading={loading} />
            <Fade in timeout={600}>
                <MainCard title={'School List'}>
                    <Box sx={{ height: 500, width: "100%" }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSize={5}
                            rowsPerPageOptions={[5, 10]}
                            disableSelectionOnClick
                        />
                    </Box>
                </MainCard>
            </Fade>

            {/* Confirmation dialog to Delete */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                    <WarningAmberIcon color="error" />
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: '1rem', color: 'text.primary' }}>
                        Are you sure you want to delete the school <strong>"{selectedSchool?.name}"</strong> ? This action is final and cannot be undone.
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
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create and Assign school admin */}
            <Dialog open={assignAdminOpen} onClose={() => setAssignAdminOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachFileIcon color="primary" />
                    Create and Assign School Admin to "{schoolForAdmin?.name}"
                </DialogTitle>
                {schoolForAdmin && (
                    <SchoolAdminForm
                        school={schoolForAdmin}
                        onClose={() => setAssignAdminOpen(false)}
                    />
                )}
            </Dialog>

            {/* Actions menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => { handleEdit(menuRowData); handleMenuClose(); }}>
                    <ListItemIcon><EditIcon fontSize="medium" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }}>Edit </ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleDelete(menuRowData); handleMenuClose(); }}>
                    <ListItemIcon><DeleteIcon fontSize="medium" color="error" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }}>Delete </ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { openAssignAdminModal(menuRowData); handleMenuClose(); }}>
                    <ListItemIcon><AttachFileIcon fontSize="medium" color="secondary" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }}>Assign Admin </ListItemText>
                </MenuItem>
            </Menu>

        </>
    );
}

export default SchoolsList;
