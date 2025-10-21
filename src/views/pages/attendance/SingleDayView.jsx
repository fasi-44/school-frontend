// src/views/attendance/view/components/SingleDayView.jsx

import React from 'react';
import {
    Box,
    Button,
    Grid,
    Stack,
    Typography,
    Card,
    CardContent,
    Chip
} from '@mui/material';
import { Table } from 'antd';
import { Print as PrintIcon, Edit as EditIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { schoolData } from '../../../AppConstants';
import { generateAttendanceReport } from '../../../prints/attendanceReportGenerator';


const SingleDayView = ({
    attendanceData,
    statistics,
    selectedDate,
    selectedClass,
    selectedSection,
    classes,
    sections,
    setSnackbar
}) => {
    const navigate = useNavigate();

    const handleEditAttendance = () => {
        navigate(`/attendance/mark?date=${selectedDate.format('YYYY-MM-DD')}&class=${selectedClass}&section=${selectedSection}`);
    };

    const handlePrint = async () => {
        if (attendanceData.length === 0) {
            setSnackbar({ open: true, message: 'No data to print', severity: 'warning' });
            return;
        }

        const classObj = classes.find((c) => c.id === selectedClass);
        const sectionObj = sections.find((s) => s.id === selectedSection);

        await generateAttendanceReport(
            {
                type: 'single',
                date: selectedDate.format('YYYY-MM-DD'),
                className: classObj?.class_name,
                sectionName: sectionObj?.section_name,
                records: attendanceData,
                statistics: statistics
            },
            schoolData,
            'print'
        );
    };

    const handleDownload = async () => {
        if (attendanceData.length === 0) {
            setSnackbar({ open: true, message: 'No data to download', severity: 'warning' });
            return;
        }

        const classObj = classes.find((c) => c.id === selectedClass);
        const sectionObj = sections.find((s) => s.id === selectedSection);

        await generateAttendanceReport(
            {
                type: 'single',
                date: selectedDate.format('YYYY-MM-DD'),
                className: classObj?.class_name,
                sectionName: sectionObj?.section_name,
                records: attendanceData,
                statistics: statistics
            },
            schoolData,
            'download'
        );
    };

    const columns = [
        {
            title: 'S.No',
            key: 'sno',
            width: 60,
            render: (_, __, index) => index + 1
        },
        {
            title: 'Roll No.',
            dataIndex: ['student', 'roll_no'],
            key: 'roll_no',
            width: 100,
            render: (rollNo) => rollNo || '-'
        },
        {
            title: 'Student Name',
            dataIndex: ['student', 'name'],
            key: 'name',
            width: 200
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                const colorMap = {
                    Present: 'success',
                    Absent: 'error',
                    Late: 'warning',
                    Leave: 'info',
                    Medical_Leave: 'info',
                    Excused: 'default'
                };
                return <Chip label={status} color={colorMap[status] || 'default'} size="small" />;
            }
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            width: 250,
            render: (remarks) => remarks || '-'
        },
        {
            title: 'Marked Time',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            render: (time) => (time ? dayjs(time).format('hh:mm A') : '-')
        }
    ];

    const StatisticsCard = ({ title, value, color }) => (
        <Card>
            <CardContent>
                <Typography variant="caption" color="textSecondary">
                    {title}
                </Typography>
                <Typography variant="h3" color={color}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <>
            {/* Statistics Cards and Action Buttons in Same Row */}
            {statistics && (
                <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                    {/* Statistics Cards */}
                    <Grid item xs={12} sm={6} md={2.5}>
                        <StatisticsCard title="Total Students" value={statistics.total_students} color="primary.main" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.5}>
                        <StatisticsCard title="Present" value={statistics.present} color="success.main" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.5}>
                        <StatisticsCard title="Absent" value={statistics.absent} color="error.main" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.5}>
                        <StatisticsCard
                            title="Attendance Rate"
                            value={`${statistics.attendance_rate}%`}
                            color="primary.main"
                        />
                    </Grid>

                    {/* Action Buttons */}
                    {attendanceData.length > 0 && (
                        <>
                            <Grid item xs={12} md={2}>
                                <Button
                                    variant="contained"
                                    onClick={handleEditAttendance}
                                    startIcon={<EditIcon />}
                                    size="small"
                                    fullWidth
                                >
                                    Edit
                                </Button>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button variant="outlined" onClick={handlePrint} startIcon={<PrintIcon />} size="small">
                                    Print
                                </Button>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button variant="outlined" onClick={handleDownload} startIcon={<PdfIcon />} size="small">
                                    PDF
                                </Button>
                            </Grid>
                        </>
                    )}
                </Grid >
            )}

            {/* Attendance Table */}
            <Table
                dataSource={attendanceData}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 50 }}
                scroll={{ x: 1000 }}
                bordered
                locale={{
                    emptyText: 'No attendance records found. Please select filters and click "View Attendance".'
                }}
            />
        </>
    );
};

export default SingleDayView;
