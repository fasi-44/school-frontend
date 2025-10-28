import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        pt: 3,
        mt: 'auto'
      }}
    >
      <Typography variant="caption">
        &copy; All rights reserved, Powered by&nbsp;
        <Typography component={Link} href="https://www.klopterz.com" underline="hover" target="_blank" color="secondary.main">
          Klopterz Technology
        </Typography>
      </Typography>
      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption">
          Developed by&nbsp;
          <Typography component={Link} href="https://www.linkedin.com/in/mohammed-fasi-ulla-77926321b/" underline="hover" target="_blank" color="secondary.main">
            Mohammed Fasi
          </Typography>
        </Typography>
      </Stack>
    </Stack>
  );
}
