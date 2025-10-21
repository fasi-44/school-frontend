import React, { useEffect, useState, useRef } from 'react';
import { Table, Tag, message } from 'antd';
import {
    IconButton,
    Tooltip,
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useSelector } from 'react-redux';
import customAxios from '../../../utils/axiosConfig';
import { TIME_TABLE_API_BASE_URL } from '../../../ApiConstants';
import Loader from '../../../ui-component/Loader';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';
import { IconEdit, IconEyeShare, IconTrash, IconPrinter } from '@tabler/icons-react';
import { schoolData } from '../../../AppConstants';
import { generateTimetablePdf } from '../../../prints/timetablePdfGenerator';

const TimetableList = () => {
    const navigate = useNavigate();
    const printRef = useRef();
    const [timetables, setTimetables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, record: null });
    const [printData, setPrintData] = useState(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuRowData, setMenuRowData] = useState(null);
    const { loggedUser } = useSelector((state) => state.globalState || {});

    const columns = [
        {
            title: '#',
            key: 'index',
            width: 60,
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Class',
            dataIndex: 'class_name',
            key: 'class_name',
            sorter: (a, b) => a.class_name.localeCompare(b.class_name),
            render: (text) => (
                <Typography variant="body2" fontWeight={500}>
                    {text}
                </Typography>
            )
        },
        {
            title: 'Section',
            dataIndex: 'section_name',
            key: 'section_name',
            sorter: (a, b) => a.section_name.localeCompare(b.section_name),
        },
        {
            title: 'Academic Year',
            dataIndex: 'academic_year',
            key: 'academic_year',
            sorter: (a, b) => a.academic_year.localeCompare(b.academic_year),
        },
        {
            title: 'Semester',
            dataIndex: 'semester',
            key: 'semester',
            width: 100,
            render: (semester) => `Sem ${semester}`,
            sorter: (a, b) => a.semester - b.semester,
        },
        {
            title: 'Status',
            dataIndex: 'is_draft',
            key: 'is_draft',
            width: 100,
            render: (is_draft) => (
                <Tag color={is_draft ? 'orange' : 'green'}>
                    {is_draft ? 'Draft' : 'Final'}
                </Tag>
            ),
            filters: [
                { text: 'Draft', value: true },
                { text: 'Final', value: false },
            ],
            onFilter: (value, record) => record.is_draft === value,
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 160,
            render: (date) => dayjs(date).format('DD MMM YYYY, HH:mm'),
            sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Tooltip title="More actions">
                    <IconButton onClick={(event) => handleMenuOpen(event, record)}>
                        <MoreVertIcon />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    useEffect(() => {
        fetchTimetables();
    }, []);

    const fetchTimetables = async () => {
        setLoading(true);
        try {
            const response = await customAxios.get(`${TIME_TABLE_API_BASE_URL}/list/${loggedUser?.skid}`);
            if (response.data.code === 200 && response.data.status === 'success') {
                const timetableData = response.data.timetables || response.data.data || [];
                setTimetables(timetableData);
            }
        } catch (err) {
            console.error('Error fetching timetables:', err);
            message.error('Failed to fetch timetables');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (record) => {
        navigate(`/timetable/view/${record.id}`, {
            state: {
                timetable: record,
                mode: 'view'
            }
        });
    };

    const handleEdit = (record) => {
        navigate(`/timetable/edit/${record.id}`, {
            state: {
                timetable: record,
                mode: 'edit',
                isDraft: true
            }
        });
    };

    const handleDelete = async () => {
        const { record } = deleteDialog;
        setLoading(true);
        try {
            const response = await customAxios.delete(
                `${TIME_TABLE_API_BASE_URL}/delete/${loggedUser?.skid}/${record.id}`
            );

            if (response.data.code === 200 && response.data.status === 'success') {
                message.success('Timetable deleted successfully');
                fetchTimetables();
                setDeleteDialog({ open: false, record: null });
            } else {
                message.error(response.data.message || 'Failed to delete timetable');
            }
        } catch (err) {
            console.error('Error deleting timetable:', err);
            message.error('Failed to delete timetable');
        } finally {
            setLoading(false);
        }
    };

    const handlePrintTimetable = async (record) => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${TIME_TABLE_API_BASE_URL}/view/${loggedUser?.skid}/${record.id}`
            );

            if (response.data.code === 200 && response.data.status === 'success') {
                await generateTimetablePdf(response.data.data, schoolData, 'print');
            }
        } catch (err) {
            console.error('Error fetching timetable for print:', err);
            message.error('Failed to load timetable for printing');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
    };

    const handleMenuOpen = (event, row) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuRowData(row);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setMenuRowData(null);
    };

    return (
        <>
            <Loader loading={loading} />
            <Table
                dataSource={timetables}
                columns={columns}
                rowKey="id"
                bordered
                size="small"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
                scroll={{ x: 1200, y: 450 }}
                locale={{ emptyText: 'No timetables found. Create your first timetable!' }}
                rowClassName={(record) => record.is_draft ? 'draft-row' : 'final-row'}
            />

            {/* Menu for Actions */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => {
                    handleView(menuRowData);
                    handleMenuClose();
                }}>
                    <ListItemIcon>
                        <IconEyeShare size={20} />
                    </ListItemIcon>
                    <ListItemText>View Timetable</ListItemText>
                </MenuItem>

                {menuRowData?.is_draft && (
                    <>
                        <Divider />
                        <MenuItem onClick={() => {
                            handleEdit(menuRowData);
                            handleMenuClose();
                        }}>
                            <ListItemIcon>
                                <IconEdit size={20} />
                            </ListItemIcon>
                            <ListItemText>Edit Draft</ListItemText>
                        </MenuItem>
                    </>
                )}

                <Divider />
                <MenuItem onClick={() => {
                    handlePrintTimetable(menuRowData);
                    handleMenuClose();
                }}>
                    <ListItemIcon>
                        <IconPrinter size={20} />
                    </ListItemIcon>
                    <ListItemText>Print Timetable</ListItemText>
                </MenuItem>

                <Divider />
                <MenuItem onClick={() => {
                    setDeleteDialog({ open: true, record: menuRowData });
                    handleMenuClose();
                }}>
                    <ListItemIcon>
                        <IconTrash size={20} color="red" />
                    </ListItemIcon>
                    <ListItemText sx={{ color: 'error.main' }}>
                        Delete Timetable
                    </ListItemText>
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, record: null })}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Delete Timetable</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this {deleteDialog.record?.is_draft ? 'draft' : 'timetable'}?
                    </Typography>
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="body2">
                            <strong>Class:</strong> {deleteDialog.record?.class_name}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Section:</strong> {deleteDialog.record?.section_name}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Year:</strong> {deleteDialog.record?.academic_year}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialog({ open: false, record: null })}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        sx={{ textTransform: 'none' }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    );
};

export default TimetableList;