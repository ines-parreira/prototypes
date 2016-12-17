import React, {PropTypes} from 'react'
import _noop from 'lodash/noop'
import classNames from 'classnames'
import ErrorMessage from '../../../common/components/ErrorMessage'

const InputField = ({type, input, meta, className, label, placeholder, required, buttons}) => {
    const hasButtons = !!buttons.length

    const fieldClassName = classNames({
        required,
    }, className, 'ui', 'field')

    const inputClassName = classNames({
        action: hasButtons,
    }, 'ui', 'input')

    const props = input

    props.type = type

    if (required) {
        props.required = true
    }

    return (
        <div className={fieldClassName}>
            {label && <label htmlFor={input.name}>{label}</label>}
            <div className={inputClassName}>
                <input {...props} placeholder={placeholder} />
                {
                    hasButtons && (
                        buttons.map((button, i) => {
                            return (
                                <button
                                    key={i}
                                    className={classNames('ui', 'button', button.className || '')}
                                    type="button"
                                    onClick={button.onClick || _noop}
                                >
                                    {button.label}
                                </button>
                            )
                        })
                    )
                }
            </div>
            {meta.invalid && meta.touched && <ErrorMessage errors={meta.error} />}
            {meta.touched && <ErrorMessage errors={meta.warning} isWarning />}
        </div>
    )
}

InputField.defaultProps = {
    className: '',
    required: false,
    type: 'text',
    buttons: [],
}

InputField.propTypes = {
    type: PropTypes.string.isRequired,
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    className: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    buttons: PropTypes.array
}

export default InputField
