import React from 'react'

import classNames from 'classnames'

const InputField = ({input, label, placeholder, required}) => {
    const fieldClassName = classNames({ required }, 'field')
    return (
        <div className={fieldClassName}>
            {label && <label htmlFor={input.name}>{label}</label>}
            <input {...input} placeholder={placeholder} />
        </div>
    )
}

InputField.defaultProps = {
    required: false,
}

InputField.propTypes = {
    input: React.PropTypes.object.isRequired,
    label: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    required: React.PropTypes.bool,
}

export default InputField
