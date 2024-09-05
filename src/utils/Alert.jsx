import Snackbar from '@mui/material/Snackbar';
import MUIAlert from '@mui/material/Alert';

const Alert = ({ alertText, handleClose }) => {
    return (
        <Snackbar open={alertText !== ''} autoHideDuration={3000} onClose={handleClose}>
            <MUIAlert severity="success" variant="filled" onClose={handleClose} sx={{ width: '100%' }}>
                {alertText}
            </MUIAlert>
        </Snackbar>
    );
};

export default Alert;
