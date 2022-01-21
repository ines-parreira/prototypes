import React, {Component} from 'react'
import {FormGroup, Input, Label, FormText} from 'reactstrap'

import css from './RadioField.less'

type Props = {
    options: Array<{
        value: any
        label: string
        description?: string
    }>
    value: any | null
    onChange: (value: any) => void
    disabled: boolean
    label?: string
}

export default class RadioField extends Component<Props> {
    static defaultProps = {
        disabled: false,
    }

    _onChange = (value: any) => {
        this.props.onChange(value)
    }

    render() {
        const {options, value: selectedValue, disabled, label} = this.props

        return (
            <FormGroup tag="fieldset">
                {!!label && <Label className="control-label">{label}</Label>}
                {options.map((option) => (
                    <FormGroup
                        key={option.value}
                        className={css.formGroup}
                        check
                    >
                        <Input
                            type="radio"
                            checked={selectedValue === option.value}
                            onChange={
                                disabled
                                    ? undefined
                                    : () => this._onChange(option.value)
                            }
                            disabled={disabled}
                        />
                        <Label
                            className="control-label ml-2"
                            onClick={
                                disabled
                                    ? undefined
                                    : () => this._onChange(option.value)
                            }
                            check
                        >
                            {option.label}
                        </Label>
                        {option.description && (
                            <FormText className={css.description} color="muted">
                                {option.description}
                            </FormText>
                        )}
                    </FormGroup>
                ))}
            </FormGroup>
        )
    }
}
