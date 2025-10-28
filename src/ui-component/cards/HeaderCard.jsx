import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import Breadcrumbs from '../../ui-component/extended/Breadcrumbs';

const HeaderCard = ({
    heading,
    breadcrumbLinks = [],
    buttonvariant,
    buttonColor,
    buttonText,
    onButtonClick,
    buttonIcon,
    gradient = 'linear-gradient(135deg, #3822aaff 0%, #1a91c4ff 50%, #47534fff 100%)'
    ,
    sx = {}
}) => {
    return (
        <Card sx={{ mb: 3, background: gradient, ...sx, }}>
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2
                    }}
                >
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h3" fontWeight="600" color="white" sx={{ mb: -0.5 }}>
                            {heading}
                        </Typography>
                        {breadcrumbLinks && (
                            <Breadcrumbs
                                custom={true}
                                links={breadcrumbLinks}
                                card={false}
                                divider={false}
                                rightAlign={false}
                                sx={{
                                    '& .MuiTypography-root': {
                                        color: 'rgba(255,255,255,0.9)'
                                    },
                                    '& a': {
                                        color: 'rgba(255,255,255,0.9)',
                                        '&:hover': {
                                            color: 'white'
                                        }
                                    },
                                    ml: 0.5
                                }}
                            />
                        )}
                    </Box>

                    {(buttonText || buttonIcon) && (
                        // <Box>
                        <Button
                            variant={buttonvariant}
                            color={buttonColor}
                            onClick={onButtonClick}
                            startIcon={buttonIcon}
                        >
                            {buttonText}
                        </Button>
                        // </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

HeaderCard.propTypes = {
    heading: PropTypes.string.isRequired,
    breadcrumbLinks: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            to: PropTypes.string,
            icon: PropTypes.elementType
        })
    ),
    buttonText: PropTypes.string,
    onButtonClick: PropTypes.func,
    buttonIcon: PropTypes.element,
    gradient: PropTypes.string,
    sx: PropTypes.object
};

export default HeaderCard;
