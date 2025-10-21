import React from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// type=> info, success, warning, error, default
const Toaster = (props) => {
    return (
        <>
            <ToastContainer
                position={props.position ? props.position : 'bottom-center'} //top-left, top-right, top-center, bottom-left, bottom-right, bottom-center
                autoClose={props.duration ? props.duration : 5000}
                hideProgressBar={props.hideProgressBar}
                newestOnTop={props.newestOnTop}
                closeOnClick
                rtl={props.rtl}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                limit={props.limit}
                theme={'colored'} //light(default), dark, colored
            />
        </>
    );
}

export default Toaster;