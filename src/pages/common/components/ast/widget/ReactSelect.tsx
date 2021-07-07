import React, {Component} from 'react'
import {List} from 'immutable'
import sortBy from 'lodash/sortBy'
import _noop from 'lodash/noop'

import 'react-select/dist/react-select.css'
import SelectField from '../../../forms/SelectField/SelectField'
import {
    Option as SelectOption,
    Value as SelectValue,
} from '../../../forms/SelectField/types'

type Props = {
    className?: string
    onChange: (value: any) => void
    options: SelectOption[] | SelectValue[] | Record<SelectValue, SelectOption>
    value: Maybe<string | number | boolean>
    onSearchChange: (value: any) => void
    placeholder?: string
    focusedPlaceholder?: string
}

type Option = SelectOption | SelectValue

export default class Select extends Component<Props> {
    static defaultProps: Pick<Props, 'onSearchChange'> = {
        onSearchChange: _noop,
    }

    _getOptions = () => {
        const {options} = this.props
        let formattedOptions: SelectOption[]

        if (options) {
            if (Array.isArray(options) || List.isList(options)) {
                formattedOptions = (options as Option[]).map(
                    (option: SelectOption | SelectValue) => {
                        if (
                            typeof option === 'number' ||
                            typeof option === 'string'
                        ) {
                            return {
                                value: option.toString(),
                                label: option.toString(),
                            }
                        }
                        return option
                    }
                )
            } else {
                formattedOptions = Object.keys(options).map<SelectOption>(
                    (key) => ({
                        value: key.toString(),
                        label: options[key].label,
                        isDeprecated: options[key]?.isDeprecated || false,
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
