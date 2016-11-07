import React, {PropTypes} from 'react'

import classNames from 'classnames'
import { List } from 'immutable'

class Select extends React.Component {

    componentDidMount() {
        const { onChange, value } = this.props
        $(this.refs.select).dropdown({ onChange })
        if (value) {
            $(this.refs.select).dropdown('set selected', value)
        }
    }

    componentWillReceiveProps(nextProps) {
        const { value } = nextProps
        if (!value) {
            const options = this._getOptions(nextProps.options)
            const firstOptionValue = options.length && options[0][0]
            if (firstOptionValue) {
                this.props.onChange(firstOptionValue)
            }
        } else {
            $(this.refs.select).dropdown('set selected', value)
        }
    }

    _getOptions = (options) => {
        const _options = []

        if (options) {
            if (Array.isArray(options) || List.isList(options)) {
                options.map((option) => _options.push([option, option]))
            } else {
                Object.keys(options).map((key) => _options.push([key, options[key].label]))
            }
        }

        return _options
    }

    render() {
        const { className, options } = this.props
        const selectClassName = classNames('ui search dropdown', className)
        const _options = this._getOptions(options)

        return (
            <span>
                <select className={selectClassName} ref="select">
                    {_options && _options.map((opt) => <option value={opt[0]} key={opt[0]}>{opt[1]}</option>)}
                </select>
            </span>
        )
    }

}

Select.propTypes = {
    className: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.any.isRequired,
    value: PropTypes.any,
}

export default Select
