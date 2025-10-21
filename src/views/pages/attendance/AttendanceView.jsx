// src/views/attendance/view/AttendanceView.jsx

import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Grid,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert
} from '@mui/material';
import { DatePicker } from 'antd';
import { Add as AddIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import MainCard from '../../../ui-component/cards/MainCard';
import customAxios from '../../../utils/axiosConfig';
import { ATTENDANCE_API_BASE_URL, CLASSES_API_BASE_URL } from '../../../ApiConstants';
import { useSelector } from 'react-redux';
import Loader from '../../../ui-component/Loader';
import SingleDayView from './SingleDayView';
import MonthlyView from './MonthlyView';
import { labelStyles } from '../../../AppConstants';

const { RangePicker } = DatePicker;

const AttendanceView = () => {
    const navigate = useNavigate();
    const { loggedUser } = useSelector((state) => state.globalState || {});

    // State management
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState(null);
    const [viewType, setViewType] = useState('single');
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [monthlyData, setMonthlyData] = useState({ students: [], dates: [], summary: null });
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Fetch classes on mount
    useEffect(() => {
        fetchClasses();
    }, [loggedUser]);

    // Fetch sections when class changes
    useEffect(() => {
        if (selectedClass) {
            fetchSections();
        }
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(CLASSES_API_BASE_URL + '/list/' + loggedUser?.skid);
            if (response.data.code === 200 && response.data.status === 'success') {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            setSnackbar({ open: true, message: 'Error fetching classes', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchSections = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                CLASSES_API_BASE_URL + '/sections/' + loggedUser?.skid + '/' + selectedClass
            );
            if (response.data.code === 200 && response.data.status === 'success') {
                setSections(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
            setSnackbar({ open: true, message: 'Error fetching sections', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchSingleDayAttendance = async () => {
        if (!selectedClass || !selectedSection || !selectedDate) {
            setSnackbar({ open: true, message: 'Please select class, section and date', severity: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const formattedDate = selectedDate.format('YYYY-MM-DD');
            const response = await customAxios.get(`${ATTENDANCE_API_BASE_URL}/view/${loggedUser?.skid}`, {
                params: {
                    class_id: selectedClass,
                    section_id: selectedSection,
                    date: formattedDate
                }
            });

            if (response.data.code === 200) {
                setAttendanceData(response.data.data.records);
                setStatistics(response.data.data.statistics);
                setSnackbar({ open: true, message: 'Attendance fetched successfully', severity: 'success' });
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Error fetching attendance',
                severity: 'error'
            });
            setAttendanceData([]);
            setStatistics(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthlyAttendance = async () => {
        if (!selectedClass || !selectedSection || !dateRange) {
            setSnackbar({ open: true, message: 'Please select class, section and date range', severity: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const response = await customAxios.get(`${ATTENDANCE_API_BASE_URL}/monthly/${loggedUser?.skid}`, {
                params: {
                    class_id: selectedClass,
                    section_id: selectedSection,
                    start_date: dateRange[0].format('YYYY-MM-DD'),
                    end_date: dateRange[1].format('YYYY-MM-DD')
                }
            });

            if (response.data.code === 200) {
                setMonthlyData(response.data.data);
                setSnackbar({ open: true, message: 'Monthly attendance fetched successfully', severity: 'success' });
            }
        } catch (error) {
            console.error('Error fetching monthly attendance:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Error fetching monthly attendance',
                severity: 'error'
            });
            setMonthlyData({ students: [], dates: [], summary: null });
        } finally {
            setLoading(false);
        }
    };

    const handleViewAttendance = () => {
        if (viewType === 'single') {
            fetchSingleDayAttendance();
        } else {
            fetchMonthlyAttendance();
        }
    };

    const handleAddAttendance = () => {
        navigate('/attendance/mark');
    };

    const resetData = () => {
        setAttendanceData([]);
        setMonthlyData({ students: [], dates: [], summary: null });
        setStatistics(null);
    };

    return (
        <>
            <MainCard
                title="View Attendance Records"
                secondary={
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddAttendance}
                        size="small"
                    >
                        Mark Attendance
                    </Button>
                }
            >
                <Loader loading={loading} />

                {/* Filters Section */}
                <Grid container spacing={2} sx={{ mb: 3 }} alignItems="flex-end">
                    <Grid item size={{ xl: 2, lg: 2, md: 4, sm: 6, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>Select Class</InputLabel>
                            <Select
                                value={selectedClass || ''}
                                onChange={(e) => {
                                    setSelectedClass(e.target.value);
                                    setSelectedSection(null);
                                    resetData();
                                }}
                            >
                                {classes.map((cls) => (
                                    <MenuItem key={cls.id} value={cls.id}>
                                        {cls.class_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 2, lg: 2, md: 4, sm: 6, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>Select Section</InputLabel>
                            <Select
                                value={selectedSection || ''}
                                onChange={(e) => {
                                    setSelectedSection(e.target.value);
                                    resetData();
                                }}
                                disabled={!selectedClass}
                            >
                                {sections.map((section) => (
                                    <MenuItem key={section.id} value={section.id}>
                                        {section.section_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 2, lg: 2, md: 4, sm: 6, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>View Type</InputLabel>
                            <Select
                                value={viewType}
                                onChange={(e) => {
                                    setViewType(e.target.value);
                                    resetData();
                                }}
                            >
                                <MenuItem value="single">Single Day</MenuItem>
                                <MenuItem value="monthly">Monthly Report</MenuItem>
                            </Select>
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 6, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel sx={labelStyles}>
                                {viewType === 'single' ? 'Select Date' : 'Select Date Range'}
                            </InputLabel>
                            {viewType === 'single' ? (
                                <DatePicker
                                    value={selectedDate}
                                    onChange={(date) => setSelectedDate(date)}
                                    format="YYYY-MM-DD"
                                    style={{ width: '100%', height: '50px' }}
                                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                                />
                            ) : (
                                <RangePicker
                                    value={dateRange}
                                    onChange={(dates) => setDateRange(dates)}
                                    format="YYYY-MM-DD"
                                    style={{ width: '100%', height: '50px' }}
                                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                                />
                            )}
                        </Stack>
                    </Grid>

                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                        <Button
                            variant="contained"
                            onClick={handleViewAttendance}
                            startIcon={<CalendarIcon />}
                            disabled={!selectedClass || !selectedSection}
                            fullWidth
                            sx={{ height: '40px' }}
                        >
                            View Attendance
                        </Button>
                    </Grid>
                </Grid>

                {/* Conditional View Rendering */}
                {viewType === 'single' ? (
                    <SingleDayView
                        attendanceData={attendanceData}
                        statistics={statistics}
                        selectedDate={selectedDate}
                        selectedClass={selectedClass}
                        selectedSection={selectedSection}
                        classes={classes}
                        sections={sections}
                        setSnackbar={setSnackbar}
                    />
                ) : (
                    <MonthlyView
                        monthlyData={monthlyData}
                        dateRange={dateRange}
                        selectedClass={selectedClass}
                        selectedSection={selectedSection}
                        classes={classes}
                        sections={sections}
                        setSnackbar={setSnackbar}
                    />
                )}
            </MainCard>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default AttendanceView;
