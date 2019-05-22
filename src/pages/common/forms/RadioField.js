import React from 'react'
import {FormGroup, Input, Label, FormText} from 'reactstrap'


type Props = {
    options: Array<{
        value: any,
        label: string,
        description?: string
    }>,
    value: ?any,
    onChange: (any) => void
}

export default class RadioField extends React.Component<Props> {
    render() {
        const {options, value: selectedValue, onChange} = this.props

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
                                onChange={() => onChange(option.value)}
                            />
                            <Label
                                className="control-label ml-2"
                                onClick={() => onChange(option.value)}
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
