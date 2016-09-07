import React from 'react'

import classNames from 'classnames'

const TextAreaField = ({input, label, placeholder, required}) => {
    const fieldClassName = classNames({ required }, 'field')
    return (
        <div className={fieldClassName}>
            {label && <label htmlFor={input.name}>{label}</label>}
            <textarea {...input} placeholder={placeholder} />
        </div>
    )
}

TextAreaField.defaultProps = {
    required: false,
}

TextAreaField.propTypes = {
    input: React.PropTypes.object.isRequired,
    label: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    required: React.PropTypes.bool,
}

export default TextAreaField
