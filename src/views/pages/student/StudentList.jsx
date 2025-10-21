

import { Table } from 'antd';
import React, { useEffect, useState } from 'react'
import { STUDENTS_API_BASE_URL } from '../../../ApiConstants';
import customAxios from '../../../utils/axiosConfig';
import { useSelector } from 'react-redux';
import {
    Divider,  IconButton,
    ListItemIcon, ListItemText, Menu, MenuItem, Tooltip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconEdit, IconEyeShare, IconTrash, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import StudentDetailsDialog from './StudentDetailsDialog';
import Loader from '../../../ui-component/Loader';

const StudentsList = () => {
    const navigate = useNavigate();
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const [studentList, setStudentList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuRowData, setMenuRowData] = useState(null);
    const [viewStudentDetailsDialog, setViewStudentDetailsDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const labelStyle = { fontWeight: 600, color: 'gray' };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'full_name',
            key: 'name',
            sorter: (a, b) => a.full_name.localeCompare(b.full_name)
        },
        {
            title: 'Roll No',
            dataIndex: ['profile', 'roll_no'],
            key: 'roll_no',
            sorter: (a, b) => a.roll_no.localeCompare(b.student_id)
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            sorter: (a, b) => a.gender.localeCompare(b.gender)
        },
        {
            title: 'Class',
            dataIndex: ['class', 'class_name'],
            key: 'class_name',
            sorter: (a, b) => a.class_name.localeCompare(b.class_name)
        },
        {
            title: 'Section',
            dataIndex: ['section', 'section_name'],
            key: 'section_name',
            sorter: (a, b) => a.section_name.localeCompare(b.section_name)
        },
        {
            title: 'Phone Number',
            dataIndex: 'phone',
            key: 'phone',
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
        fetchStudents();
    }, [])

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const resp = await customAxios.get(STUDENTS_API_BASE_URL + '/list/' + loggedUser?.skid);
            if (resp?.data?.code === 200 && resp?.data?.status === 'success') {
                setStudentList(resp?.data.students)
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
            // toast.error('Error fetching sections');
        } finally {
            setLoading(false);
        }
    }

    const handleMenuOpen = (event, row) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuRowData(row);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setMenuRowData(null);
    };

    const handleViewStudentDialog = async (record) => {
        try {
            setLoading(true);
            const response = await customAxios.get(STUDENTS_API_BASE_URL + '/get-by-id/' + loggedUser?.skid + '/' + record.id);
            if (response.data.code === 200 && response.data.status === 'success') {
                setSelectedStudent(response.data.student);
                setViewStudentDetailsDialog(true);
            }
        } catch (error) {
            console.error('Error fetching student:', error);
            toast.error('Error fetching student');
        } finally {
            setLoading(false);
        }
    };


    const handleEditStudent = (record) => {
        navigate(`/student/update/${record.id}`, { state: { user: record, mode: 'update' } });
    }

    const handleDeleteStudent = () => { }

    return (
        <>
            <Loader loading={loading} />
            <Table
                onRow={(record) => {
                    return {
                        onClick: (e) => {
                            if (e.target.cellIndex >= 0)
                                handleViewStudentDialog(record)
                        }, // click row
                    };
                }}
                dataSource={studentList}
                columns={columns}
                loading={loading}
                rowKey="id"
                bordered
                size='small'
                pagination={{ pageSize: 10 }}
            />

            <StudentDetailsDialog
                open={viewStudentDetailsDialog}
                onClose={() => setViewStudentDetailsDialog(false)}
                student={selectedStudent}
                onEdit={handleEditStudent}
            />

            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => { handleViewStudentDialog(menuRowData); handleMenuClose(); }}>
                    <ListItemIcon><IconEyeShare fontSize="medium" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }}>View Student </ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleEditStudent(menuRowData); handleMenuClose(); }}>
                    <ListItemIcon><IconEdit fontSize="medium" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }}>Edit Student </ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleDeleteStudent(menuRowData); handleMenuClose(); }}>
                    <ListItemIcon><IconTrash fontSize="medium" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '1rem' }}>Delete Student </ListItemText>
                </MenuItem>
            </Menu>

        </>
    )
}

export default StudentsList;
