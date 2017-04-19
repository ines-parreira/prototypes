import React, {PropTypes} from 'react'

import classNames from 'classnames'
import {List, Map, fromJS} from 'immutable'


class Select extends React.Component {
    _getOptions = () => {
        const {options} = this.props

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
        const {className, onChange, value} = this.props
        const selectClassName = classNames('ui search dropdown', className)
        const options = this._getOptions()

        return (
            <select
                className={selectClassName}
                value={value}
                onChange={e => onChange(e.target.value)}
            >
                {
                    options.map((option, idx) => (
                        <option
                            key={idx}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))
                }
            </select>
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
