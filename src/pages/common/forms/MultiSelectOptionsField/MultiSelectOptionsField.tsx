import classNames from 'classnames'
import _isEqual from 'lodash/isEqual'
import React, {Component, ComponentType, CSSProperties} from 'react'

import Dropdown from './Dropdown'
import css from './MultiSelectOptionsField.less'
import OptionTag from './Tag'
import {Option} from './types'

type Props = {
    allowCustomOptions: boolean
    matchInput: boolean
    options: Option[]
    plural: string
    singular: string
    style?: CSSProperties
    tagColor: string
    selectedOptions: Option[]
    className?: string
    caseInsensitive?: boolean
    isDisabled?: boolean
    onChange: (options: Option[]) => void
    onInputChange?: (value: string) => void
    onBlur?: () => void
    onFocus?: () => void
    loading?: boolean
    dropdownMenu?: ComponentType<unknown>
    isCompact?: boolean
}

type State = {
    input: string
    filteredOptions: Option[]
    isFocused: boolean
}

export default class MultiSelectOptionsField extends Component<Props, State> {
    static defaultProps: Partial<Props> = {
        allowCustomOptions: false,
        matchInput: false,
        options: [],
        plural: 'items',
        singular: 'item',
        selectedOptions: [],
    }

    constructor(props: Props) {
        super(props)
        this.state = {
            input: '',
            isFocused: false,
            filteredOptions: this._filterOptions(
                props.options,
                props.selectedOptions,
                ''
            ),
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (!_isEqual(this.props.selectedOptions, prevProps.selectedOptions)) {
            const filteredOptions = this._filterOptions(
                this.props.options,
                this.props.selectedOptions,
                ''
            )
            this.setState({
                input: '',
                filteredOptions,
            })
        }

        if (!_isEqual(this.props.options, prevProps.options)) {
            const {options, selectedOptions} = this.props
            const filteredOptions = this._filterOptions(
                options,
                selectedOptions,
                this.state.input
            )
            this.setState({filteredOptions})
        }
    }

    _focus = () => {
        if (this.props.onFocus && !this.state.isFocused) this.props.onFocus()
        this.setState({
            isFocused: true,
        })
    }

    _blur = () => {
        if (this.props.onBlur && this.state.isFocused) this.props.onBlur()
        this.setState({
            isFocused: false,
        })
    }

    _filterOptions = (
        options: Option[],
        selectedOptions: Option[],
        input: string
    ): Option[] => {
        return options.filter((option: Option) => {
            const {value, label} = option
            const alreadySelected = this._hasOptionValue(selectedOptions, value)
            const matchesInput =
                this.props.matchInput &&
                input &&
                !label.toLowerCase().includes(input.toLowerCase())
            return !alreadySelected && !matchesInput
        })
    }

    _hasOptionValue = (options: Option[], value: any): boolean =>
        !!this._findOptionByValue(options, value)

    _findOptionByValue = (
        options: Option[],
        value: any
    ): Option | undefined => {
        return options.find((option: Option) => option.value === value)
    }

    _removeOption = (option: Option) => {
        const newSelectedOptions = this.props.selectedOptions.filter(
            (selectedOption: Option) => {
                return selectedOption.value !== option.value
            }
        )
        this.props.onChange(newSelectedOptions)
    }

    _onRemoveOptionTag = (option: Option) => {
        this._removeOption(option)
        this._focus()
    }

    _onDropdownChange = (input: string) => {
        const {options, selectedOptions, onInputChange} = this.props

        this.setState({
            input,
            filteredOptions: this._filterOptions(
                options,
                selectedOptions,
                input
            ),
        })

        if (onInputChange) {
            onInputChange(input)
        }
    }

    _onDropdownDelete = () => {
        const {selectedOptions} = this.props

        if (!selectedOptions.length) {
            return
        }

        this._removeOption(selectedOptions[selectedOptions.length - 1])
    }

    _getCustomOption = (): Option => {
        const {singular} = this.props
        const {input} = this.state
        const displayLabel = (
            <i>
                {`Add ${singular} "`}
                <b>{`${input}`}</b>"
            </i>
        )
        return {
            displayLabel,
            label: input,
            value: input,
        }
    }

    _onDropdownSelect = (option: Option) => {
        const {allowCustomOptions, options, caseInsensitive, selectedOptions} =
            this.props

        if (option.isDeprecated) {
            return
        }

        let processedValue = option.value

        if (caseInsensitive && typeof processedValue === 'string') {
            processedValue = processedValue.toLowerCase()
        }

        // Whitelist with the options
        if (
            !allowCustomOptions &&
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            !options.map((option) => option.value).includes(processedValue)
        ) {
            return
        }

        // Check for duplicates
        if (this._hasOptionValue(selectedOptions, processedValue)) {
            return
        }

        this.props.onChange(
            selectedOptions.concat([
                {
                    label: option.label,
                    value: processedValue,
                },
            ])
        )
    }

    render() {
        const {
            className,
            style,
            selectedOptions,
            plural,
            allowCustomOptions,
            dropdownMenu,
            isDisabled,
            isCompact,
        } = this.props
        const {isFocused, filteredOptions, input} = this.state

        let displayOptions = filteredOptions
        if (allowCustomOptions && input) {
            displayOptions = [this._getCustomOption()].concat(displayOptions)
        }

        return (
            <div
                className={classNames('MultiSelectField', className, {
                    [css.disabled]: isDisabled,
                })}
                style={style}
            >
                <div
                    className={classNames(css.container, {
                        [css.compact]: isCompact,
                        [css.focused]: isFocused,
                    })}
                    onClick={this._focus}
                >
                    {selectedOptions.map((selectedOption: Option) => (
                        <OptionTag
                            key={selectedOption.value}
                            option={selectedOption}
                            onRemove={this._onRemoveOptionTag}
                            isCompact={isCompact}
                        />
                    ))}
                    <Dropdown
                        placeholder={`Add ${plural}...`}
                        value={input}
                        options={displayOptions}
                        isFocused={isFocused}
                        isLoading={this.props.loading}
                        onChange={this._onDropdownChange}
                        onFocus={this._focus}
                        onBlur={this._blur}
                        onSelect={this._onDropdownSelect}
                        onDelete={this._onDropdownDelete}
                        menu={dropdownMenu}
                        isCompact={isCompact}
                    />
                </div>
            </div>
        )
    }
}
