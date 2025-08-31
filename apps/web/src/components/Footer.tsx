import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function Footer() {
    return (
        <Box
            component="footer"
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="8px"
            role="contentinfo"
            aria-label="Oldal lábléce"
        >
            <Typography variant="body2" color="text.secondary" align="center">
                Készült ❤️-el és sok ☕-al az ELTE-n.
            </Typography>

            <IconButton
                aria-label="GitHub repository megnyitása új ablakban"
                href="https://github.com/slashwarm/elte-orarend"
                target="_blank"
                rel="noopener noreferrer"
            >
                <GitHubIcon />
            </IconButton>
        </Box>
    );
}
