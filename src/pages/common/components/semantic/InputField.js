import React from 'react'

import classNames from 'classnames'

const InputField = ({type, input, meta, className, label, placeholder, required}) => {
    const fieldClassName = classNames({required}, className, 'field')
    const props = input

    props.type = type

    if (required) {
        props.required = true
    }

    return (
        <div className={fieldClassName}>
            {label && <label htmlFor={input.name}>{label}</label>}
            <input {...props} placeholder={placeholder} />
            {
                meta.invalid && meta.error && (
                    <div className="ui error message"><p>{meta.error}</p></div>
                )
            }
        </div>
    )
}

InputField.defaultProps = {
    className: '',
    required: false,
    type: 'text'
}

InputField.propTypes = {
    type: React.PropTypes.string.isRequired,
    input: React.PropTypes.object.isRequired,
    meta: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
    label: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    required: React.PropTypes.bool,
}

export default InputField
