import MainCard from '../../../ui-component/cards/MainCard';
import { useNavigate } from 'react-router';
import { Button } from '@mui/material';
import { IconPlus } from '@tabler/icons-react';
import StudentsList from './StudentList';
import HeaderCard from '../../../ui-component/cards/HeaderCard';

const StudentManagement = () => {
    const navigate = useNavigate();

    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: 'Student List', to: '/student/list' },
    ];

    return (
        <>
            <HeaderCard
                heading={'Students List'}
                breadcrumbLinks={breadcrumbLinks}
                buttonColor={'primary'}
                buttonvariant={'contained'}
                buttonText="Create Student"
                onButtonClick={() => navigate('/student/create')}
                buttonIcon={<IconPlus size={20} />}
            />
            <MainCard>
                <StudentsList />
            </MainCard>
        </>
    );
};

export default StudentManagement;