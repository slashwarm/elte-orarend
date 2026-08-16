import React, { useState } from 'react';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

// bump the key if a new announcement comes, so mindenki újra látja
const DISMISS_KEY = 'INFOBOX_DISMISSED_MIGRATION_2026';

const InfoBox: React.FC = () => {
    const [isOpen, setIsOpen] = useState(() => window.localStorage.getItem(DISMISS_KEY) !== '1');

    const handleClose = () => {
        window.localStorage.setItem(DISMISS_KEY, '1');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <Alert
            sx={{
                alignSelf: 'center',
            }}
            severity="info"
            role="status"
            aria-live="polite"
            action={
                <IconButton aria-label="Információs üzenet bezárása" color="inherit" size="small" onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            }
        >
            Az oldal új címre költözött: <strong>elte-orarend.vercel.app</strong>, hogy elérhető legyen a hálózaton
            kívülről is! 🚀
        </Alert>
    );
};

export default InfoBox;
