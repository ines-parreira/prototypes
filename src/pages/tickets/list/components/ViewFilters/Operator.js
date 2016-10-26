import React, {PropTypes} from 'react'

export default class Operator extends React.Component {
    componentDidMount() {
        $(this.refs.select).dropdown({
            onChange: (value) => this.props.onChange(this.props.index, value)
        })
    }

    componentWillReceiveProps(nextProps) {
        const {index, onChange} = this.props
        // here re-apply `dropdown` function to update `index` in the `onChange` function otherwise
        // it will keep the previous `index`, and when `onChange` function will be executed,
        // it will change operator of an other condition instead of this one
        if (index !== nextProps.index) {
            $(this.refs.select).dropdown({
                onChange: (value) => onChange(index, value)
            })
        }
    }

    render() {
        const {operators, selected} = this.props
        return (
            <select ref="select" className="ui dropdown Operator" defaultValue={selected}>
                {Object.keys(operators).map((operator, index) => (
                    <option key={index} value={operator}>{operators[operator].label}</option>
                ))}
            </select>
        )
    }
}

Operator.propTypes = {
    index: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    operators: PropTypes.object.isRequired,
    selected: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
}
