import MainCard from '../../../ui-component/cards/MainCard';
import { useNavigate } from 'react-router';
import { IconPlus } from '@tabler/icons-react';
import TeachersList from './TeachersList';
import { Button, Fade } from '@mui/material';
import HeaderCard from '../../../ui-component/cards/HeaderCard';

const TeacherManagement = () => {
    const navigate = useNavigate();

    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: 'Teacher List', to: '/teacher/list' },
    ];

    return (
        <>
            <HeaderCard
                heading={'Teachers List'}
                breadcrumbLinks={breadcrumbLinks}
                buttonColor={'primary'}
                buttonvariant={'contained'}
                buttonText="Create Teacher"
                onButtonClick={() => navigate('/teacher/create')}
                buttonIcon={<IconPlus size={20} />}
            />
            <MainCard>
                <TeachersList />
            </MainCard>
        </>
    );
};

export default TeacherManagement;
