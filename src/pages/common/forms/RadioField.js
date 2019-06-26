import React from 'react'
import {FormGroup, Input, Label, FormText} from 'reactstrap'


type Props = {
    options: Array<{
        value: any,
        label: string,
        description?: string
    }>,
    value: ?any,
    onChange: (any) => void,
    disabled: boolean
}

export default class RadioField extends React.Component<Props> {
    static defaultProps = {
        disabled: false
    }

    _onChange = (value: any) => {
        this.props.onChange(value)
    }

    render() {
        const {options, value: selectedValue, disabled} = this.props

        return (
            <FormGroup tag="fieldset">
                {
                    options.map((option) => (
                        <FormGroup
                            key={option.value}
                            className="mb-2"
                            check
                        >
                            <Input
                                type="radio"
                                checked={selectedValue === option.value}
                                onChange={disabled ? null : () => this._onChange(option.value)}
                                disabled={disabled}
                            />
                            <Label
                                className="control-label ml-2"
                                onClick={disabled ? null : () => this._onChange(option.value)}
                                check
                            >
                                {option.label}
                                {
                                    option.description && (
                                        <FormText color="muted">
                                            {option.description}
                                        </FormText>
                                    )
                                }
                            </Label>
                        </FormGroup>
                    ))
                }
            </FormGroup>
        )
    }
}
