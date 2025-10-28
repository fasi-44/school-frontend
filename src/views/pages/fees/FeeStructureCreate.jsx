// components/fees/FeeStructureCreate.jsx

import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import {
    Box, Typography, Button, TextField, Select, MenuItem,
    FormControl, InputLabel, Stack, Grid, IconButton, Paper, Alert
} from '@mui/material';
import { IconPlus, IconTrash, IconCurrencyRupee, IconArrowLeft } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainCard from '../../../ui-component/cards/MainCard';
import customAxios from '../../../utils/axiosConfig';
import { CLASSES_API_BASE_URL, FEES_API_BASE_URL } from '../../../ApiConstants';
import Loader from '../../../ui-component/Loader';
import HeaderCard from '../../../ui-component/cards/HeaderCard';

const FeeStructureCreate = () => {
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser || null,
        academicYear: state.globalState?.academicYear || null
    }));
    const navigate = useNavigate();
    const { class_id, academic_year } = useParams(); // Get from URL params
    const isEditMode = !!class_id; // If class_id exists, it's edit mode

    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [formData, setFormData] = useState({
        academic_year: academic_year || '2025-26',
        class_id: class_id || '',
    });

    const [feeRows, setFeeRows] = useState([
        {
            id: Date.now(),
            fee_name: '',
            fee_type: 'TUITION',
            amount: '',
            is_mandatory: true,
            description: ''
        }
    ]);

    const feeTypes = [
        'TUITION', 'ADMISSION', 'EXAM', 'LIBRARY', 'SPORTS',
        'TRANSPORT', 'HOSTEL', 'LAB', 'ACTIVITY', 'LATE_FEE', 'OTHER'
    ];

    useEffect(() => {
        fetchClasses();
        if (isEditMode) {
            fetchExistingFees();
        }
    }, [academicYear]);

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

    const fetchExistingFees = async () => {
        try {
            setLoading(true);
            const params = {
                academic_year_id: academicYear?.id,
                class_id: class_id
            };
            const response = await customAxios.get(
                `${FEES_API_BASE_URL}/structure/list/${loggedUser?.skid}`,
                { params }
            );

            if (response.data.code === 200) {
                const existingFees = response.data.data || [];
                if (existingFees.length > 0) {
                    setFeeRows(existingFees.map(fee => ({
                        id: fee.id, // Use existing ID
                        fee_id: fee.id, // Store original fee ID for updates
                        fee_name: fee.fee_name,
                        fee_type: fee.fee_type,
                        amount: fee.amount,
                        is_mandatory: fee.is_mandatory,
                        description: fee.description || ''
                    })));
                }
            }
        } catch (error) {
            console.error('Error fetching existing fees:', error);
            toast.error('Failed to load existing fee structure');
        } finally {
            setLoading(false);
        }
    };

    const addFeeRow = () => {
        setFeeRows([
            ...feeRows,
            {
                id: Date.now(),
                fee_name: '',
                fee_type: 'TUITION',
                amount: '',
                is_mandatory: true,
                description: ''
            }
        ]);
    };

    const removeFeeRow = async (row) => {
        if (feeRows.length === 1) {
            toast.error('At least one fee is required');
            return;
        }

        // If it's an existing fee (has fee_id), delete from backend
        if (row.fee_id) {
            if (window.confirm('Are you sure you want to delete this fee?')) {
                try {
                    setLoading(true);
                    await customAxios.delete(
                        `${FEES_API_BASE_URL}/structure/delete/${loggedUser?.skid}/${row.fee_id}`
                    );
                    toast.success('Fee deleted successfully');
                    setFeeRows(feeRows.filter(r => r.id !== row.id));
                } catch (error) {
                    console.error('Error deleting fee:', error);
                    toast.error('Failed to delete fee');
                } finally {
                    setLoading(false);
                }
            }
        } else {
            // Just remove from state if it's a new row
            setFeeRows(feeRows.filter(r => r.id !== row.id));
        }
    };

    const updateFeeRow = (id, field, value) => {
        setFeeRows(feeRows.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.class_id) {
            toast.error('Please select a class');
            return;
        }

        const invalidRows = feeRows.filter(row => !row.fee_name || !row.amount);
        if (invalidRows.length > 0) {
            toast.error('Please fill all fee names and amounts');
            return;
        }

        try {
            setLoading(true);

            if (isEditMode) {
                // Update existing fees and create new ones
                const promises = feeRows.map(fee => {
                    if (fee.fee_id) {
                        // Update existing fee
                        return customAxios.put(
                            `${FEES_API_BASE_URL}/structure/update/${loggedUser?.skid}/${fee.fee_id}`,
                            {
                                fee_name: fee.fee_name,
                                fee_type: fee.fee_type,
                                amount: fee.amount,
                                is_mandatory: fee.is_mandatory,
                                description: fee.description
                            }
                        );
                    } else {
                        // Create new fee
                        return customAxios.post(
                            `${FEES_API_BASE_URL}/structure/create/${loggedUser?.skid}`,
                            {
                                ...formData,
                                ...fee
                            }
                        );
                    }
                });

                await Promise.all(promises);
                toast.success('Fee structure updated successfully');
            } else {
                // Create all fees
                const promises = feeRows.map(fee =>
                    customAxios.post(`${FEES_API_BASE_URL}/structure/create/${loggedUser?.skid}`, {
                        ...formData,
                        ...fee
                    })
                );

                await Promise.all(promises);
                toast.success(`${feeRows.length} fee structure(s) created successfully`);
            }

            navigate('/fee/structures');
        } catch (error) {
            console.error('Error saving fee structures:', error);
            toast.error(error.response?.data?.message || 'Failed to save fee structures');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Fee Type',
            dataIndex: 'fee_type',
            key: 'fee_type',
            width: 250,
            render: (text, record) => (
                <Select
                    size="small"
                    fullWidth
                    value={record.fee_type}
                    onChange={(e) => updateFeeRow(record.id, 'fee_type', e.target.value)}
                >
                    {feeTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                            {type.replace('_', ' ')}
                        </MenuItem>
                    ))}
                </Select>
            ),
        },
        {
            title: 'Fee Name',
            dataIndex: 'fee_name',
            key: 'fee_name',
            render: (text, record) => (
                <TextField
                    size="small"
                    fullWidth
                    value={record.fee_name}
                    onChange={(e) => updateFeeRow(record.id, 'fee_name', e.target.value)}
                    placeholder="e.g., Tuition Fee - Term 1"
                    required
                />
            ),
        },
        {
            title: 'Amount (₹)',
            dataIndex: 'amount',
            key: 'amount',
            width: 200,
            render: (text, record) => (
                <TextField
                    size="small"
                    fullWidth
                    type="number"
                    value={record.amount}
                    onChange={(e) => updateFeeRow(record.id, 'amount', e.target.value)}
                    required
                />
            ),
        },
        {
            title: 'Mandatory',
            dataIndex: 'is_mandatory',
            key: 'is_mandatory',
            width: 150,
            render: (text, record) => (
                <Select
                    size="small"
                    fullWidth
                    value={record.is_mandatory}
                    onChange={(e) => updateFeeRow(record.id, 'is_mandatory', e.target.value)}
                >
                    <MenuItem value={true}>Yes</MenuItem>
                    <MenuItem value={false}>No</MenuItem>
                </Select>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeFeeRow(record)}
                >
                    <IconTrash size={18} />
                </IconButton>
            ),
        },
    ];

    const totalAmount = feeRows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);

    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: 'Fee Structures', to: '/fee/structures' },
        { title: (isEditMode ? 'Edit Fee Structure' : 'Create Fee Structure'), to: '/fee/structures' },
    ];

    return (
        <Box>
            <Loader loading={loading} />
            <HeaderCard
                heading={isEditMode ? 'Edit Fee Structure' : 'Create Fee Structure'}
                breadcrumbLinks={breadcrumbLinks}
                buttonColor={'primary'}
                buttonvariant={'variant'}
                onButtonClick={() => navigate('/fee/structures')}
                buttonIcon={<IconArrowLeft color='white' />}
            />

            {/* Header */}
            <MainCard sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                    {isEditMode
                        ? 'Update existing fees or add new fees for this class'
                        : 'Add multiple fees for a class in a single submission'
                    }
                </Typography>
                <br />

                {/* Edit Mode Notice */}
                {isEditMode && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        You are editing fee structure. You can update existing fees, add new fees, or delete fees.
                    </Alert>
                )}

                {/* Class & Year Selection */}

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required>
                            <InputLabel>Select Class</InputLabel>
                            <Select
                                value={formData.class_id}
                                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                label="Select Class"
                                disabled={isEditMode} // Disable in edit mode
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
                        <FormControl fullWidth required>
                            <InputLabel>Academic Year</InputLabel>
                            <Select
                                value={formData.academic_year}
                                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                                label="Academic Year"
                                disabled={isEditMode} // Disable in edit mode
                            >
                                <MenuItem value="2025-26">2025-26</MenuItem>
                                <MenuItem value="2024-25">2024-25</MenuItem>
                                <MenuItem value="2023-24">2023-24</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid>
                        <Button
                            variant="outlined"
                            startIcon={<IconPlus size={18} />}
                            onClick={addFeeRow}
                        >
                            Add Fee
                        </Button>
                    </Grid>
                </Grid>

                <br />
                {/* Fee Rows Table */}

                <Table
                    columns={columns}
                    dataSource={feeRows}
                    rowKey="id"
                    pagination={false}
                // bordered
                />

                {/* Total */}
                <Paper sx={{ p: 2, mt: 2, bgcolor: 'primary.lighter' }}>
                    <Grid container>
                        <Grid item xs={9}>
                            <Typography variant="h6" align="right" fontWeight="600">
                                Total Amount:
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                <IconCurrencyRupee size={20} />
                                <Typography variant="h5" fontWeight="700" color="primary">
                                    {totalAmount.toLocaleString()}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </MainCard>

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/fee/structures')}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {isEditMode ? 'Update Fee Structure' : 'Save Fee Structure'}
                </Button>
            </Box>
        </Box>
    );
};

export default FeeStructureCreate;
