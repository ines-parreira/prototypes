import React, {PropTypes} from 'react'

import classNames from 'classnames'
import {List, Map, fromJS} from 'immutable'


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
                const immutableOptions = fromJS(options)

                if (!immutableOptions.isEmpty() && Map.isMap(immutableOptions.get(0))) {
                    // if options is of format: [{value: v, label: l}, {value: v, label: l}]
                    immutableOptions.map(option => _options.push(option.toJS()))
                } else {
                    // if options is of format: [value, value, value]
                    immutableOptions.map((option) => _options.push({value: option, label: option}))
                }
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
                    {
                        _options && _options.map((opt, idx) => (
                            <option value={opt.value} key={idx}>{opt.label}</option>
                        ))
                    }
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
