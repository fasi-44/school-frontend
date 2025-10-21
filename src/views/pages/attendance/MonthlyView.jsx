// src/views/attendance/view/components/MonthlyView.jsx

import React from 'react';
import { Box, Button, Grid, Stack, Typography, Card, CardContent, Chip, Tooltip } from '@mui/material';
import { Table } from 'antd';
import { Print as PrintIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import { schoolData } from '../../../AppConstants';
import { generateAttendanceReport } from '../../../prints/attendanceReportGenerator';

const MonthlyView = ({ monthlyData, dateRange, selectedClass, selectedSection, classes, sections, setSnackbar }) => {
    const handlePrint = async () => {
        if (monthlyData.students.length === 0) {
            setSnackbar({ open: true, message: 'No data to print', severity: 'warning' });
            return;
        }

        const classObj = classes.find((c) => c.id === selectedClass);
        const sectionObj = sections.find((s) => s.id === selectedSection);

        await generateAttendanceReport(
            {
                type: 'monthly',
                startDate: dateRange[0].format('YYYY-MM-DD'),
                endDate: dateRange[1].format('YYYY-MM-DD'),
                className: classObj?.class_name,
                sectionName: sectionObj?.section_name,
                records: monthlyData
            },
            schoolData,
            'print'
        );
    };

    const handleDownload = async () => {
        if (monthlyData.students.length === 0) {
            setSnackbar({ open: true, message: 'No data to download', severity: 'warning' });
            return;
        }

        const classObj = classes.find((c) => c.id === selectedClass);
        const sectionObj = sections.find((s) => s.id === selectedSection);

        await generateAttendanceReport(
            {
                type: 'monthly',
                startDate: dateRange[0].format('YYYY-MM-DD'),
                endDate: dateRange[1].format('YYYY-MM-DD'),
                className: classObj?.class_name,
                sectionName: sectionObj?.section_name,
                records: monthlyData
            },
            schoolData,
            'download'
        );
    };

    const getMonthlyColumns = () => {
        if (!monthlyData.dates || monthlyData.dates.length === 0) {
            return [];
        }

        const baseColumns = [
            {
                title: 'S.No',
                key: 'sno',
                width: 60,
                fixed: 'left',
                render: (_, __, index) => index + 1
            },
            {
                title: 'Roll No.',
                dataIndex: ['student', 'roll_no'],
                key: 'roll_no',
                width: 100,
                fixed: 'left',
                render: (rollNo) => rollNo || '-'
            },
            {
                title: 'Student Name',
                dataIndex: ['student', 'name'],
                key: 'name',
                width: 200,
                fixed: 'left'
            }
        ];

        const dateColumns = monthlyData.dates.map((date, index) => ({
            title: dayjs(date).format('DD/MM'),
            key: `date_${index}`,
            width: 70,
            align: 'center',
            render: (_, record) => {
                const dayAttendance = record.daily_attendance[index];
                const statusMap = {
                    Present: { symbol: 'P', color: '#4caf50' },
                    Absent: { symbol: 'A', color: '#f44336' },
                    Late: { symbol: 'L', color: '#ff9800' },
                    Leave: { symbol: 'Lv', color: '#2196f3' },
                    Medical_Leave: { symbol: 'ML', color: '#2196f3' },
                    Excused: { symbol: 'E', color: '#9e9e9e' },
                    'Not Marked': { symbol: '-', color: '#bdbdbd' }
                };

                const statusInfo = statusMap[dayAttendance.status] || { symbol: '-', color: '#bdbdbd' };

                return (
                    <Tooltip
                        title={`${dayAttendance.status}${dayAttendance.remarks ? ': ' + dayAttendance.remarks : ''}`}
                    >
                        <Typography
                            sx={{
                                fontWeight: 'bold',
                                color: statusInfo.color,
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            {statusInfo.symbol}
                        </Typography>
                    </Tooltip>
                );
            }
        }));

        const summaryColumns = [
            {
                title: 'Total',
                dataIndex: ['summary', 'total_days'],
                key: 'total',
                width: 70,
                align: 'center'
            },
            {
                title: 'P',
                dataIndex: ['summary', 'present_count'],
                key: 'present',
                width: 60,
                align: 'center',
                render: (count) => (
                    <Typography color="success.main" fontSize="12px">
                        {count}
                    </Typography>
                )
            },
            {
                title: 'A',
                dataIndex: ['summary', 'absent_count'],
                key: 'absent',
                width: 60,
                align: 'center',
                render: (count) => (
                    <Typography color="error.main" fontSize="12px">
                        {count}
                    </Typography>
                )
            },
            {
                title: 'L',
                dataIndex: ['summary', 'late_count'],
                key: 'late',
                width: 60,
                align: 'center',
                render: (count) => (
                    <Typography color="warning.main" fontSize="12px">
                        {count}
                    </Typography>
                )
            },
            {
                title: '%',
                dataIndex: ['summary', 'attendance_percentage'],
                key: 'percentage',
                width: 80,
                align: 'center',
                fixed: 'right',
                render: (percentage) => {
                    const color = percentage >= 90 ? 'success' : percentage >= 75 ? 'warning' : 'error';
                    return <Chip label={`${percentage}%`} color={color} size="small" />;
                }
            }
        ];

        return [...baseColumns, ...dateColumns, ...summaryColumns];
    };

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
            {monthlyData.summary && (
                <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                    {/* Statistics Cards */}
                    <Grid item xs={12} sm={6} md={2.5}>
                        <StatisticsCard
                            title="Total Students"
                            value={monthlyData.summary.total_students}
                            color="primary.main"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.5}>
                        <StatisticsCard
                            title="Total Days"
                            value={monthlyData.summary.total_days}
                            color="primary.main"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.5}>
                        <StatisticsCard
                            title="Total Present"
                            value={monthlyData.summary.total_present}
                            color="success.main"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.5}>
                        <StatisticsCard
                            title="Overall Rate"
                            value={`${monthlyData.summary.overall_attendance_rate}%`}
                            color="primary.main"
                        />
                    </Grid>

                    {/* Action Buttons */}
                    {monthlyData.students.length > 0 && (
                        <Grid item xs={12} md={2}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button variant="outlined" onClick={handlePrint} startIcon={<PrintIcon />} size="small">
                                    Print
                                </Button>
                                <Button variant="outlined" onClick={handleDownload} startIcon={<PdfIcon />} size="small">
                                    PDF
                                </Button>
                            </Stack>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Legend */}
            {monthlyData.students.length > 0 && (
                <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="caption" fontWeight="bold" sx={{ mr: 2 }}>
                        Legend:
                    </Typography>
                    <Chip label="P - Present" size="small" sx={{ mr: 1, bgcolor: '#4caf50', color: 'white' }} />
                    <Chip label="A - Absent" size="small" sx={{ mr: 1, bgcolor: '#f44336', color: 'white' }} />
                    <Chip label="L - Late" size="small" sx={{ mr: 1, bgcolor: '#ff9800', color: 'white' }} />
                    <Chip label="Lv - Leave" size="small" sx={{ mr: 1, bgcolor: '#2196f3', color: 'white' }} />
                    <Chip label="- Not Marked" size="small" sx={{ bgcolor: '#bdbdbd', color: 'white' }} />
                </Box>
            )}

            {/* Monthly Attendance Table */}
            <Table
                dataSource={monthlyData.students}
                columns={getMonthlyColumns()}
                rowKey={(record) => record.student.id}
                pagination={{ pageSize: 50 }}
                scroll={{ x: 'max-content', y: 500 }}
                bordered
                size="small"
                locale={{
                    emptyText: 'No attendance records found. Please select filters and click "View Attendance".'
                }}
            />
        </>
    );
};

export default MonthlyView;
