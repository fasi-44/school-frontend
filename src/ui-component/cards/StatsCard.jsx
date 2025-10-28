import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

const IconWrapper = styled(Avatar)(({ theme, iconcolor }) => ({
    width: 56,
    height: 56,
    background: `linear-gradient(135deg, ${iconcolor || theme.palette.primary.main} 0%, ${iconcolor || theme.palette.primary.dark} 100%)`,
    color: theme.palette.common.white
}));

const StatsCard = ({
    title,
    value,
    icon: Icon,
    iconColor,
    subtitle,
    bgColor
}) => {
    return (
        <Card
            sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${bgColor}15 0%, ${bgColor}05 100%)`,
                // border: `1px solid ${color}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                }
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                            sx={{ fontWeight: 500 }}
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant="h3"
                            component="div"
                            sx={{
                                fontWeight: 700,
                                mb: subtitle ? 1 : 0
                            }}
                        >
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <IconWrapper iconcolor={iconColor}>
                        {Icon && <Icon size={28} />}
                    </IconWrapper>
                </Box>
            </CardContent>
        </Card>
    );
};

export default StatsCard;
