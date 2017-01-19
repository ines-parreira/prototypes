import React, {PropTypes} from 'react'

const CheckboxField = ({type, input, name, className, label, labelClassName}) => (
    <div
        className={`ui checkbox ${className}`}
    >
        <input
            name={name}
            type={type}
            disabled={input.disabled}
            checked={input.value}
            onChange={input.onChange}
        />
        {label && (
            <label
                htmlFor={name}
                className={labelClassName}
            >
                {label}
            </label>
        )}
    </div>
)

CheckboxField.defaultProps = {
    type: 'checkbox',
    hideLabel: false,
    className: '',
    labelClassName: '',
}

CheckboxField.propTypes = {
    input: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    className: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    labelClassName: PropTypes.string,
}

export default CheckboxField
