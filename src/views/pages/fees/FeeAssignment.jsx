// components/fees/FeeAssignment.jsx

import React, { useState, useEffect } from 'react';
import { Table, Tag, Tabs } from 'antd';
import {
    Box, Typography, Button, TextField, Select, MenuItem,
    FormControl, InputLabel, Stack, Grid, Chip, Alert,
    Paper, Divider, Checkbox, FormControlLabel
} from '@mui/material';
import { IconUserPlus, IconUsersGroup, IconSearch, IconCurrencyRupee } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import MainCard from '../../../ui-component/cards/MainCard';
import customAxios from '../../../utils/axiosConfig';
import { FEES_API_BASE_URL, CLASSES_API_BASE_URL, STUDENTS_API_BASE_URL } from '../../../ApiConstants';
import Loader from '../../../ui-component/Loader';

const { TabPanel } = Tabs;

const FeeAssignment = () => {
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const [activeTab, setActiveTab] = useState('1');
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);

    // Individual Assignment State
    const [studentId, setStudentId] = useState('');
    const [academicYear, setAcademicYear] = useState('2025-26');
    const [studentDetails, setStudentDetails] = useState(null);
    const [availableFees, setAvailableFees] = useState([]);
    const [selectedFees, setSelectedFees] = useState([]);

    // Bulk Assignment State
    const [selectedClass, setSelectedClass] = useState('');
    const [bulkAcademicYear, setBulkAcademicYear] = useState('2025-26');

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await customAxios.get(
                `${CLASSES_API_BASE_URL}/list/${loggedUser?.skid}`
            );
            if (response.data.code === 200) {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const searchStudent = async () => {
        if (!studentId) {
            toast.error('Please enter student ID');
            return;
        }

        try {
            setLoading(true);
            const response = await customAxios.get(
                `${STUDENTS_API_BASE_URL}/get-by-id/${loggedUser?.skid}/${studentId}`
            );

            if (response.data.code === 200) {
                const student = response.data.student;
                setStudentDetails(student);

                const feeResponse = await customAxios.get(
                    `${FEES_API_BASE_URL}/structure/list/${loggedUser?.skid}?academic_year=${academicYear}&class_id=${student.profile?.class_id}`
                );

                if (feeResponse.data.code === 200) {
                    setAvailableFees(feeResponse.data.data || []);
                }
            }
        } catch (error) {
            console.error('Error searching student:', error);
            toast.error('Student not found');
        } finally {
            setLoading(false);
        }
    };

    const assignFeesToStudent = async () => {
        try {
            setLoading(true);
            const response = await customAxios.post(
                `${FEES_API_BASE_URL}/assign/student/${loggedUser?.skid}`,
                {
                    student_id: studentId,
                    academic_year: academicYear
                }
            );

            if (response.data.code === 200) {
                toast.success(`Fees assigned successfully! ${response.data.data.assigned_count} fees assigned.`);
                resetIndividualForm();
            }
        } catch (error) {
            console.error('Error assigning fees:', error);
            toast.error(error.response?.data?.message || 'Failed to assign fees');
        } finally {
            setLoading(false);
        }
    };

    const assignFeesToClass = async () => {
        if (!selectedClass) {
            toast.error('Please select a class');
            return;
        }

        try {
            setLoading(true);
            const response = await customAxios.post(
                `${FEES_API_BASE_URL}/assign/class/${loggedUser?.skid}`,
                {
                    class_id: selectedClass,
                    academic_year: bulkAcademicYear
                }
            );

            if (response.data.code === 200) {
                const data = response.data.data;
                toast.success(
                    `Fees assigned to ${data.total_students} students!\n` +
                    `Assigned: ${data.total_fees_assigned} | Already Exists: ${data.total_fees_skipped}`
                );
                setSelectedClass('');
            }
        } catch (error) {
            console.error('Error in bulk assignment:', error);
            toast.error(error.response?.data?.message || 'Failed to assign fees');
        } finally {
            setLoading(false);
        }
    };

    const resetIndividualForm = () => {
        setStudentId('');
        setStudentDetails(null);
        setAvailableFees([]);
        setSelectedFees([]);
    };

    // Table columns for available fees
    const feeColumns = [
        {
            title: 'Select',
            dataIndex: 'id',
            key: 'select',
            width: 80,
            render: (id, record) => (
                <Checkbox
                    checked={selectedFees.includes(id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedFees([...selectedFees, id]);
                        } else {
                            setSelectedFees(selectedFees.filter(feeId => feeId !== id));
                        }
                    }}
                />
            ),
        },
        {
            title: 'Fee Name',
            dataIndex: 'fee_name',
            key: 'fee_name',
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: 'Type',
            dataIndex: 'fee_type',
            key: 'fee_type',
            render: (type) => <Tag color="blue">{type}</Tag>,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            render: (amount) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <IconCurrencyRupee size={16} />
                    <strong>{amount?.toLocaleString()}</strong>
                </Box>
            ),
        },
        {
            title: 'Mandatory',
            dataIndex: 'is_mandatory',
            key: 'is_mandatory',
            align: 'center',
            render: (mandatory) => (
                <Tag color={mandatory ? 'red' : 'default'}>
                    {mandatory ? 'Yes' : 'No'}
                </Tag>
            ),
        },
    ];

    return (
        <Box>
            <Loader loading={loading} />

            <MainCard title="Fee Assignment" sx={{ mb: 3 }}>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPanel
                        tab={
                            <span>
                                <IconUserPlus size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                                Individual Assignment
                            </span>
                        }
                        key="1"
                    >
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            {/* Search Section */}
                            <Grid item xs={12} md={4}>
                                <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                                    <Typography variant="h6" gutterBottom>
                                        Search Student
                                    </Typography>
                                    <Stack spacing={2}>
                                        <TextField
                                            fullWidth
                                            label="Student User ID"
                                            value={studentId}
                                            onChange={(e) => setStudentId(e.target.value)}
                                            placeholder="Enter student user ID"
                                            size="small"
                                        />
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Academic Year</InputLabel>
                                            <Select
                                                value={academicYear}
                                                onChange={(e) => setAcademicYear(e.target.value)}
                                                label="Academic Year"
                                            >
                                                <MenuItem value="2025-26">2025-26</MenuItem>
                                                <MenuItem value="2024-25">2024-25</MenuItem>
                                                <MenuItem value="2023-24">2023-24</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<IconSearch size={20} />}
                                            onClick={searchStudent}
                                        >
                                            Search
                                        </Button>
                                    </Stack>

                                    {studentDetails && (
                                        <Paper sx={{ p: 2, mt: 2, bgcolor: 'primary.lighter' }}>
                                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                                Student Details
                                            </Typography>
                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                <strong>Name:</strong> {studentDetails.full_name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                <strong>Class:</strong> {studentDetails.class?.class_name}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Section:</strong> {studentDetails.section?.section_name}
                                            </Typography>
                                        </Paper>
                                    )}
                                </Paper>
                            </Grid>

                            {/* Available Fees Section */}
                            <Grid item xs={12} md={8}>
                                <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                                    <Typography variant="h6" gutterBottom>
                                        Available Fee Structures
                                    </Typography>

                                    {availableFees.length === 0 ? (
                                        <Alert severity="info">
                                            Search for a student to view available fees
                                        </Alert>
                                    ) : (
                                        <>
                                            <Table
                                                columns={feeColumns}
                                                dataSource={availableFees}
                                                rowKey="id"
                                                pagination={false}
                                                size="small"
                                                bordered
                                            />

                                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedFees.length} fee(s) selected
                                                </Typography>
                                                <Stack direction="row" spacing={2}>
                                                    <Button variant="outlined" onClick={resetIndividualForm}>
                                                        Reset
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        onClick={assignFeesToStudent}
                                                        disabled={loading}
                                                    >
                                                        Assign Auto (Mandatory Fees)
                                                    </Button>
                                                </Stack>
                                            </Box>
                                        </>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <TabPanel
                        tab={
                            <span>
                                <IconUsersGroup size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                                Bulk Assignment
                            </span>
                        }
                        key="2"
                    >
                        <Paper sx={{ p: 3, mt: 2, border: '1px solid #e0e0e0' }}>
                            <Typography variant="h6" gutterBottom>
                                Bulk Fee Assignment to Class
                            </Typography>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                This will automatically assign all mandatory fees to all students in the selected class
                            </Alert>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Select Class</InputLabel>
                                        <Select
                                            value={selectedClass}
                                            onChange={(e) => setSelectedClass(e.target.value)}
                                            label="Select Class"
                                        >
                                            {classes.map((cls) => (
                                                <MenuItem key={cls.id} value={cls.id}>
                                                    {cls.class_name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Academic Year</InputLabel>
                                        <Select
                                            value={bulkAcademicYear}
                                            onChange={(e) => setBulkAcademicYear(e.target.value)}
                                            label="Academic Year"
                                        >
                                            <MenuItem value="2025-26">2025-26</MenuItem>
                                            <MenuItem value="2024-25">2024-25</MenuItem>
                                            <MenuItem value="2023-24">2023-24</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={assignFeesToClass}
                                        disabled={!selectedClass || loading}
                                    >
                                        Assign Fees to All Students in Class
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </TabPanel>
                </Tabs>
            </MainCard>
        </Box>
    );
};

export default FeeAssignment;
