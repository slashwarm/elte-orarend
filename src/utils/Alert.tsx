import MUIAlert from '@mui/material/Alert';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';

const Alert = ({ alertText, handleClose }:{
    alertText:string, 
    handleClose?:(event:React.SyntheticEvent<any> | Event, reason:SnackbarCloseReason) => void
}) => {
    return (
        <Snackbar open={alertText !== ''} autoHideDuration={3000} onClose={handleClose}>
            <MUIAlert severity="success" variant="filled" sx={{ width: '100%' }}>
                {alertText}
            </MUIAlert>
        </Snackbar>
    );
};

export default Alert;
