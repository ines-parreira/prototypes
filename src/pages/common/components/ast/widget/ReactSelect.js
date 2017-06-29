import React, {PropTypes} from 'react'
import ReactSelect from 'react-select'
import {List} from 'immutable'
import sortBy from 'lodash/sortBy'
import _isObject from 'lodash/isObject'

import 'react-select/dist/react-select.css'

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
        let val = value.value
        // We can't have boolean values so we're transforming them just before sending
        if (val === 'true') {
            val = true
        } else if (val === 'false') {
            val = false
        }
        this.props.onChange(val)
    }

    render() {
        const {value} = this.props
        const options = this._getOptions()
        // get the longest label option to determine the perfect width of the select
        const longestOption = [...options]
            .sort((option1, option2) => option1.label.length - option2.label.length)
            .slice(-1)[0]
        // 6: approximate width for a character
        // 50: padding + width of the arrow of the select
        let selectWidth = 120
        if (longestOption && longestOption.label) {
            selectWidth = longestOption.label.length * 6 + 50
        }

        return (
            <div
                style={{
                    display: 'inline-block',
                    width: `${selectWidth}px`,
                    verticalAlign: 'middle',
                    paddingBottom: '3px',
                }}
            >
                <ReactSelect
                    value={value.toString()}
                    clearable={false}
                    onChange={this._onChange}
                    options={options}
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
