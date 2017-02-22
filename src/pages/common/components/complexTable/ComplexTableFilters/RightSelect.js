import React, {PropTypes, Component} from 'react'

export default class RightSelect extends Component {
    static propTypes = {
        node: PropTypes.object.isRequired,
        options: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
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
        const {index, onChange, node} = this.props
        // update index of field
        if (index !== nextProps.index) {
            $(this.refs.select).dropdown('refresh').dropdown({
                onChange: (value) => onChange(nextProps.index, value)
            })
        }

        // update selected value
        if (node.value !== nextProps.node.value) {
            setTimeout(() => {
                $(this.refs.select).dropdown('set selected', nextProps.node.value)
            }, 1)
        }
    }

    render() {
        const {node, options} = this.props
        return (
            <div className="view-filters-expression-value">
                <select ref="select" className="ui search dropdown" defaultValue={node.value}>
                    {options.map((option, index) => (
                        <option key={index} value={option.get('id')}>
                            {option.get('name')}
                        </option>
                    ))}
                </select>
            </div>
        )
    }
}
