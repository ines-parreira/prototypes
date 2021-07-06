//@flow
import React, {Component} from 'react'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'
import classnames from 'classnames'
import _max from 'lodash/max'
import _min from 'lodash/min'
import _noop from 'lodash/noop'
import _isEqual from 'lodash/isEqual'

import css from './SelectField.less'
import type {Option, Value} from './types'

const APPROXIMATE_CHAR_WIDTH = 8
const ARROW_ICON_WIDTH = 10
const MAXIMUM_MIN_WIDTH = 305

type Props = {
    id: ?string,
    allowCustomValue: boolean,
    options: Option[],
    placeholder: string,
    singular: string,
    style: {},
    rightAddon?: string,
    value?: Value,
    required: boolean,
    onChange: (Value) => void,
    onSearchChange: (string) => void,
    className?: ?string,
    fixedWidth: boolean,
    focusedPlaceholder?: string,
    fullWidth?: boolean,
}

type State = {
    input: string,
    optionsOpen: boolean,
    selectedOptionIndex: number,
    filteredOptions: Option[],
    isFocused: boolean,
}

export default class SelectField extends Component<Props, State> {
    static defaultProps = {
        id: null,
        allowCustomValue: false,
        options: [],
        placeholder: 'Select an option',
        singular: 'option',
        style: {},
        onSearchChange: _noop,
        fixedWidth: false,
        fullWidth: false,
        required: false,
    }
    inputRef: ?HTMLInputElement

    constructor(props: Props) {
        super(props)
        this.state = this._initialState(props)
    }

    _initialState = (props: Props): State => {
        return {
            input: '',
            optionsOpen: false,
            selectedOptionIndex: props.allowCustomValue ? -1 : 0,
            filteredOptions: this._filterOptions(
                props.options,
                props.value,
                ''
            ),
            isFocused: false,
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        const hasNewOptions =
            this.props.options.length !== nextProps.options.length ||
            !!nextProps.options.filter(
                (option) => !this.props.options.includes(option)
            )

        if (this.props.value !== nextProps.value || hasNewOptions) {
            this.setState({
                filteredOptions: this._filterOptions(
                    nextProps.options,
                    nextProps.value,
                    ''
                ),
            })
        }
    }

    _filterOptions = (
        options: Option[],
        value?: Value,
        input: string
    ): Option[] => {
        return options.filter((option) => {
            const searchableText = option.text ? option.text : option.label

            return (
                option.value !== value &&
                (!input ||
                    (typeof searchableText === 'string' &&
                        searchableText
                            .toLowerCase()
                            .includes(input.toLowerCase())))
            )
        })
    }

    _onSearchChange = (event: SyntheticEvent<HTMLInputElement>) => {
        const {allowCustomValue, options, value} = this.props
        const input = event.currentTarget.value
        this.setState({
            input: input,
            filteredOptions: this._filterOptions(options, value, input),
            selectedOptionIndex: allowCustomValue ? -1 : 0,
        })

        this.props.onSearchChange(input)
    }

    _stopPropagation = (event: SyntheticEvent<*>) => {
        if (!event) {
            return
        }

        event.stopPropagation()
        event.preventDefault()
    }

    _onSearchKeyDown = (event: SyntheticKeyboardEvent<HTMLInputElement>) => {
        const {allowCustomValue, onChange} = this.props
        const {input, filteredOptions, selectedOptionIndex} = this.state
        const key = event.key
        const killedEventsKeys = ['ArrowUp', 'ArrowDown', 'Enter', 'Tab']
        const minSelectedOptionIndex = allowCustomValue ? -1 : 0

        if (killedEventsKeys.includes(key)) {
            this._stopPropagation(event)
        }

        switch (key) {
            case 'Escape':
                this._toggleDropdown()
                break

            case 'Tab':
            case 'Enter':
                if (
                    selectedOptionIndex >= 0 &&
                    filteredOptions.length > selectedOptionIndex
                ) {
                    // add selected option
                    onChange(filteredOptions[selectedOptionIndex].value)
                } else if (allowCustomValue && input) {
                    onChange(input)
                }

                this._toggleDropdown()
                break
            // move option selection down
            case 'ArrowUp':
                this.setState({
                    selectedOptionIndex: _max([
                        selectedOptionIndex - 1,
                        minSelectedOptionIndex,
                    ]),
                })
                break
            // move option selection up
            case 'ArrowDown':
                this.setState({
                    selectedOptionIndex: _min([
                        selectedOptionIndex + 1,
                        filteredOptions.length - 1,
                    ]),
                })
                break
            default:
        }
    }

    _toggleDropdown = () => {
        const {optionsOpen} = this.state

        if (!optionsOpen) {
            this._focusInput()
        } else {
            this._blurInput()
        }

        this.setState({optionsOpen: !optionsOpen})
    }

    _onOptionClick = (event: SyntheticEvent<*>, value: Value) => {
        this._stopPropagation(event)
        this.props.onChange(value)
        this._toggleDropdown()
    }

    _focusInput = () => {
        if (this.inputRef) {
            this.inputRef.focus()
        }
    }

    _blurInput = () => {
        if (this.inputRef) {
            this.inputRef.blur()
            this.setState(this._initialState(this.props))
        }
    }

    _onFocus = () => {
        this.setState({isFocused: true})
    }

    _onBlur = () => {
        this.setState({isFocused: false})
    }

    render() {
        const {
            id,
            allowCustomValue,
            value,
            required,
            singular,
            style,
            placeholder,
            className,
            options,
            rightAddon,
            fixedWidth,
            focusedPlaceholder,
            fullWidth,
        } = this.props
        const {
            filteredOptions,
            input,
            optionsOpen,
            selectedOptionIndex,
            isFocused,
        } = this.state
        const selectedOption = options.find((option) =>
            _isEqual(option.value, value)
        )
        const hasNoFilteredOptions = filteredOptions.length === 0
        let label = selectedOption ? selectedOption.label : null

        if (allowCustomValue && value) {
            label = value
        }

        // 8: approximate width for a character in the input
        // 10: width of the arrow of the select
        // 305: max-width allowed (pixel perfect)
        // we use this value to increase the min width of the input, and
        // the label to increase or decrease according to its content
        let selectMinWidth = fixedWidth
            ? _max(
                  options.map((option: Option) => {
                      if (typeof option.label === 'string') {
                          return option.label.length
                      }
                      if (option.text) {
                          return option.text.length
                      }
                      return 0
                  })
              ) *
                  APPROXIMATE_CHAR_WIDTH +
              ARROW_ICON_WIDTH
            : _min([
                  input.length * APPROXIMATE_CHAR_WIDTH + ARROW_ICON_WIDTH,
                  MAXIMUM_MIN_WIDTH,
              ])

        return (
            <div style={style}>
                <UncontrolledDropdown
                    toggle={this._toggleDropdown}
                    isOpen={optionsOpen}
                >
                    <DropdownToggle
                        tag="div"
                        data-toggle="dropdown"
                        className={className}
                    >
                        <div
                            className={classnames(
                                css.select,
                                'dropdown-toggle',
                                {
                                    [css.selectFullWidth]: fullWidth,
                                }
                            )}
                            onClick={this._toggleDropdown}
                        >
                            <span
                                style={{
                                    minWidth: selectMinWidth,
                                    // hide the label when the input is filled
                                    // to keep the current width of the select
                                    opacity: input ? 0 : 1,
                                }}
                                className={classnames(css.label, {
                                    [css.placeholder]: !label,
                                })}
                            >
                                {label ||
                                    (isFocused && focusedPlaceholder
                                        ? focusedPlaceholder
                                        : placeholder)}
                            </span>
                            <input
                                style={{
                                    minWidth: selectMinWidth,
                                }}
                                id={id}
                                className={css.input}
                                ref={(ref) => (this.inputRef = ref)}
                                value={input}
                                required={required && !value}
                                onChange={this._onSearchChange}
                                onKeyDown={this._onSearchKeyDown}
                                onFocus={this._onFocus}
                                onBlur={this._onBlur}
                                type="text"
                                autoComplete="chrome-off"
                            />
                        </div>
                    </DropdownToggle>
                    <DropdownMenu
                        className={classnames(css.options, {
                            [css.optionsFullWidth]: fullWidth,
                        })}
                    >
                        {hasNoFilteredOptions && !allowCustomValue ? (
                            <DropdownItem header>No result</DropdownItem>
                        ) : (
                            [
                                input && allowCustomValue && (
                                    <DropdownItem
                                        key={-1}
                                        type="button"
                                        className={classnames(css.option, {
                                            [`${css['option--focused']}`]:
                                                -1 === selectedOptionIndex,
                                        })}
                                        onMouseEnter={() => {
                                            this.setState({
                                                selectedOptionIndex: -1,
                                            })
                                        }}
                                        onClick={(event) => {
                                            this._onOptionClick(event, input)
                                        }}
                                    >
                                        <i>
                                            {`Add ${singular} "`}
                                            <b>{`${input}`}</b>"
                                        </i>
                                    </DropdownItem>
                                ),
                                ...filteredOptions.map((item, index) => {
                                    return (
                                        <DropdownItem
                                            key={item.value}
                                            type="button"
                                            className={classnames(css.option, {
                                                [css.optionDeprecated]:
                                                    item?.isDeprecated,
                                                [`${css['option--focused']}`]:
                                                    index ===
                                                    selectedOptionIndex,
                                            })}
                                            onMouseEnter={() => {
                                                this.setState({
                                                    selectedOptionIndex: index,
                                                })
                                            }}
                                            onClick={(event) => {
                                                this._onOptionClick(
                                                    event,
                                                    item.value
                                                )
                                            }}
                                        >
                                            {item?.isDeprecated && (
                                                <span className="material-icons mr-1">
                                                    warning
                                                </span>
                                            )}
                                            <span>{item.label}</span>
                                            {item?.isDeprecated && (
                                                <span className="ml-1">
                                                    (deprecated)
                                                </span>
                                            )}
                                        </DropdownItem>
                                    )
                                }),
                            ]
                        )}
                    </DropdownMenu>
                </UncontrolledDropdown>
                {rightAddon && (
                    <div className={classnames({'input-group': !!rightAddon})}>
                        <span className="input-group-append">
                            <span className="input-group-text">
                                {rightAddon}
                            </span>
                        </span>
                    </div>
                )}
            </div>
        )
    }
}
