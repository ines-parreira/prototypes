import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {FormGroup, Label, Input as BootstrapInput, FormText} from 'reactstrap'

import {defined} from '../../../utils.ts'

import Errors from './Errors'

import InputField from './InputField'

import css from './InputField.less'

export default class BooleanField extends InputField {
    static propTypes = Object.assign(
        {
            inline: PropTypes.bool,
        },
        InputField.propTypes
    )

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
            ...rest
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
        const {
            className,
            error,
            required,
            inline,
            label,
            help,
            disabled,
        } = this.props
        const color = error ? 'danger' : ''

        return (
            <FormGroup
                className={classnames(className, {
                    [css.required]: required,
                    'd-inline-block': inline,
                    'text-muted': disabled,
                })}
                color={color}
                check
            >
                <Label htmlFor={this.id} className="control-label" check>
                    {this._getField()}
                    <span style={{verticalAlign: 'middle'}}>{label}</span>
                </Label>
                {this.props.error && <Errors>{error}</Errors>}
                {defined(help) && <FormText color="muted">{help}</FormText>}
            </FormGroup>
        )
    }
}
