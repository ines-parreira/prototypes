import React from 'react'
import PropTypes from 'prop-types'
import {Input} from 'reactstrap'


export default class Operator extends React.Component {
    static propTypes = {
        index: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        operators: PropTypes.object.isRequired,
        selected: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired
    }

    render() {
        const {onChange, selected, operators} = this.props

        const options = Object.keys(operators)
            .map((operator) => ({
                value: operator,
                name: operators[operator].label
            }))

        if (!Object.keys(operators).includes(selected)) {
            let operatorLabel = selected
            if (selected === 'notContains') {
                operatorLabel = 'does not contain'
            }
            options.push({
                value: selected,
                name: operatorLabel
            })
        }

        return (
            <Input
                className="d-inline"
                style={{width: 'auto'}}
                type="select"
                value={selected}
                bsSize="sm"
                onChange={(e) => onChange(this.props.index, e.target.value)}
            >
                {
                    options.map((option, index) => (
                        <option
                            key={index}
                            value={option.value}
                        >
                            {option.name}
                        </option>
                    ))
                }
            </Input>
        )
    }
}
