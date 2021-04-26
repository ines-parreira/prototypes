import React, {Component} from 'react'
import {List} from 'immutable'
import sortBy from 'lodash/sortBy'
import _isObject from 'lodash/isObject'
import _noop from 'lodash/noop'

import 'react-select/dist/react-select.css'
import SelectField from '../../../forms/SelectField/SelectField.js'
import {
    Option as SelectOption,
    Value as SelectValue,
} from '../../../forms/SelectField/types'

type Props = {
    className?: string
    onChange: (value: any) => void
    options: SelectOption[]
    value: Maybe<string | number | boolean>
    onSearchChange: (value: any) => void
    placeholder?: string
    focusedPlaceholder?: string
}

export default class Select extends Component<Props> {
    static defaultProps: Pick<Props, 'onSearchChange'> = {
        onSearchChange: _noop,
    }

    _getOptions = () => {
        const {options} = this.props
        let formattedOptions: SelectOption[]

        if (options) {
            if (Array.isArray(options) || List.isList(options)) {
                formattedOptions = options.map((option) => {
                    if (_isObject(option)) {
                        return option
                    }

                    return {
                        value: (option as number).toString(),
                        label: (option as number).toString(),
                    }
                })
            } else {
                formattedOptions = Object.keys(options).map<SelectOption>(
                    (key) => ({
                        value: key.toString(),
                        label: (options[
                            (key as unknown) as number
                        ] as SelectOption).label,
                    })
                )
            }
        }
        // order alphabetically
        return sortBy<SelectOption>(
            //@ts-ignore is used before being declared
            formattedOptions,
            (option: SelectOption) =>
                typeof option.label === 'string' && option.label.toLowerCase()
        )
    }

    _onChange = (value: SelectValue) => {
        let val: SelectValue | boolean = value
        // We can't have boolean values so we're transforming them just before sending
        if (val === 'true') {
            val = true
        } else if (val === 'false') {
            val = false
        }
        this.props.onChange(val)
    }

    render() {
        const {
            className,
            value,
            onSearchChange,
            placeholder,
            focusedPlaceholder,
        } = this.props
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
                    //$TsFixMe remove casting once SelectField is migrated
                    value={newValue as string | number}
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
