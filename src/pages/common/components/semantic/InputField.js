import React from 'react'

import classNames from 'classnames'

const InputField = ({type, input, meta, label, placeholder, required}) => {
    const fieldClassName = classNames({ required }, 'field')
    const typeProp = {type, required}
    return (
        <div className={fieldClassName}>
            {label && <label htmlFor={input.name}>{label}</label>}
            <input {...typeProp} {...input} placeholder={placeholder} />
            {
                meta.invalid && meta.error && (
                    <div className="ui error message"><p>{meta.error}</p></div>
                )
            }
        </div>
    )
}

InputField.defaultProps = {
    required: false
}

InputField.propTypes = {
    type: React.PropTypes.string.isRequired,
    input: React.PropTypes.object.isRequired,
    meta: React.PropTypes.object.isRequired,
    label: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    required: React.PropTypes.bool,
}

export default InputField
