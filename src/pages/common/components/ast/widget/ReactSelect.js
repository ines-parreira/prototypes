import React, {PropTypes} from 'react'
import {List} from 'immutable'
import sortBy from 'lodash/sortBy'
import _isObject from 'lodash/isObject'

import 'react-select/dist/react-select.css'
import SelectField from '../../../forms/SelectField'

export default class Select extends React.Component {
    _getOptions = () => {
        let {options} = this.props

        if (options) {
            if (Array.isArray(options) || List.isList(options)) {
                options = options.map((option) => {
                    if (_isObject(option)) {
                        return option
                    }

                    return {
                        value: option.toString(),
                        label: option.toString(),
                    }
                })
            } else {
                options = Object.keys(options).map((key) => ({
                    value: key.toString(),
                    label: options[key].label
                }))
            }
        }
        // order alphabetically
        return sortBy(options, o => o.label.toLowerCase())
    }

    _onChange = (value) => {
        let val = value
        // We can't have boolean values so we're transforming them just before sending
        if (val === 'true') {
            val = true
        } else if (val === 'false') {
            val = false
        }
        this.props.onChange(val)
    }

    render() {

        return (
            <div
                style={{
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    paddingBottom: '3px',
                }}
            >
                <SelectField
                    value={this.props.value.toString()}
                    onChange={this._onChange}
                    options={this._getOptions()}
                />
            </div>
        )
    }
}

Select.propTypes = {
    className: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.any.isRequired,
    value: PropTypes.any,
}
