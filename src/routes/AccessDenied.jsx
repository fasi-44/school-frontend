import Access_Denied from 'assets/images/Access_Denied.webp';
import { Button, Grid, Typography } from '@mui/material';
import { useNavigate } from "react-router-dom";

const AccessDenied = () => {
    const navigate = useNavigate();

    return (
        <>
            <Grid>
                <Grid container justifyContent="center">
                    <img src={Access_Denied} alt="" ></img>
                </Grid>
                <Grid container justifyContent="center"
                    style={{ backgroundColor: '#efefef', display: 'block', textAlign: 'center', padding: '10px' }}>
                    <Typography variant="h2" color="error" >
                        Sorry..! You don’t have permission to view this page
                    </Typography>
                    <Typography variant="h3" sx={{ mt: 1 }}>
                        To access, please contact the administrator
                    </Typography>
                </Grid>
                <br />
                <Grid container justifyContent="center">
                    <Button disableElevation size="medium" variant="contained" color="primary"
                        onClick={() => {
                            navigate('/dashboard');
                        }}
                    >
                        Safe Back
                    </Button>
                </Grid>
            </Grid>
        </>
    )
}

export default AccessDenied;