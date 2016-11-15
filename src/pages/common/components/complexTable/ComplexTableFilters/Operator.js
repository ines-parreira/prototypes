import React, {PropTypes, Component} from 'react'
import {fromJS} from 'immutable'

export default class Operator extends Component {
    static propTypes = {
        index: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        operators: PropTypes.object.isRequired,
        selected: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired
    }

    componentDidMount() {
        const {index, onChange} = this.props
        $(this.refs.select).dropdown({
            onChange: (value) => onChange(index, value)
        })
    }

    // Update semantic dropdown when it necessary
    componentWillReceiveProps(nextProps) {
        const {index, selected, operators, onChange} = this.props
        // update index of field
        if (index !== nextProps.index) {
            $(this.refs.select).dropdown('refresh').dropdown({
                onChange: (value) => onChange(nextProps.index, value)
            })
        }

        // update options
        if (!fromJS(operators).equals(fromJS(nextProps.operators))) {
            setTimeout(() => {
                $(this.refs.select).dropdown('setup menu', {
                    values: this._options(nextProps.operators)
                })
            }, 1)
        }

        // update selected value
        if (selected !== nextProps.selected) {
            setTimeout(() => {
                $(this.refs.select).dropdown('set selected', nextProps.selected)
            }, 1)
        }
    }

    _options(operators) {
        return Object.keys(operators).map((operator) => ({
            value: operator,
            name: operators[operator].label
        }))
    }

    render() {
        const {operators, selected} = this.props
        return (
            <select ref="select" className="ui dropdown Operator" defaultValue={selected}>
                {this._options(operators).map((operator, index) => (
                    <option key={index} value={operator.value}>
                        {operator.name}
                    </option>
                ))}
            </select>
        )
    }
}
