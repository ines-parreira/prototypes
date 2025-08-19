import React, { ComponentType, CSSProperties } from 'react'

import classNames from 'classnames'
import _isEqual from 'lodash/isEqual'

import { TAGS_LIMIT } from 'models/integration/constants'

import Dropdown from './Dropdown'
import OptionTag from './Tag'
import { Option } from './types'

import css from './MultiSelectOptionsField.less'

type Props = {
    id?: string
    allowCustomOptions?: boolean
    matchInput?: boolean
    options?: Option[]
    plural?: string
    singular?: string
    style?: CSSProperties
    selectedOptions?: Option[]
    showSymbolOnSpaces?: boolean
    className?: string
    caseInsensitive?: boolean
    isDisabled?: boolean
    hasError?: boolean
    onChange: (options: Option[]) => void
    onInputChange?: (value: string) => void
    onSelectTag?: (tag: string) => void
    onBlur?: () => void
    onFocus?: () => void
    loading?: boolean
    dropdownMenu?: ComponentType<unknown>
    isCompact?: boolean
    showAllOptions?: boolean
    dropdownClassName?: string
}

export default function MultiSelectOptionsField(props: Props) {
    const {
        allowCustomOptions = false,
        matchInput = false,
        options = [],
        plural = 'items',
        singular = 'item',
        selectedOptions = [],
        dropdownMenu,
        loading,
        caseInsensitive,
        showSymbolOnSpaces,
        className,
        dropdownClassName,
        isDisabled,
        isCompact,
        hasError,
        style,
        onFocus,
        onBlur,
        onChange,
        onInputChange,
        onSelectTag,
        id,
        showAllOptions = false,
    } = props

    const [previousOptions, setPreviousOptions] = React.useState(options)
    const [previousSelectedOptions, setPreviousSelectedOptions] =
        React.useState(selectedOptions)
    const [input, setInput] = React.useState('')
    const [isFocused, setIsFocused] = React.useState(false)
    const [filteredOptions, setFilteredOptions] = React.useState(
        filterOptions(options, selectedOptions),
    )

    if (!_isEqual(previousSelectedOptions, selectedOptions)) {
        const filteredOptions = filterOptions(options, selectedOptions)
        setInput('')
        setPreviousSelectedOptions(selectedOptions)
        setFilteredOptions(filteredOptions)
    }

    if (!_isEqual(options, previousOptions)) {
        const filteredOptions = filterOptions(options, selectedOptions, input)
        setPreviousOptions(options)
        setFilteredOptions(filteredOptions)
    }

    const handleFocus = () => {
        if (onFocus && !isFocused) onFocus()
        setIsFocused(true)
    }

    const handleBlur = () => {
        if (onBlur && isFocused) onBlur()
        setIsFocused(false)
    }

    function filterOptions(
        options: Option[],
        selectedOptions: Option[],
        input: string = '',
    ): Option[] {
        return options.filter((option: Option) => {
            const { value, label } = option
            const alreadySelected = hasOptionValue(selectedOptions, value)
            const matchesInput =
                matchInput &&
                input &&
                !label.toLowerCase().includes(input.toLowerCase())
            return !alreadySelected && !matchesInput
        })
    }

    function hasOptionValue(options: Option[], value: any): boolean {
        return !!findOptionByValue(options, value)
    }

    function findOptionByValue(
        options: Option[],
        value: any,
    ): Option | undefined {
        return options.find((option: Option) => option.value === value)
    }

    const removeOption = (option: Option) => {
        const newSelectedOptions = selectedOptions.filter(
            (selectedOption: Option) => {
                return selectedOption.value !== option.value
            },
        )
        onChange(newSelectedOptions)
    }

    const handleRemoveOptionTag = (option: Option) => {
        removeOption(option)
        handleFocus()
    }

    const handleChange = (input: string) => {
        setInput(input)
        setFilteredOptions(filterOptions(options, selectedOptions, input))
        onInputChange?.(input)
    }

    const handleDelete = () => {
        if (!selectedOptions.length) {
            return
        }

        removeOption(selectedOptions[selectedOptions.length - 1])
    }

    const getCustomOption = (): Option => {
        const displayLabel = (
            <i>
                {`Add ${singular} "`}
                <b>{`${input}`}</b>
                {`"`}
            </i>
        )
        return {
            displayLabel,
            label: input,
            value: input,
        }
    }

    const handleSelect = (option: Option) => {
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
        if (hasOptionValue(selectedOptions, processedValue)) {
            return
        }

        onChange(
            selectedOptions.concat([
                {
                    label: option.label,
                    value: processedValue,
                },
            ]),
        )

        // Check if chosen option is a suggested tag and log the event
        if (
            singular === 'tag' &&
            onSelectTag &&
            tagExistsInOptions(processedValue, options)
        ) {
            onSelectTag(processedValue)
        }
    }

    function tagExistsInOptions(tag: string, options: Option[]) {
        return options.some(
            (option) => option.label === tag && option.value === tag,
        )
    }

    let displayOptions = filteredOptions
    if (allowCustomOptions && input) {
        if (!tagExistsInOptions(input, displayOptions)) {
            displayOptions = [getCustomOption()].concat(displayOptions)
        }
    }
    displayOptions = showAllOptions
        ? displayOptions
        : displayOptions.slice(0, TAGS_LIMIT)

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
                    [css.hasError]: hasError,
                })}
                onClick={focus}
            >
                {selectedOptions.map((selectedOption: Option) => (
                    <OptionTag
                        symbolSpaces={showSymbolOnSpaces}
                        key={selectedOption.value}
                        option={selectedOption}
                        onRemove={handleRemoveOptionTag}
                        isCompact={isCompact}
                    />
                ))}
                <Dropdown
                    id={id}
                    placeholder={`Add ${plural}...`}
                    value={input}
                    options={displayOptions}
                    isFocused={isFocused}
                    isLoading={loading}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onSelect={handleSelect}
                    onDelete={handleDelete}
                    menu={dropdownMenu}
                    isCompact={isCompact}
                    dropdownClassName={dropdownClassName}
                />
            </div>
        </div>
    )
}
