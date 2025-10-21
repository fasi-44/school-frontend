import React, { useEffect, useState } from 'react';
import { Table, Tag } from 'antd';
import { useSelector } from 'react-redux';
import customAxios from '../../../utils/axiosConfig';
import { PARENTS_API_BASE_URL } from '../../../ApiConstants';
import Loader from '../../../ui-component/Loader';
import { useNavigate } from 'react-router';

const ParentsList = () => {
    const navigate = useNavigate();
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(false);
    const { loggedUser } = useSelector((state) => state.globalState || {});

    const columns = [
        {
            title: 'Father Name',
            dataIndex: 'father_full_name',
            key: 'name',
            sorter: (a, b) => a.father_full_name.localeCompare(b.father_full_name)
        },
        {
            title: 'Father Phone',
            dataIndex: 'father_phone',
            key: 'father_phone',
            sorter: (a, b) => a.father_phone.localeCompare(b.father_phone)
        },
        {
            title: 'Mother Name',
            dataIndex: 'mother_full_name',
            key: 'mother_name',
            sorter: (a, b) => a.mother_full_name.localeCompare(b.mother_full_name)
        },
        {
            title: 'Mother Phone',
            dataIndex: 'mother_phone',
            key: 'mother_phone',
            sorter: (a, b) => a.mother_phone.localeCompare(b.mother_phone)
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'City',
            dataIndex: 'city',
            key: 'city',
        },
        {
            title: 'State',
            dataIndex: 'state',
            key: 'state',
        },
        {
            title: 'Postal Code',
            dataIndex: 'postal_code',
            key: 'postal_code',
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (is_active) => (
                <Tag color={is_active ? 'green' : 'red'}>
                    {is_active ? 'Active' : 'Inactive'}
                </Tag>
            ),
        }
    ];

    useEffect(() => {
        fetchParents();
    }, []);

    const fetchParents = async () => {
        setLoading(true);
        try {
            const response = await customAxios.get(PARENTS_API_BASE_URL + "/list/" + loggedUser?.skid);
            console.log(response);
            if (response.data.code === 200 && response.data.status === 'success') {
                setParents(response.data.parents);
            }
        } catch (err) {
            console.error('Error fetching parents:', err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <Loader loading={loading} />
            <Table
                dataSource={parents}
                columns={columns}
                rowKey="id"
                bordered
                size='small'
                pagination={{ pageSize: 10 }}
                scroll={{ x: 680, y: 400 }}
                locale={{ emptyText: 'No parents found' }}
            />
        </>
    );
};

export default ParentsList;
