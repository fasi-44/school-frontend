// components/fees/FeeStructureList.jsx

import React, { useState, useEffect } from 'react';
import { Table, Tag, Space } from 'antd';
import {
    Box, Typography, IconButton, Dialog, DialogTitle, DialogContent,
    Button, Grid, FormControl, InputLabel, Select, MenuItem,
    Card,
    CardContent
} from '@mui/material';
import {
    IconPlus, IconEdit, IconTrash, IconCurrencyRupee, IconEye
} from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainCard from '../../../ui-component/cards/MainCard';
import { CLASSES_API_BASE_URL, FEES_API_BASE_URL } from '../../../ApiConstants';
import customAxios from '../../../utils/axiosConfig';
import Loader from '../../../ui-component/Loader';
import Breadcrumbs from '../../../ui-component/extended/Breadcrumbs';
import HeaderCard from '../../../ui-component/cards/HeaderCard';

const FeeStructureList = () => {
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser || null,
        academicYear: state.globalState?.academicYear || null
    }));
    const navigate = useNavigate();
    const [groupedFees, setGroupedFees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedClassFees, setSelectedClassFees] = useState([]);

    useEffect(() => {
        fetchGroupedFeeStructures();
    }, [academicYear]);

    const fetchGroupedFeeStructures = async () => {
        try {
            setLoading(true);
            const params = {
                academic_year_id: academicYear?.id
            };
            const response = await customAxios.get(
                `${FEES_API_BASE_URL}/structure/list/${loggedUser?.skid}`,
                { params }
            );

            if (response.data.code === 200) {
                const feeStructures = response.data.data || [];

                // Group by class_id
                const grouped = feeStructures.reduce((acc, fee) => {
                    const classId = fee.class_id;
                    if (!acc[classId]) {
                        acc[classId] = {
                            class_id: classId,
                            class_name: fee.class?.class_name || 'N/A',
                            academic_year: fee.academic_year,
                            fees: [],
                            total_amount: 0,
                            fee_count: 0
                        };
                    }
                    acc[classId].fees.push(fee);
                    acc[classId].total_amount += parseFloat(fee.amount || 0);
                    acc[classId].fee_count += 1;
                    return acc;
                }, {});

                setGroupedFees(Object.values(grouped));
            }
        } catch (error) {
            console.error('Error fetching fee structures:', error);
            toast.error('Failed to fetch fee structures');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (record) => {
        setSelectedClassFees(record.fees);
        setViewDialogOpen(true);
    };

    const handleEdit = (record) => {
        navigate(`/fee/structure/edit/${record.class_id}`);
    };

    const handleDelete = async (record) => {
        if (window.confirm(
            `Delete all fee structures for ${record.class_name}?\n\n` +
            `This will delete ${record.fee_count} fee(s) with total amount ₹${record.total_amount.toLocaleString()}.\n\n` +
            `Note: This action cannot be undone and will fail if fees are already assigned to students.`
        )) {
            try {
                setLoading(true);
                const response = await customAxios.delete(
                    `${FEES_API_BASE_URL}/structure/delete-class/${loggedUser?.skid}/${record.class_id}/${selectedAcademicYear}`
                );

                if (response.data.code === 200) {
                    toast.success(response.data.message);
                    fetchGroupedFeeStructures(); // Refresh list
                }
            } catch (error) {
                console.error('Error deleting fee structures:', error);
                toast.error(error.response?.data?.message || 'Failed to delete fee structures');
            } finally {
                setLoading(false);
            }
        }
    };


    const columns = [
        {
            title: 'Class',
            dataIndex: 'class_name',
            key: 'class_name',
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: 'Academic Year',
            dataIndex: 'academic_year',
            key: 'academic_year',
            width: 150,
        },
        {
            title: 'Number of Fees',
            dataIndex: 'fee_count',
            key: 'fee_count',
            align: 'center',
            width: 150,
            render: (count) => <Tag color="blue">{count} Fees</Tag>,
        },
        {
            title: 'Total Amount',
            dataIndex: 'total_amount',
            key: 'total_amount',
            align: 'right',
            width: 200,
            render: (amount) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <IconCurrencyRupee size={16} />
                    <strong style={{ fontSize: '1.1rem' }}>
                        {amount?.toLocaleString()}
                    </strong>
                </Box>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleView(record)}
                        title="View Details"
                    >
                        <IconEye size={18} />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleEdit(record)}
                        title="Edit"
                    >
                        <IconEdit size={18} />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(record)}
                        title="Delete"
                    >
                        <IconTrash size={18} />
                    </IconButton>
                </Space>
            ),
        },
    ];

    // Detail Table Columns for View Dialog
    const detailColumns = [
        {
            title: 'Fee Name',
            dataIndex: 'fee_name',
            key: 'fee_name',
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
            render: (amount) => `₹${amount?.toLocaleString()}`,
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
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            align: 'center',
            render: (active) => (
                <Tag color={active ? 'success' : 'error'}>
                    {active ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
    ];

    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: 'Fee Structures', to: '/fee/structures' },
    ];

    return (
        <Box>

            <Loader loading={loading} />
            <HeaderCard
                heading="Fee Assignment"
                breadcrumbLinks={breadcrumbLinks}
                buttonColor={'primary'}
                buttonvariant={'contained'}
                buttonText="Create Fee Structure"
                onButtonClick={() => navigate('/fee/structure/create')}
                buttonIcon={<IconPlus size={20} />}
            />

            {/* Header */}
            <MainCard>
                {/* <br /> */}
                <Table
                    columns={columns}
                    dataSource={groupedFees}
                    rowKey="class_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Total ${total} classes`,
                    }}
                // bordered
                />
            </MainCard>

            {/* View Details Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight="600">
                        Fee Structure Details
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Table
                        columns={detailColumns}
                        dataSource={selectedClassFees}
                        rowKey="id"
                        pagination={false}
                        bordered
                        size="small"
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default FeeStructureList;
