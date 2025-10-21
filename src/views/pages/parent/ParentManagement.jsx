import MainCard from '../../../ui-component/cards/MainCard';
import { useNavigate } from 'react-router';
import { Button, Fade } from '@mui/material';
import { IconPlus } from '@tabler/icons-react';
import ParentsList from './ParentsList';

const ParentManagement = () => {
    const navigate = useNavigate();

    const createParent = () => {
        navigate('/parent/create');
    }

    return (
        <>
            <MainCard
                title={'School Parents List'}
                secondary={
                    <Button onClick={createParent} variant="contained" color="primary" size='small' startIcon={<IconPlus />}>
                        Create Parent
                    </Button>
                }
            >
                <ParentsList />
            </MainCard>
        </>
    );
};

export default ParentManagement;
