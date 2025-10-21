// components/OverlayLoader.jsx
import { ClipLoader } from 'react-spinners';
import { Box } from '@mui/material';

const Loader = ({ loading, size = 60, color = '#000000ff' }) => {
    if (!loading) return null;

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                zIndex: 1500,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <ClipLoader size={size} color={color} />
        </Box>
    );
};

export default Loader;
