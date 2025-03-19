import classnames from 'classnames'
import _omit from 'lodash/omit'
import { Input as BootstrapInput, FormGroup, FormText, Label } from 'reactstrap'

import { defined } from 'utils'

import InputField, { InputFieldProps } from './DEPRECATED_InputField'
import Errors from './Errors'

import css from './DEPRECATED_InputField.less'

type Props = InputFieldProps<boolean>

/**
 * @deprecated
 * @date 2022-02-22
 * @type ui-component
 */
export default class DEPRECATED_BooleanField extends InputField<Props> {
    static defaultProps = {
        type: 'checkbox',
    }

    _onChange = () => {
        const value = !this.props.value
        const { onChange } = this.props
        if (onChange) {
            onChange(value)
        }
    }

    _getField = () => {
        const { children, error, value, ...rest } = _omit(this.props, [
            'help',
            'inline',
            'label',
            'name',
            'onChange',
            'className',
        ])

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
        const { className, error, required, inline, label, help, disabled } =
            this.props
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
                    <span style={{ verticalAlign: 'middle' }}>{label}</span>
                </Label>
                {this.props.error && <Errors>{error}</Errors>}
                {defined(help) && <FormText color="muted">{help}</FormText>}
            </FormGroup>
        )
    }
}
