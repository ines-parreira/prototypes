import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import _uniqueId from 'lodash/uniqueId'
import {
    FormGroup,
    Label,
    Input as BootstrapInput,
    FormText,
} from 'reactstrap'

import {defined} from '../../../utils'

import Errors from './Errors'
import FormField from './FormField'


import css from './InputField.less'

export default class InputField extends FormField {
    static propTypes = Object.assign({
        children: PropTypes.node,
        inline: PropTypes.bool,
        placeholder: PropTypes.node,
        type: PropTypes.string.isRequired,
        rightAddon: PropTypes.string,
        caseInsensitive: PropTypes.bool
    }, FormField.propTypes)

    static defaultProps = {
        type: 'text'
    }

    componentWillMount() {
        this.id = this._getId()
    }

    _onChange = (e) => {
        const {type, onChange, caseInsensitive} = this.props
        let value = e.target.value

        if (type === 'number') {
            let numberValue = parseFloat(value)

            if (!isNaN(numberValue)) {
                value = numberValue
            }
        } else if (type === 'text' && caseInsensitive) {
            value = value.toLowerCase()
        }

        onChange(value)
    }

    _getId = () => {
        const name = this.props.name || _uniqueId('input-')
        return `id-${name}`
    }

    _getField = () => {
        const {
            children,
            error,
            rightAddon, // eslint-disable-line
            caseInsensitive,  // eslint-disable-line
            help, // eslint-disable-line
            inline, // eslint-disable-line
            label, // eslint-disable-line
            name, // eslint-disable-line
            onChange, // eslint-disable-line
            className, // eslint-disable-line
            ...rest
        } = this.props

        return (
            <BootstrapInput
                className={classnames({
                    'form-control-danger': error,
                    'is-invalid': error
                })}
                id={this.id}
                onChange={this._onChange}
                {...rest}
            >
                {children}
            </BootstrapInput>
        )
    }

    render() {
        const {
            error,
            type,
            required,
            inline,
            label,
            rightAddon,
            help,
            className,
        } = this.props

        const color = error ? 'danger' : ''

        if (type === 'hidden') {
            const {
                rightAddon, // eslint-disable-line
                ...rest
            } = this.props

            return <input {...rest} />
        }

        return (
            <FormGroup
                className={classnames('InputField', className, {
                    [css.required]: required,
                    'd-inline-block': inline
                })}
                color={color}
            >
                {
                    label && (
                        <Label
                            htmlFor={this.id}
                            className="control-label"
                        >
                            {label}
                        </Label>
                    )
                }
                <div className={classnames({'input-group': !!rightAddon})}>
                    {this._getField()}
                    {
                        rightAddon && (
                            <span className="input-group-append">
                                <span className="input-group-text">
                                    {rightAddon}
                                </span>
                            </span>
                        )
                    }
                    {
                        error && (
                            <Errors>
                                {error}
                            </Errors>
                        )
                    }
                </div>
                {
                    defined(help) && (
                        <FormText color="muted">
                            {help}
                        </FormText>
                    )
                }
            </FormGroup>
        )
    }
}

