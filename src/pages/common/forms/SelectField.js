import React, {PropTypes} from 'react'
import {Input, FormText} from 'reactstrap'

class SelectField extends React.Component {
    componentDidMount() {
        if (!this.props.input.value && this.props.defaultValue) {
            this.props.input.onChange(this.props.defaultValue)
        }
    }

    render() {
        const {
            children,
            input,
            label,
            required,
            tooltip,
            help,
            defaultValue, // eslint-disable-line
            meta, // eslint-disable-line
            ...rest,
        } = this.props

        return (
            <div className="ui field">
                {
                    label && (
                        <label
                            htmlFor={input.name}
                            className="control-label"
                        >
                            {label}
                            {tooltip}
                        </label>
                    )
                }
                <Input
                    type="select"
                    required={required}
                    value={input.value}
                    onChange={e => input.onChange(e.target.value)}
                    {...rest}
                >
                    {
                        !required && (
                            <option value="" />
                        )
                    }
                    {children}
                </Input>
                {
                    help && (
                        <FormText color="muted">
                            {help}
                        </FormText>
                    )
                }
            </div>
        )
    }
}

SelectField.defaultProps = {
    required: false,
}

SelectField.propTypes = {
    children: PropTypes.node,
    defaultValue: PropTypes.string,
    help: PropTypes.node,
    input: PropTypes.object.isRequired,
    label: PropTypes.string,
    required: PropTypes.bool,
    tooltip: PropTypes.node,
}

export default SelectField
