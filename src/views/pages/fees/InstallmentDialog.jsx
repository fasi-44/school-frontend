// components/fees/InstallmentDialog.jsx

import React, { useState, useEffect } from 'react';
import { Table, Tag } from 'antd';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, Grid, TextField, IconButton,
    Stack, Chip, Divider, Alert
} from '@mui/material';
import { IconPlus, IconTrash, IconCurrencyRupee, IconX, IconCalendar } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import customAxios from '../../../utils/axiosConfig';
import { FEES_API_BASE_URL } from '../../../ApiConstants';

const InstallmentDialog = ({ open, onClose, studentFee, onSuccess }) => {
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('auto'); // 'auto' or 'manual'
    const [numInstallments, setNumInstallments] = useState(3);
    const [installments, setInstallments] = useState([
        {
            id: Date.now(),
            installment_name: 'Installment 1',
            amount: '',
            due_date: dayjs().add(1, 'month').format('YYYY-MM-DD')
        }
    ]);

    useEffect(() => {
        if (open && studentFee && mode === 'manual') {
            // Initialize with equal amounts
            const amount = parseFloat(studentFee.total_amount) / 3;
            setInstallments([
                {
                    id: Date.now(),
                    installment_name: 'Term 1',
                    amount: amount.toFixed(2),
                    due_date: dayjs().add(3, 'month').format('YYYY-MM-DD')
                },
                {
                    id: Date.now() + 1,
                    installment_name: 'Term 2',
                    amount: amount.toFixed(2),
                    due_date: dayjs().add(6, 'month').format('YYYY-MM-DD')
                },
                {
                    id: Date.now() + 2,
                    installment_name: 'Term 3',
                    amount: amount.toFixed(2),
                    due_date: dayjs().add(9, 'month').format('YYYY-MM-DD')
                }
            ]);
        }
    }, [open, studentFee, mode]);

    const addInstallment = () => {
        setInstallments([
            ...installments,
            {
                id: Date.now(),
                installment_name: `Installment ${installments.length + 1}`,
                amount: '',
                due_date: dayjs().add(installments.length + 1, 'month').format('YYYY-MM-DD')
            }
        ]);
    };

    const removeInstallment = (id) => {
        if (installments.length === 1) {
            toast.error('At least one installment is required');
            return;
        }
        setInstallments(installments.filter(inst => inst.id !== id));
    };

    const updateInstallment = (id, field, value) => {
        setInstallments(installments.map(inst =>
            inst.id === id ? { ...inst, [field]: value } : inst
        ));
    };

    const handleAutoGenerate = async () => {
        try {
            setLoading(true);
            const response = await customAxios.post(
                `${FEES_API_BASE_URL}/installments/auto-generate/${loggedUser?.skid}`,
                {
                    student_fee_id: studentFee.id,
                    num_installments: numInstallments
                }
            );

            if (response.data.code === 200) {
                toast.success(`${numInstallments} installments created successfully`);
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error auto-generating installments:', error);
            toast.error(error.response?.data?.message || 'Failed to create installments');
        } finally {
            setLoading(false);
        }
    };

    const handleManualCreate = async () => {
        // Validation
        const invalidRows = installments.filter(inst => !inst.installment_name || !inst.amount || !inst.due_date);
        if (invalidRows.length > 0) {
            toast.error('Please fill all installment details');
            return;
        }

        const totalInstallment = installments.reduce((sum, inst) => sum + parseFloat(inst.amount), 0);
        const feeAmount = parseFloat(studentFee.total_amount);

        if (Math.abs(totalInstallment - feeAmount) > 0.01) {
            toast.error(`Total installment amount (₹${totalInstallment}) must equal fee amount (₹${feeAmount})`);
            return;
        }

        try {
            setLoading(true);
            const response = await customAxios.post(
                `${FEES_API_BASE_URL}/installments/create/${loggedUser?.skid}`,
                {
                    student_fee_id: studentFee.id,
                    installment_plan: installments.map(inst => ({
                        installment_name: inst.installment_name,
                        amount: parseFloat(inst.amount),
                        due_date: inst.due_date
                    }))
                }
            );

            if (response.data.code === 200) {
                toast.success('Installments created successfully');
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error creating installments:', error);
            toast.error(error.response?.data?.message || 'Failed to create installments');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'installment_name',
            key: 'name',
            render: (text, record) => (
                <TextField
                    size="small"
                    fullWidth
                    value={record.installment_name}
                    onChange={(e) => updateInstallment(record.id, 'installment_name', e.target.value)}
                    placeholder="e.g., Term 1"
                />
            )
        },
        {
            title: 'Amount (₹)',
            dataIndex: 'amount',
            key: 'amount',
            render: (text, record) => (
                <TextField
                    size="small"
                    fullWidth
                    type="number"
                    value={record.amount}
                    onChange={(e) => updateInstallment(record.id, 'amount', e.target.value)}
                />
            )
        },
        {
            title: 'Due Date',
            dataIndex: 'due_date',
            key: 'due_date',
            render: (text, record) => (
                <TextField
                    size="small"
                    fullWidth
                    type="date"
                    value={record.due_date}
                    onChange={(e) => updateInstallment(record.id, 'due_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <IconButton size="small" color="error" onClick={() => removeInstallment(record.id)}>
                    <IconTrash size={18} />
                </IconButton>
            )
        }
    ];

    const totalAmount = installments.reduce((sum, inst) => sum + (parseFloat(inst.amount) || 0), 0);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="600">
                        Create Installment Plan
                    </Typography>
                    <IconButton onClick={onClose}>
                        <IconX size={20} />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                {studentFee && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2" fontWeight="600">
                            Fee: {studentFee.fee_structure?.fee_name}
                        </Typography>
                        <Typography variant="body2">
                            Total Amount: ₹{parseFloat(studentFee.total_amount).toLocaleString()}
                        </Typography>
                    </Alert>
                )}

                {/* Mode Selection */}
                <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant={mode === 'auto' ? 'contained' : 'outlined'}
                            onClick={() => setMode('auto')}
                        >
                            Auto Generate
                        </Button>
                        <Button
                            variant={mode === 'manual' ? 'contained' : 'outlined'}
                            onClick={() => setMode('manual')}
                        >
                            Manual Entry
                        </Button>
                    </Stack>
                </Box>

                {/* Auto Mode */}
                {mode === 'auto' && (
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Generate equal installments automatically
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Number of Installments"
                                    type="number"
                                    value={numInstallments}
                                    onChange={(e) => setNumInstallments(parseInt(e.target.value))}
                                    inputProps={{ min: 2, max: 12 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Amount per installment
                                    </Typography>
                                    <Typography variant="h6" fontWeight="600" color="primary">
                                        ₹{(parseFloat(studentFee?.total_amount || 0) / numInstallments).toFixed(2)}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Manual Mode */}
                {mode === 'manual' && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Define custom installment amounts and dates
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<IconPlus size={18} />}
                                onClick={addInstallment}
                            >
                                Add Row
                            </Button>
                        </Box>

                        <Table
                            columns={columns}
                            dataSource={installments}
                            rowKey="id"
                            pagination={false}
                            bordered
                            size="small"
                        />

                        {/* Total */}
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                            <Grid container>
                                <Grid item xs={8}>
                                    <Typography variant="h6" fontWeight="600">
                                        Total:
                                    </Typography>
                                </Grid>
                                <Grid item xs={4} textAlign="right">
                                    <Typography
                                        variant="h6"
                                        fontWeight="700"
                                        color={
                                            Math.abs(totalAmount - parseFloat(studentFee?.total_amount || 0)) < 0.01
                                                ? 'success.main'
                                                : 'error.main'
                                        }
                                    >
                                        ₹{totalAmount.toFixed(2)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} variant="outlined">
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={mode === 'auto' ? handleAutoGenerate : handleManualCreate}
                    disabled={loading}
                >
                    Create Installments
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InstallmentDialog;
