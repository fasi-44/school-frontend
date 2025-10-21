import React from 'react';

const MandatoryIndicator = (props) => (
    <span>{props?.label}{props?.isRequired && <span style={{ color: '#dc3545' }}>&nbsp;*</span>}</span>
);
export default MandatoryIndicator;