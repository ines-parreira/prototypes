import React, {PropTypes} from 'react'

const CheckboxField = ({type, input, name, className, disabled, label, labelClassName}) => {
    const fieldName = name || input.name

    return (
        <div
            className={`ui checkbox ${className}`}
        >
            <input
                id={fieldName}
                name={fieldName}
                type={type}
                disabled={disabled || input.disabled}
                checked={input.value}
                onChange={input.onChange}
            />
            {label && (
                <label
                    htmlFor={fieldName}
                    className={labelClassName}
                >
                    {label}
                </label>
            )}
        </div>
    )
}

CheckboxField.defaultProps = {
    type: 'checkbox',
    hideLabel: false,
    className: '',
    labelClassName: '',
}

CheckboxField.propTypes = {
    input: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    name: PropTypes.string,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    labelClassName: PropTypes.string,
}

export default CheckboxField
