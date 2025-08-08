import React, { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const InfoBox: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);

    if (!isOpen) return null;

    return (
        <Alert
            sx={{
                margin: 'auto',
            }}
            severity="info"
            action={
                <IconButton aria-label="close" color="inherit" size="small" onClick={() => setIsOpen(false)}>
                    <CloseIcon />
                </IconButton>
            }
        >
            Az oldal újra működik ELTE hálózaton kívül is 🥳🍾
        </Alert>
    );
};

export default InfoBox;
