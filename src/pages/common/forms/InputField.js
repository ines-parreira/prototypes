import React, {PropTypes} from 'react'
import _noop from 'lodash/noop'
import classNames from 'classnames'
import {Label, Input, InputGroupButton, Button, FormText} from 'reactstrap'

import ErrorMessage from '../components/ErrorMessage'

const InputField = ({type, input, meta, className, label, help, placeholder, required, readOnly, buttons}) => {
    const hasButtons = !!buttons.length

    const fieldClassName = classNames({
        required,
    }, className, 'field')

    const inputClassName = classNames({
        'input-group': hasButtons,
        disabled: readOnly,
    })

    const inputProps = input

    inputProps.type = type
    inputProps.readOnly = readOnly

    if (required) {
        inputProps.required = true
    }

    if (type === 'hidden') {
        return <input {...inputProps} />
    }

    return (
        <div className={fieldClassName}>
            {
                label && (
                    <Label
                        htmlFor={input.name}
                        className="control-label"
                    >
                        {label}
                    </Label>
                )
            }
            <div className={inputClassName}>
                <Input
                    placeholder={placeholder}
                    {...inputProps}
                />
                {
                    hasButtons && (
                        buttons.map((button, i) => {
                            return (
                                <InputGroupButton
                                    key={i}
                                >
                                    <Button
                                        className={button.className}
                                        type="button"
                                        onClick={button.onClick || _noop}
                                    >
                                        {button.label}
                                    </Button>
                                </InputGroupButton>
                            )
                        })
                    )
                }
            </div>
            {
                help && (
                    <FormText color="muted">
                        {help}
                    </FormText>
                )
            }
            {
                meta.invalid && meta.touched && (
                    <ErrorMessage errors={meta.error} />
                )
            }
            {
                meta.touched && (
                    <ErrorMessage errors={meta.warning} isWarning />
                )
            }
        </div>
    )
}

InputField.defaultProps = {
    className: '',
    required: false,
    readOnly: false,
    type: 'text',
    buttons: [],
    meta: {},
}

InputField.propTypes = {
    type: PropTypes.string.isRequired,
    input: PropTypes.object.isRequired,
    help: PropTypes.string,
    meta: PropTypes.object.isRequired,
    className: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    buttons: PropTypes.array,
    readOnly: PropTypes.bool
}

export default InputField
