// @flow
import React from 'react'
import {List} from 'immutable'
import sortBy from 'lodash/sortBy'
import _isObject from 'lodash/isObject'
import _noop from 'lodash/noop'

import 'react-select/dist/react-select.css'
import SelectField from '../../../forms/SelectField'

type Props = {
    className?: string,
    onChange: (any) => void,
    options: any,
    value: any,
    onSearchChange: (any) => void,
    placeholder?: string,
    focusedPlaceholder?: string
}

export default class Select extends React.Component<Props> {
    static defaultProps = {
        onSearchChange: _noop,
    }

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
        return sortBy(options, (option) => typeof option.label === 'string' && option.label.toLowerCase())
    }

    _onChange = (value: string | number) => {
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
        const {className, value, onSearchChange, placeholder, focusedPlaceholder} = this.props
        let newValue = value

        if (value === true) {
            newValue = 'true'
        } else if (value === false) {
            newValue = 'false'
        }

        return (
            <div
                style={{
                    display: 'inline-block',
                    verticalAlign: 'middle',
                }}
            >
                <SelectField
                    className={className}
                    value={newValue}
                    onChange={this._onChange}
                    onSearchChange={onSearchChange}
                    options={this._getOptions()}
                    placeholder={placeholder}
                    focusedPlaceholder={focusedPlaceholder}
                />
            </div>
        )
    }
}
