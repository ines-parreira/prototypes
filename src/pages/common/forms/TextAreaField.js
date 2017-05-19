import React from 'react'
import classNames from 'classnames'
import {Label} from 'reactstrap'

export default class TextAreaField extends React.Component {
    render() {
        const {input, label, placeholder, required, rows} = this.props
        const props = input

        if (required) {
            props.required = true
        }

        const fieldClassName = classNames({required}, 'field')

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
                <textarea
                    className="form-control"
                    {...props}
                    rows={rows}
                    placeholder={placeholder}
                />
            </div>
        )
    }
}

TextAreaField.defaultProps = {
    required: false
}

TextAreaField.propTypes = {
    input: React.PropTypes.object.isRequired,
    label: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    required: React.PropTypes.bool,
    rows: React.PropTypes.string
}
