import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import GitHubIcon from '@mui/icons-material/GitHub';
import { SPACING } from '../utils/spacing';
import PrivacyPolicy from './PrivacyPolicy';

export default function Footer() {
    const [privacyOpen, setPrivacyOpen] = useState(false);

    return (
        <Box
            component="footer"
            role="contentinfo"
            aria-label="Oldal lábléce"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: SPACING.tight,
            }}
        >
            <Typography
                variant="body2"
                align="center"
                sx={{
                    color: 'text.secondary',
                }}
            >
                Készült ❤️-el és sok ☕-al az ELTE-n.
            </Typography>

            <Typography
                variant="caption"
                align="center"
                sx={{
                    color: 'text.secondary',
                }}
            >
                Nem hivatalos oldal, nem áll kapcsolatban az ELTE-vel.{' '}
                <Link component="button" type="button" variant="caption" onClick={() => setPrivacyOpen(true)}>
                    Adatkezelési tájékoztató
                </Link>
            </Typography>

            <IconButton
                aria-label="GitHub repository megnyitása új ablakban"
                href="https://github.com/slashwarm/elte-orarend"
                target="_blank"
                rel="noopener noreferrer"
            >
                <GitHubIcon />
            </IconButton>

            <PrivacyPolicy open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
        </Box>
    );
}
