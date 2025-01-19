import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function Footer() {
    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap="8px">
            <Typography variant="body2" color="text.secondary" align="center">
                Készült ❤️-el és sok ☕-al az ELTE-n.
            </Typography>

            <IconButton aria-label="github" href="https://github.com/slashwarm/elte-orarend">
                <GitHubIcon />
            </IconButton>
        </Box>
    );
}
