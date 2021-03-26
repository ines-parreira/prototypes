import React, {ChangeEvent} from 'react'
import {Input} from 'reactstrap'

import {OperatorType} from './types'

type Option = {value: string; name: string}

type Props = {
    index: number
    operators: Record<string, OperatorType>
    selected: string
    onChange: (index: number, value: string) => void
}

export default class Operator extends React.Component<Props> {
    render() {
        const {onChange, selected, operators} = this.props

        const options: Option[] = Object.keys(operators).map(
            (operator: string) => ({
                value: operator,
                name: operators[operator].label,
            })
        )

        if (!Object.keys(operators).includes(selected)) {
            options.push({
                value: selected,
                name: selected,
            })
        }

        return (
            <Input
                className="d-inline"
                style={{width: 'auto'}}
                type="select"
                value={selected}
                bsSize="sm"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onChange(this.props.index, e.target.value)
                }
            >
                {options.map((option: Option, index: number) => (
                    <option key={index} value={option.value}>
                        {option.name}
                    </option>
                ))}
            </Input>
        )
    }
}
