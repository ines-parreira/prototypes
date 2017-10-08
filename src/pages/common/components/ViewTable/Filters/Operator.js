import React, {PropTypes} from 'react'
import {Input} from 'reactstrap'
import {collectionOperators} from '../../../../../config/rules'

export default class Operator extends React.Component {
    static propTypes = {
        index: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        operators: PropTypes.object.isRequired,
        selected: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired
    }

    _options = () => {
        const {operators} = this.props

        return Object.keys(operators)
            .map((operator) => ({
                value: operator,
                name: operators[operator].label
            }))
            .filter((operator) => !collectionOperators.includes(operator.value))
    }

    render() {
        const {onChange, selected} = this.props

        const options = this._options()

        return (
            <Input
                className="d-inline"
                style={{width: 'auto'}}
                type="select"
                value={selected}
                onChange={e => onChange(this.props.index, e.target.value)}
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
