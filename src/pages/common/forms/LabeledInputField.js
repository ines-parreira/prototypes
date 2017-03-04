import React, {PropTypes} from 'react'
import _noop from 'lodash/noop'
import classNames from 'classnames'
import ErrorMessage from '../components/ErrorMessage'

const LabeledInputField = ({
        type, input, meta, className, label, leftLabel, rightLabel, placeholder, required, readOnly, buttons, maxWidth
    }) => {
    const hasButtons = !!buttons.length

    const fieldClassName = classNames({
        required,
    }, className, 'ui', 'field')

    const inputClassName = classNames({
        action: hasButtons,
        disabled: readOnly,
    }, 'ui', 'right', 'labeled', 'input')

    const props = input

    props.type = type

    if (required) {
        props.required = true
    }

    return (
        <div className={fieldClassName}>
            {label && <label htmlFor={input.name}>{label}</label>}
            <div className={inputClassName} style={{maxWidth}}>
                {
                    !!leftLabel && (
                        <div className="ui label">
                            {leftLabel}
                        </div>
                    )
                }
                <input {...props} placeholder={placeholder} />
                {
                    !!rightLabel && (
                        <div className="ui label">
                            {rightLabel}
                        </div>
                    )
                }
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
            {meta.invalid && <ErrorMessage errors={meta.error} />}
            {meta.touched && <ErrorMessage errors={meta.warning} isWarning />}
        </div>
    )
}

LabeledInputField.defaultProps = {
    className: '',
    required: false,
    readOnly: false,
    type: 'text',
    buttons: [],
    maxWidth: null
}

LabeledInputField.propTypes = {
    type: PropTypes.string.isRequired,
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    className: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    leftLabel: PropTypes.string,
    rightLabel: PropTypes.string,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    buttons: PropTypes.array,
    readOnly: PropTypes.bool,
    maxWidth: PropTypes.string
}

export default LabeledInputField
