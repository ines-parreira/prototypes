import React from 'react'
import classnames from 'classnames'
import _omit from 'lodash/omit'
import _uniqueId from 'lodash/uniqueId'
import PropTypes from 'prop-types'
import {FormGroup, FormText, Input as BootstrapInput, Label} from 'reactstrap'

import {defined} from '../../../utils.ts'
import Tooltip from '../components/Tooltip.tsx'

import Errors from './Errors'
import FormField from './FormField'

import css from './InputField.less'

export default class InputField extends FormField {
    static propTypes = Object.assign(
        {
            children: PropTypes.node,
            inline: PropTypes.bool,
            placeholder: PropTypes.node,
            type: PropTypes.string.isRequired,
            leftAddon: PropTypes.string,
            rightAddon: PropTypes.string,
            caseInsensitive: PropTypes.bool,
            tooltip: PropTypes.string,
        },
        FormField.propTypes
    )

    static defaultProps = {
        type: 'text',
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
        const {children, error, ...rest} = _omit(this.props, [
            'leftAddon',
            'rightAddon',
            'caseInsensitive',
            'help',
            'inline',
            'label',
            'name',
            'onChange',
            'tooltip',
            'className',
        ])

        return (
            <BootstrapInput
                className={classnames({
                    'form-control-danger': error,
                    'is-invalid': error,
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
            leftAddon,
            rightAddon,
            help,
            tooltip,
            className,
        } = this.props

        const color = error ? 'danger' : ''

        if (type === 'hidden') {
            const {
                leftAddon, // eslint-disable-line
                rightAddon, // eslint-disable-line
                ...rest
            } = this.props

            return <input {...rest} />
        }

        return (
            <FormGroup
                className={classnames('InputField', className, {
                    [css.required]: required,
                    'd-inline-block': inline,
                })}
                color={color}
            >
                {label && (
                    <Label htmlFor={this.id} className="control-label">
                        {label}
                        {tooltip && (
                            <>
                                <i
                                    id={`${this.id}-tooltip`}
                                    className={classnames(
                                        'material-icons-outlined',
                                        css.tooltip
                                    )}
                                >
                                    info
                                </i>
                                <Tooltip target={`${this.id}-tooltip`}>
                                    {tooltip}
                                </Tooltip>
                            </>
                        )}
                    </Label>
                )}
                <div
                    className={classnames({
                        'input-group': !!rightAddon || !!leftAddon,
                    })}
                >
                    {leftAddon && (
                        <span className="input-group-append">
                            <span className="input-group-text">
                                {leftAddon}
                            </span>
                        </span>
                    )}
                    {this._getField()}
                    {rightAddon && (
                        <span className="input-group-append">
                            <span className="input-group-text">
                                {rightAddon}
                            </span>
                        </span>
                    )}
                    {error && <Errors>{error}</Errors>}
                </div>
                {defined(help) && <FormText color="muted">{help}</FormText>}
            </FormGroup>
        )
    }
}
