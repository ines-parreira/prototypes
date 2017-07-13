import React, {PropTypes} from 'react'
import classnames from 'classnames'
import _uniqueId from 'lodash/uniqueId'
import {
    FormGroup,
    Label,
    Input as BootstrapInput,
    FormText,
} from 'reactstrap'

import Errors from './Errors'
import FormField from './FormField'

import {defined} from '../../../utils'

import css from './InputField.less'

export default class InputField extends FormField {
    static propTypes = Object.assign({
        children: PropTypes.node,
        inline: PropTypes.bool,
        placeholder: PropTypes.string,
        type: PropTypes.string.isRequired,
        rightAddon: PropTypes.string
    }, FormField.propTypes)

    static defaultProps = {
        type: 'text',
    }

    componentWillMount() {
        this.id = this._getId()
    }

    _onChange = (e) => {
        const value = e.target.value
        this.props.onChange(value)
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
            help, // eslint-disable-line
            inline, // eslint-disable-line
            label, // eslint-disable-line
            name, // eslint-disable-line
            onChange, // eslint-disable-line
            ...rest,
        } = this.props

        return (
            <BootstrapInput
                className={classnames({
                    'form-control-danger': error,
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
                className={classnames({
                    [css.required]: required,
                    'd-inline-block': inline,
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
                            <span className="input-group-addon">
                                {rightAddon}
                            </span>
                        )
                    }
                </div>
                {
                    error && (
                        <Errors>
                            {error}
                        </Errors>
                    )
                }
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

