// components/fees/FeeCollection.jsx - Enhanced with Installments

import React, { useState } from 'react';
import { Table, Tag, Collapse } from 'antd';
import {
    Box, Typography, Button, TextField, Grid, Dialog, DialogTitle,
    DialogContent, DialogActions, Stack, Select, MenuItem, FormControl,
    InputLabel, InputAdornment, Paper, Avatar, Chip, Alert, List,
    ListItemButton, Card, CardContent, IconButton
} from '@mui/material';
import {
    IconCurrencyRupee, IconSearch, IconReceipt, IconUser,
    IconPhone, IconSchool, IconCalendar, IconCreditCard,
    IconCalendarTime, IconChevronDown,
    IconDownload,
    IconPrinter
} from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import MainCard from '../../../ui-component/cards/MainCard';
import InstallmentDialog from './InstallmentDialog';
import customAxios from '../../../utils/axiosConfig';
import { FEES_API_BASE_URL } from '../../../ApiConstants';
import dayjs from 'dayjs';
import Loader from '../../../ui-component/Loader';
import { schoolData } from '../../../AppConstants';
import { generateReceiptFromPayment } from '../../../prints/receiptGenerator';

const { Panel } = Collapse;

const FeeCollection = () => {
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser || null,
        academicYear: state.globalState?.academicYear || null
    }));
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [feeSummary, setFeeSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
    const [openInstallmentDialog, setOpenInstallmentDialog] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    const [selectedInstallment, setSelectedInstallment] = useState(null);
    const [feeInstallments, setFeeInstallments] = useState({});
    const [paymentData, setPaymentData] = useState({
        amount_paid: '',
        payment_mode: 'CASH',
        payment_date: dayjs().format('YYYY-MM-DD'),
        transaction_id: '',
        cheque_number: '',
        bank_name: '',
        remarks: ''
    });

    const paymentModes = ['CASH', 'CHEQUE', 'ONLINE', 'UPI', 'CARD', 'DEMAND_DRAFT'];

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            toast.error('Please enter student name, phone, or roll number');
            return;
        }

        try {
            setLoading(true);
            const response = await customAxios.get(
                `${FEES_API_BASE_URL}/search-student/${loggedUser?.skid}`,
                { params: { q: searchQuery, academic_year_id: academicYear?.id } }
            );

            if (response.data.code === 200) {
                const results = response.data.data;
                if (results.length === 0) {
                    toast.error('No student found');
                    setSearchResults([]);
                } else if (results.length === 1) {
                    selectStudent(results[0]);
                } else {
                    setSearchResults(results);
                    setFeeSummary(null);
                }
            }
        } catch (error) {
            console.error('Error searching student:', error);
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const selectStudent = async (student) => {
        setSelectedStudent(student);
        setSearchResults([]);
        await fetchFeeSummary(student.user_id);
    };

    const fetchFeeSummary = async (userId) => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${FEES_API_BASE_URL}/summary/student/${loggedUser?.skid}/${userId}`,
                {
                    params: { academic_year_id: academicYear?.id }
                }
            );

            if (response.data.code === 200) {
                setFeeSummary(response.data.data);

                // Fetch installments for each fee
                const installmentsData = {};
                for (const fee of response.data.data.fees) {
                    if (fee.has_installments) {
                        try {
                            const instResponse = await customAxios.get(
                                `${FEES_API_BASE_URL}/installments/get/${loggedUser?.skid}/${fee.id}`
                            );
                            if (instResponse.data.code === 200) {
                                installmentsData[fee.id] = instResponse.data.data;
                            }
                        } catch (error) {
                            console.error('Error fetching installments:', error);
                        }
                    }
                }
                setFeeInstallments(installmentsData);
            }
        } catch (error) {
            console.error('Error fetching fee summary:', error);
            toast.error('Failed to fetch fee details');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInstallments = (fee) => {
        setSelectedFee(fee);
        setOpenInstallmentDialog(true);
    };

    const handlePayment = (fee, installment = null) => {
        setSelectedFee(fee);
        setSelectedInstallment(installment);

        const amount = installment ? installment.balance_amount : fee.balance_amount;
        setPaymentData(prev => ({
            ...prev,
            amount_paid: amount
        }));
        setOpenPaymentDialog(true);
    };

    const submitPayment = async () => {
        try {
            setLoading(true);

            let response;
            if (selectedInstallment) {
                // Pay installment
                response = await customAxios.post(
                    `${FEES_API_BASE_URL}/installments/payment/${loggedUser?.skid}/${selectedInstallment.id}`,
                    paymentData
                );
            } else {
                // Pay full fee
                response = await customAxios.post(
                    `${FEES_API_BASE_URL}/payment/record/${loggedUser?.skid}`,
                    {
                        student_fee_id: selectedFee.id,
                        ...paymentData
                    }
                );
            }

            if (response.data.code === 200) {
                toast.success(`Payment recorded! Receipt: ${response.data.receipt_number}`);
                setOpenPaymentDialog(false);
                fetchFeeSummary(selectedStudent.user_id);
                resetPaymentForm();
            }
        } catch (error) {
            console.error('Error recording payment:', error);
            toast.error(error.response?.data?.message || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    const resetPaymentForm = () => {
        setPaymentData({
            amount_paid: '',
            payment_mode: 'CASH',
            payment_date: dayjs().format('YYYY-MM-DD'),
            transaction_id: '',
            cheque_number: '',
            bank_name: '',
            remarks: ''
        });
        setSelectedInstallment(null);
    };

    const resetSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedStudent(null);
        setFeeSummary(null);
        setFeeInstallments({});
    };

    const handlePrintReceipt = (paymentData) => {
        let studentData = selectedStudent;
        let feesSummaryData = feeSummary;
        let installmentsData = feeInstallments;
        generateReceiptFromPayment(paymentData, studentData, schoolData, feesSummaryData, installmentsData, 'print');
    }

    // Installment Table Columns
    const installmentColumns = [
        {
            title: 'Installment',
            dataIndex: 'installment_name',
            key: 'name',
            render: (text, record) => (
                <Box>
                    <Typography variant="body2" fontWeight="600">
                        {text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        #{record.installment_number}
                    </Typography>
                </Box>
            )
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            render: (amount) => `₹${parseFloat(amount).toLocaleString()}`
        },
        {
            title: 'Paid',
            dataIndex: 'paid_amount',
            key: 'paid',
            align: 'right',
            render: (amount) => (
                <Typography variant="body2" color="success.main" fontWeight="500">
                    ₹{parseFloat(amount).toLocaleString()}
                </Typography>
            )
        },
        {
            title: 'Balance',
            dataIndex: 'balance_amount',
            key: 'balance',
            align: 'right',
            render: (amount) => (
                <Typography variant="body2" color="error.main" fontWeight="600">
                    ₹{parseFloat(amount).toLocaleString()}
                </Typography>
            )
        },
        {
            title: 'Due Date',
            dataIndex: 'due_date',
            key: 'due_date',
            render: (date) => dayjs(date).format('MMM DD, YYYY')
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => {
                const colorMap = {
                    'PAID': 'success',
                    'PARTIAL': 'warning',
                    'PENDING': 'error'
                };
                return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
            }
        },
        // In fee breakdown table, add action column
        {
            title: 'Receipt',
            key: 'receipt',
            align: 'center',
            width: 100,
            render: (_, record) => (
                <Stack direction="row" spacing={1}>
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handlePrintReceipt(record)}
                        title="Print Receipt"
                    >
                        <IconPrinter size={18} />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleDownloadReceipt(record)}
                        title="Download Receipt"
                    >
                        <IconDownload size={18} />
                    </IconButton>
                </Stack>
            )
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                record.balance_amount > 0 ? (
                    <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={() => handlePayment(selectedFee, record)}
                    >
                        Pay
                    </Button>
                ) : (
                    <Chip label="✓ Paid" color="success" size="small" />
                )
            )
        }
    ];

    // Main Fee Table Columns
    const feeColumns = [
        {
            title: 'Fee Details',
            dataIndex: 'fee_structure',
            key: 'fee_name',
            width: 200,
            render: (fee_structure, record) => (
                <Box>
                    <Typography variant="body2" fontWeight="600">
                        {fee_structure?.fee_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {fee_structure?.fee_type}
                    </Typography>
                    {record.has_installments && (
                        <Chip
                            label={`${feeInstallments[record.id]?.length || 0} Installments`}
                            size="small"
                            color="info"
                            icon={<IconCalendarTime size={14} />}
                            sx={{ ml: 1 }}
                        />
                    )}
                </Box>
            ),
        },
        {
            title: 'Total',
            dataIndex: 'total_amount',
            key: 'total_amount',
            align: 'right',
            width: 120,
            render: (amount) => `₹${parseFloat(amount).toLocaleString()}`
        },
        {
            title: 'Paid',
            dataIndex: 'paid_amount',
            key: 'paid_amount',
            align: 'right',
            width: 120,
            render: (amount) => (
                <Typography variant="body2" fontWeight="500" color="success.main">
                    ₹{parseFloat(amount).toLocaleString()}
                </Typography>
            )
        },
        {
            title: 'Balance',
            dataIndex: 'balance_amount',
            key: 'balance_amount',
            align: 'right',
            width: 120,
            render: (amount) => (
                <Typography variant="h6" fontWeight="700" color="error.main">
                    ₹{parseFloat(amount).toLocaleString()}
                </Typography>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 130,
            render: (status) => {
                const colorMap = {
                    'PAID': 'success',
                    'PARTIAL': 'warning',
                    'PENDING': 'error'
                };
                return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
            }
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Stack direction="row" spacing={1} justifyContent="center">
                    {!record.has_installments && record.balance_amount > 0 && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleCreateInstallments(record)}
                            startIcon={<IconCalendarTime size={16} />}
                        >
                            Installments
                        </Button>
                    )}
                    {record.balance_amount > 0 ? (
                        <Button
                            variant="contained"
                            size="small"
                            color="success"
                            onClick={() => handlePayment(record)}
                            startIcon={<IconCurrencyRupee size={16} />}
                        >
                            Pay Full
                        </Button>
                    ) : (
                        <Chip label="✓ Paid" color="success" size="small" />
                    )}
                </Stack>
            )
        }
    ];

    // Expandable row render for installments
    const expandedRowRender = (record) => {
        const installments = feeInstallments[record.id];

        if (!installments || installments.length === 0) {
            return null;
        }

        return (
            <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Installment Schedule
                </Typography>
                <Table
                    columns={installmentColumns}
                    dataSource={installments}
                    rowKey="id"
                    pagination={false}
                    size="small"
                />
            </Box>
        );
    };

    return (
        <Box>
            <Loader loading={loading} />

            {/* Search Section - Same as before */}
            <MainCard title="Fee Collection" sx={{ mb: 3 }}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={5}>
                        <Stack spacing={1}>
                            <InputLabel sx={{ fontWeight: 600 }}>Search Student</InputLabel>
                            <TextField
                                fullWidth
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Name / Phone / Roll Number"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconSearch size={20} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Stack>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Stack direction="row" spacing={1.5}>
                            <Button
                                fullWidth
                                size="large"
                                variant="contained"
                                onClick={handleSearch}
                                disabled={loading}
                                startIcon={<IconSearch size={20} />}
                            >
                                Search
                            </Button>
                            {(searchResults.length > 0 || selectedStudent) && (
                                <Button
                                    size="large"
                                    variant="outlined"
                                    onClick={resetSearch}
                                    sx={{ minWidth: 100 }}
                                >
                                    Clear
                                </Button>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </MainCard>

            {/* Student Details & Fee Summary - Enhanced */}
            {feeSummary && selectedStudent && (
                <MainCard sx={{ mb: 3 }}>
                    {/* Student Banner - Same as before */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: 3,
                            color: 'white'
                        }}
                    >
                        <Grid container spacing={3} alignItems="center">
                            <Grid item>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: 'white',
                                        color: 'primary.main',
                                        fontSize: '2rem',
                                        fontWeight: 700,
                                        border: '4px solid rgba(255,255,255,0.3)'
                                    }}
                                >
                                    {selectedStudent.name?.charAt(0)?.toUpperCase()}
                                </Avatar>
                            </Grid>
                            <Grid item xs>
                                <Typography variant="h4" fontWeight="700" gutterBottom>
                                    {selectedStudent.name}
                                </Typography>
                                <Grid container spacing={3} sx={{ mt: 0.5 }}>
                                    <Grid item>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <IconUser size={18} />
                                            <Typography variant="body2">
                                                Roll No: <strong>{selectedStudent.roll_no}</strong>
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <IconSchool size={18} />
                                            <Typography variant="body2">
                                                <strong>{selectedStudent.class} - {selectedStudent.section}</strong>
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <IconPhone size={18} />
                                            <Typography variant="body2">
                                                <strong>{selectedStudent.phone}</strong>
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <IconCalendar size={18} />
                                            <Typography variant="body2">
                                                <strong>{academicYear?.year_name}</strong>
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Summary Cards - Same as before */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #667eea15 0%, #667eea25 100%)', border: '2px solid #667eea40', borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="caption" color="text.secondary" fontWeight="600">Total Amount</Typography>
                                    <Typography variant="h4" fontWeight="700" color="primary" sx={{ mt: 1 }}>
                                        ₹{feeSummary.total_amount?.toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #4caf5015 0%, #4caf5025 100%)', border: '2px solid #4caf5040', borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="caption" color="text.secondary" fontWeight="600">Paid Amount</Typography>
                                    <Typography variant="h4" fontWeight="700" color="success.main" sx={{ mt: 1 }}>
                                        ₹{feeSummary.total_paid?.toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #ff980015 0%, #ff980025 100%)', border: '2px solid #ff980040', borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="caption" color="text.secondary" fontWeight="600">Discount</Typography>
                                    <Typography variant="h4" fontWeight="700" color="warning.main" sx={{ mt: 1 }}>
                                        ₹{feeSummary.total_discount?.toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #f4433615 0%, #f4433625 100%)', border: '2px solid #f4433640', borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="caption" color="text.secondary" fontWeight="600">Balance Due</Typography>
                                    <Typography variant="h4" fontWeight="700" color="error.main" sx={{ mt: 1 }}>
                                        ₹{feeSummary.balance?.toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Fee Breakdown Table with Expandable Installments */}
                    <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mt: 2 }}>
                        Fee Breakdown
                    </Typography>
                    {feeSummary.fees?.length === 0 ? (
                        <Alert severity="warning">
                            No fees assigned to this student for {academicYear?.year_name}
                        </Alert>
                    ) : (
                        <Table
                            columns={feeColumns}
                            dataSource={feeSummary.fees}
                            rowKey="id"
                            pagination={false}
                            bordered
                            size="middle"
                            expandable={{
                                expandedRowRender,
                                rowExpandable: (record) => record.has_installments && feeInstallments[record.id]?.length > 0
                            }}
                        />
                    )}
                </MainCard>
            )}

            {/* Search Results - Same as before */}
            {searchResults.length > 1 && (
                <MainCard>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                        {searchResults.length} Students Found - Select One
                    </Typography>
                    <List>
                        {searchResults.map((student) => (
                            <Paper
                                key={student.user_id}
                                elevation={0}
                                sx={{
                                    mb: 2,
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 2,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        borderColor: 'primary.main',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <ListItemButton onClick={() => selectStudent(student)}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item>
                                            <Avatar
                                                sx={{
                                                    bgcolor: 'primary.main',
                                                    width: 56,
                                                    height: 56,
                                                    fontSize: '1.5rem',
                                                    fontWeight: 700
                                                }}
                                            >
                                                {student.name?.charAt(0)?.toUpperCase()}
                                            </Avatar>
                                        </Grid>
                                        <Grid item xs>
                                            <Typography variant="h6" fontWeight="600">
                                                {student.name}
                                            </Typography>
                                            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                                <Chip
                                                    label={`Roll: ${student.student_id}`}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                                <Typography variant="body2" color="text.secondary">
                                                    📞 {student.phone}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    📚 {student.class} - {student.section}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                        <Grid item>
                                            <Box textAlign="right">
                                                <Typography variant="caption" color="text.secondary">
                                                    Balance Due
                                                </Typography>
                                                <Typography variant="h6" fontWeight="700" color="error.main">
                                                    ₹{student.fee_summary.balance?.toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </ListItemButton>
                            </Paper>
                        ))}
                    </List>
                </MainCard>
            )}

            {/* Payment Dialog - Same as before */}
            <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconCreditCard size={24} color="#667eea" />
                        <Typography variant="h6" fontWeight="600">
                            Record Payment {selectedInstallment && `- ${selectedInstallment.installment_name}`}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 2 }}>
                        <TextField
                            label="Amount to Pay"
                            type="number"
                            value={paymentData.amount_paid}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, amount_paid: e.target.value }))}
                            required
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconCurrencyRupee size={18} />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Payment Mode</InputLabel>
                            <Select
                                value={paymentData.payment_mode}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, payment_mode: e.target.value }))}
                                label="Payment Mode"
                            >
                                {paymentModes.map(mode => (
                                    <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Payment Date"
                            type="date"
                            value={paymentData.payment_date}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, payment_date: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        {['ONLINE', 'UPI', 'CARD'].includes(paymentData.payment_mode) && (
                            <TextField
                                label="Transaction ID"
                                value={paymentData.transaction_id}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, transaction_id: e.target.value }))}
                                fullWidth
                            />
                        )}
                        {paymentData.payment_mode === 'CHEQUE' && (
                            <>
                                <TextField
                                    label="Cheque Number"
                                    value={paymentData.cheque_number}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, cheque_number: e.target.value }))}
                                    fullWidth
                                />
                                <TextField
                                    label="Bank Name"
                                    value={paymentData.bank_name}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, bank_name: e.target.value }))}
                                    fullWidth
                                />
                            </>
                        )}
                        <TextField
                            label="Remarks (Optional)"
                            value={paymentData.remarks}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, remarks: e.target.value }))}
                            multiline
                            rows={2}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenPaymentDialog(false)} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={submitPayment}
                        disabled={loading}
                        startIcon={<IconReceipt size={18} />}
                    >
                        Submit Payment
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Installment Dialog */}
            <InstallmentDialog
                open={openInstallmentDialog}
                onClose={() => setOpenInstallmentDialog(false)}
                studentFee={selectedFee}
                onSuccess={() => fetchFeeSummary(selectedStudent.user_id)}
            />
        </Box>
    );
};

export default FeeCollection;
