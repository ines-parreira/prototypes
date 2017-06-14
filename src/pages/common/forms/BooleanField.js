import React, {PropTypes} from 'react'
import InputField from './InputField'
import classnames from 'classnames'
import {
    FormGroup,
    Label,
    Input as BootstrapInput,
    FormText,
} from 'reactstrap'

import Errors from './Errors'

import {defined} from '../../../utils'

import css from './InputField.less'

export default class BooleanField extends InputField {
    static propTypes = Object.assign({
        inline: PropTypes.bool,
    }, InputField.propTypes)

    static defaultProps = {
        type: 'checkbox',
    }

    _onChange = () => {
        const value = !this.props.value
        this.props.onChange(value)
    }

    _getField = () => {
        const {
            children,
            error,
            help, // eslint-disable-line
            inline, // eslint-disable-line
            label, // eslint-disable-line
            name, // eslint-disable-line
            onChange, // eslint-disable-line
            value,
            ...rest,
        } = this.props

        return (
            <BootstrapInput
                className={classnames('form-check-input', {
                    'form-control-danger': error,
                })}
                id={this.id}
                onChange={this._onChange}
                checked={value}
                {...rest}
            >
                {children}
            </BootstrapInput>
        )
    }

    render() {
        const color = this.props.error ? 'danger' : ''

        return (
            <FormGroup
                className={classnames({
                    [css.required]: this.props.required,
                    'd-inline-block': this.props.inline,
                })}
                color={color}
                check
            >
                <Label
                    htmlFor={this.id}
                    className="control-label"
                    check
                >
                    {this._getField()}
                    <span>
                        {this.props.label}
                    </span>
                </Label>
                {
                    this.props.error && (
                        <Errors>
                            {this.props.error}
                        </Errors>
                    )
                }
                {
                    defined(this.props.help) && (
                        <FormText color="muted">
                            {this.props.help}
                        </FormText>
                    )
                }
            </FormGroup>
        )
    }
}
