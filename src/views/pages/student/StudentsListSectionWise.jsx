

import { Table } from 'antd';
import React, { useEffect, useState } from 'react'
import { STUDENTS_API_BASE_URL } from '../../../ApiConstants';
import customAxios from '../../../utils/axiosConfig';
import { useSelector } from 'react-redux';
import { getUsername } from '../../../SharedService';

const StudentsListSectionWise = ({ selectedSection }) => {
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const [studentList, setStudentList] = useState([]);
    const [loading, setLoading] = useState(false);

    const columns = [
        {
            title: 'Name',
            key: 'name',
            render: (data) => (<>{getUsername(data, ['first_name', 'middle_name', 'last_name'])}</>),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phone no.',
            dataIndex: 'phone_number',
            key: 'phone_number',
        },

    ];

    useEffect(() => {
        viewStudents(selectedSection);
    }, [])

    const viewStudents = async (selectedSection) => {
        try {
            setLoading(true);
            const resp = await customAxios.get(STUDENTS_API_BASE_URL + '/list/inSection/' + loggedUser?.skid + '/' + selectedSection?.id);
            if (resp.data.code === 200 && resp.data.status === 'success') {
                setStudentList(resp?.data.data)
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
            // toast.error('Error fetching sections');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Table
                dataSource={studentList}
                columns={columns}
                loading={loading}
                rowKey="id"
                bordered
                size='small'
                pagination={{ pageSize: 10 }}
            />
        </div>
    )
}

export default StudentsListSectionWise;
