// Please use src/pages/common/forms/input/InputField.tsx instead
import { Component } from 'react'
import type { ChangeEvent, ReactNode } from 'react'

import classnames from 'classnames'
import _omit from 'lodash/omit'
import _uniqueId from 'lodash/uniqueId'
import { Input as BootstrapInput, FormGroup, FormText, Label } from 'reactstrap'
import type { InputProps } from 'reactstrap/lib/Input'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import css from 'pages/common/forms/DEPRECATED_InputField.less'
import Errors from 'pages/common/forms/Errors'
import { defined } from 'utils'

export type InputFieldProps<T = any> = {
    onChange?: (value: T) => void
    value?: T
    tooltipIcon?: ReactNode
} & Omit<InputProps, 'onChange' | 'value'>

export type InputFieldState = Record<string, unknown>

/**
 * @deprecated Use TextField from @gorgias/axiom instead
 * @date 2026-01-13
 * @type ui-kit-migration
 */
export default class InputField<
    T extends InputFieldProps = InputFieldProps,
    U extends InputFieldState = InputFieldState,
> extends Component<T, U> {
    static defaultProps: Pick<InputFieldProps, 'type'> = {
        type: 'text',
    }

    id?: string

    UNSAFE_componentWillMount() {
        this.id = this._getId()
    }

    _onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { type, onChange, caseInsensitive } = this.props
        let value: string | number = e.target.value

        if (type === 'number') {
            const numberValue = parseFloat(value)

            if (!isNaN(numberValue)) {
                value = numberValue
            }
        } else if (type === 'text' && caseInsensitive) {
            value = value.toString().toLowerCase()
        }
        if (onChange) {
            onChange(value)
        }
    }

    _getId = () => {
        const name: string = this.props.name ?? _uniqueId('input-')
        return `id-${name}`
    }

    _getField = () => {
        const { children, error, ...rest } = _omit(this.props, [
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
                className={classnames(css.field, {
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
            tooltipIcon,
            className,
            suffix,
        } = this.props
        const id = this.id

        const color = error ? 'danger' : ''

        if (type === 'hidden') {
            const hiddenInputProps = _omit(this.props, [
                'leftAddon',
                'rightAddon',
            ])

            return <input {...hiddenInputProps} />
        }

        return (
            <FormGroup
                className={classnames('InputField', className, {
                    [css.required]: required,
                    'd-inline-block': inline,
                })}
                color={color}
            >
                {label && tooltip && (
                    <div className={css['label-wrapper']}>
                        <Label htmlFor={id} className="control-label">
                            {label}
                        </Label>
                        <span id={`${id!}-tooltip`}>
                            {tooltipIcon ? (
                                tooltipIcon
                            ) : (
                                <i
                                    className={classnames(
                                        'material-icons-outlined',
                                        css.tooltip,
                                    )}
                                >
                                    info
                                </i>
                            )}
                        </span>

                        <Tooltip
                            target={`${id as string}-tooltip`}
                            innerProps={{
                                style: {
                                    textAlign: 'left',
                                },
                            }}
                        >
                            {tooltip}
                        </Tooltip>
                    </div>
                )}
                {label && !tooltip && (
                    <Label htmlFor={id} className="control-label">
                        {label}
                    </Label>
                )}
                <div
                    className={classnames({
                        'input-group': !!rightAddon || !!leftAddon,
                        [css['with-suffix']]: !!suffix,
                        [css.select]: type === 'select',
                        'dropdown-toggle': type === 'select',
                    })}
                >
                    {leftAddon && (
                        <span className="input-group-append">
                            <span
                                className={classnames(
                                    'input-group-text',
                                    css.inputGroupText,
                                )}
                            >
                                {leftAddon}
                            </span>
                        </span>
                    )}
                    {this._getField()}
                    {rightAddon && (
                        <span className="input-group-append">
                            <span
                                className={classnames(
                                    'input-group-text',
                                    css.inputGroupText,
                                )}
                            >
                                {rightAddon}
                            </span>
                        </span>
                    )}
                    {suffix && (
                        <div className={css['input-suffix-wrapper']}>
                            <div className={css.spacer}>{this.props.value}</div>
                            <div className={css.suffix}>{suffix}</div>
                        </div>
                    )}
                    {error && <Errors>{error}</Errors>}
                </div>
                {defined(help) && <FormText color="muted">{help}</FormText>}
            </FormGroup>
        )
    }
}
