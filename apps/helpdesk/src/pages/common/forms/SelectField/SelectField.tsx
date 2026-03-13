import type {
    ChangeEvent,
    ComponentProps,
    CSSProperties,
    HTMLAttributes,
    KeyboardEvent,
    MouseEvent,
    ReactNode,
    RefObject,
    SyntheticEvent,
} from 'react'
import React, { Component, createRef, Fragment } from 'react'

import classnames from 'classnames'
import _isEqual from 'lodash/isEqual'
import _max from 'lodash/max'
import _min from 'lodash/min'
import _noop from 'lodash/noop'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
    UncontrolledTooltip,
} from 'reactstrap'

import { GroupPositionContext } from 'pages/common/components/layout/Group'

import Caption from '../Caption/Caption'
import type { Option, SelectableOption, Value } from './types'

import css from './SelectField.less'

const APPROXIMATE_CHAR_WIDTH = 8
const ARROW_ICON_WIDTH = 10
const MAXIMUM_MIN_WIDTH = 305

type Props = {
    allowCustomValue: boolean
    options: Option[]
    placeholder: string
    singular: string
    style: CSSProperties
    rightAddon?: string
    value?: Value | null
    required: boolean
    onChange: (value: Value) => void
    onSearchChange: (search: string) => void
    onDropdownToggle?: (isOpen: boolean) => void
    className?: string
    dropdownMenuClassName?: string
    fixedWidth: boolean
    focusedPlaceholder?: string
    fullWidth?: boolean
    shouldFocus?: boolean
    positionFixed?: boolean
    disabled?: boolean
    icon?: string
    customIcon?: ReactNode
    container?: ComponentProps<typeof DropdownMenu>['container']
    caption?: ReactNode
    showSelectedOption?: boolean
    isSearchable?: boolean
    showSelectedOptionIcon?: boolean
} & Pick<HTMLAttributes<HTMLElement>, 'id' | 'aria-label'>

type State = {
    input: string
    optionsOpen: boolean
    selectedOptionIndex: number
    filteredOptions: Option[]
    isFocused: boolean
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<SelectField />` from @gorgias/axiom instead.
 * @date 2026-01-13
 * @type ui-kit-migration
 */
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
        isSearchable: true,
    }
    inputRef: RefObject<HTMLInputElement>

    constructor(props: Props) {
        super(props)
        this.state = this._initialState(props)
        this.inputRef = createRef<HTMLInputElement>()
    }

    _initialState = (props: Props): State => {
        return {
            input: '',
            optionsOpen: false,
            selectedOptionIndex: props.allowCustomValue ? -1 : 0,
            filteredOptions: this._filterOptions(
                props.options,
                '',
                props.value,
                props.showSelectedOption,
            ),
            isFocused: false,
        }
    }

    componentDidMount() {
        const { shouldFocus } = this.props

        if (shouldFocus) {
            this._toggleDropdown()
            this._focusInput()
        }
    }

    componentDidUpdate(prevProps: Props) {
        const hasNewOptions = !_isEqual(prevProps.options, this.props.options)

        if (
            prevProps.value !== this.props.value ||
            hasNewOptions ||
            this.props.showSelectedOption !== prevProps.showSelectedOption
        ) {
            this.setState({
                filteredOptions: this._filterOptions(
                    this.props.options,
                    this.state.input,
                    this.props.value,
                    this.props.showSelectedOption,
                ),
            })
        }
    }

    _onChange = (value: Value) => {
        this.setState({ input: '' }, () => this.props.onChange(value))
    }

    _filterOptions = (
        options: Option[],
        input: string,
        value?: Value | null,
        showSelectedOption?: boolean,
    ): Option[] => {
        // Filter options by search query
        let filteredOptions = options.filter((option) => {
            if (
                'isHeader' in option ||
                'isDivider' in option ||
                'isAction' in option
            ) {
                return true
            }

            const searchableText = option.text ? option.text : option.label

            return (
                (showSelectedOption || option.value !== value) &&
                (!input ||
                    (typeof searchableText === 'string' &&
                        searchableText
                            .toLowerCase()
                            .includes(input.toLowerCase())))
            )
        })

        // Remove empty groups caused by search query
        filteredOptions = filteredOptions.filter((option, index) => {
            if ('isHeader' in option) {
                const nextOption = filteredOptions[index + 1]

                if (!nextOption || 'isDivider' in nextOption) {
                    return false
                }
            }

            if ('isDivider' in option) {
                if (index === 0) {
                    return false
                }
                const previousOption = filteredOptions[index - 1]

                if ('isHeader' in previousOption) {
                    return false
                }
            }

            return true
        })

        // if last option is divider, remove it as well
        if (
            filteredOptions.length > 0 &&
            'isDivider' in filteredOptions[filteredOptions.length - 1]
        ) {
            filteredOptions.splice(filteredOptions.length - 1, 1)
        }

        return filteredOptions
    }

    _onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { allowCustomValue, options, value, showSelectedOption } =
            this.props
        const input = event.currentTarget.value
        this.setState({
            input: input,
            filteredOptions: this._filterOptions(
                options,
                input,
                value,
                showSelectedOption,
            ),
            selectedOptionIndex: allowCustomValue ? -1 : 0,
        })

        this.props.onSearchChange(input)
    }

    _stopPropagation = (event: SyntheticEvent) => {
        if (!event) {
            return
        }

        event.stopPropagation()
        event.preventDefault()
    }

    _onSearchKeyDown = (event: KeyboardEvent) => {
        const { allowCustomValue } = this.props
        const { input, filteredOptions, selectedOptionIndex } = this.state
        const key = event.key
        const killedEventsKeys = ['ArrowUp', 'ArrowDown', 'Enter', 'Tab']
        let minSelectedOptionIndex = allowCustomValue ? -1 : 0

        if (
            minSelectedOptionIndex === 0 &&
            filteredOptions.length > 0 &&
            'isHeader' in filteredOptions[minSelectedOptionIndex]
        ) {
            minSelectedOptionIndex += 1
        }

        if (killedEventsKeys.includes(key)) {
            this._stopPropagation(event)
        }

        let possibleIndex
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
                    const selectedOption = filteredOptions[selectedOptionIndex]

                    if ('isAction' in selectedOption) {
                        selectedOption.onClick && selectedOption.onClick()
                        this._toggleDropdown()
                        break
                    }

                    if (
                        'isHeader' in selectedOption ||
                        'isDivider' in selectedOption ||
                        selectedOption.isDisabled
                    ) {
                        break
                    }

                    this._onChange(selectedOption.value)
                } else if (allowCustomValue && input) {
                    this._onChange(input)
                }

                this._toggleDropdown()
                break
            // move option selection down
            case 'ArrowUp':
                possibleIndex = selectedOptionIndex - 1

                if ('isHeader' in (filteredOptions[possibleIndex] || {})) {
                    possibleIndex -= 2
                }

                this.setState({
                    selectedOptionIndex: _max([
                        possibleIndex,
                        minSelectedOptionIndex,
                    ])!,
                })
                break
            // move option selection up
            case 'ArrowDown':
                possibleIndex = selectedOptionIndex + 1

                if ('isDivider' in (filteredOptions[possibleIndex] || {})) {
                    possibleIndex += 2
                }

                this.setState({
                    selectedOptionIndex: _min([
                        possibleIndex,
                        filteredOptions.length - 1,
                    ])!,
                })
                break
            default:
        }
    }

    _toggleDropdown = () => {
        const { optionsOpen } = this.state
        const { onDropdownToggle, disabled } = this.props

        if (disabled) {
            return
        }

        if (!optionsOpen) {
            this._focusInput()
        } else {
            this._blurInput()
        }

        this.setState({ optionsOpen: !optionsOpen })

        if (onDropdownToggle) {
            onDropdownToggle(!optionsOpen)
        }
    }

    _onOptionClick = (event: MouseEvent, value: Value) => {
        this._stopPropagation(event)
        this._onChange(value)
        this._toggleDropdown()
    }

    _focusInput = () => {
        if (this.inputRef.current) {
            this.inputRef.current.focus()
        }
    }

    _blurInput = () => {
        if (this.inputRef.current) {
            this.inputRef.current.blur()
            this.setState(this._initialState(this.props))
        }
    }

    _onFocus = () => {
        this.setState({ isFocused: true })
    }

    _onBlur = () => {
        this.setState({ isFocused: false })
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
            dropdownMenuClassName,
            positionFixed,
            disabled,
            icon,
            customIcon,
            container,
            caption,
            isSearchable,
            showSelectedOptionIcon,
            ['aria-label']: ariaLabel,
        } = this.props
        const {
            filteredOptions,
            input,
            optionsOpen,
            selectedOptionIndex,
            isFocused,
        } = this.state
        const selectedOption = options.find((option) =>
            'value' in option ? _isEqual(option.value, value) : false,
        ) as SelectableOption | undefined
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
        const selectMinWidth = fixedWidth
            ? _max(
                  options.map((option: Option) => {
                      if (
                          'isHeader' in option ||
                          'isDivider' in option ||
                          'isAction' in option
                      ) {
                          return 0
                      }

                      if (typeof option.label === 'string') {
                          return option.label.length
                      }
                      if (option.text) {
                          return option.text.length
                      }
                      return 0
                  }),
              )! *
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
                        <GroupPositionContext.Consumer>
                            {(appendPosition) => (
                                <div
                                    className={classnames(
                                        css.select,
                                        'dropdown-toggle',
                                        css[appendPosition || ''],
                                        {
                                            [css.selectFullWidth]: fullWidth,
                                            [css.disabled]: disabled,
                                        },
                                    )}
                                    onClick={this._toggleDropdown}
                                >
                                    {!!icon && (
                                        <i
                                            className={classnames(
                                                'material-icons',
                                                css.icon,
                                            )}
                                        >
                                            {icon}
                                        </i>
                                    )}
                                    {customIcon}
                                    <span
                                        aria-label={ariaLabel}
                                        style={{
                                            minWidth: selectMinWidth,
                                            // hide the label when the input is filled
                                            // to keep the current width of the select
                                            opacity: input ? 0 : 1,
                                        }}
                                        className={classnames(css.label, {
                                            [css.placeholder]: !label,
                                        })}
                                        data-testid={
                                            id ? `selected-${id}` : undefined // leaving it until we remove usage in e2e, please do not use in tests
                                        }
                                    >
                                        {label ||
                                            (isFocused && focusedPlaceholder
                                                ? focusedPlaceholder
                                                : placeholder)}
                                    </span>
                                    {isSearchable && (
                                        /* eslint-disable-next-line jsx-a11y/autocomplete-valid */
                                        <input
                                            style={{
                                                minWidth: selectMinWidth,
                                            }}
                                            id={id}
                                            className={classnames(css.input, {
                                                [css.iconPadding]: !!icon,
                                            })}
                                            disabled={disabled}
                                            ref={this.inputRef}
                                            value={input}
                                            required={required && !value}
                                            onChange={this._onSearchChange}
                                            onKeyDown={this._onSearchKeyDown}
                                            onFocus={this._onFocus}
                                            onBlur={this._onBlur}
                                            type="text"
                                            autoComplete="chrome-off"
                                        />
                                    )}
                                    <i
                                        className={classnames(
                                            'material-icons',
                                            css.dropdownIcon,
                                        )}
                                    >
                                        arrow_drop_down
                                    </i>
                                </div>
                            )}
                        </GroupPositionContext.Consumer>
                    </DropdownToggle>

                    <DropdownMenu
                        className={classnames(
                            css.options,
                            dropdownMenuClassName,
                            {
                                [css.optionsFullWidth]: fullWidth,
                            },
                        )}
                        container={container}
                        positionFixed={positionFixed}
                        modifiers={{
                            preventOverflow: { boundariesElement: 'viewport' },
                        }}
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
                                            <b>{`${input}`}</b>
                                            {`"`}
                                        </i>
                                    </DropdownItem>
                                ),
                                ...filteredOptions.map((item, index) => {
                                    if ('isHeader' in item) {
                                        return (
                                            <DropdownItem
                                                header
                                                key={`header_${index}`}
                                            >
                                                {item.label}
                                            </DropdownItem>
                                        )
                                    }

                                    if ('isDivider' in item) {
                                        return (
                                            <DropdownItem
                                                divider
                                                key={`divider_${index}`}
                                            />
                                        )
                                    }

                                    if ('isAction' in item) {
                                        return (
                                            <div
                                                key={`action_${index}`}
                                                onClick={() => {
                                                    item.onClick()
                                                    this._toggleDropdown()
                                                }}
                                                onMouseEnter={() => {
                                                    this.setState({
                                                        selectedOptionIndex:
                                                            index,
                                                    })
                                                }}
                                            >
                                                <DropdownItem
                                                    header
                                                    type="button"
                                                    className={classnames(
                                                        css.action,
                                                        {
                                                            [`${css['action--focused']}`]:
                                                                index ===
                                                                selectedOptionIndex,
                                                        },
                                                    )}
                                                >
                                                    {item.label}
                                                </DropdownItem>
                                            </div>
                                        )
                                    }

                                    const wrapperId = `dropdown_item_${
                                        item.value !== null
                                            ? `${item.value}_${index}`
                                            : 'null'
                                    }`
                                    const WrapperComponent = item.tooltipText
                                        ? 'div'
                                        : Fragment
                                    const wrapperProps = item.tooltipText
                                        ? {
                                              id: wrapperId,
                                              // disabled element don't fire events
                                              // so we attach event listeners to wrapper
                                              onMouseEnter: () => {
                                                  if (item.isDisabled) {
                                                      this.setState({
                                                          selectedOptionIndex:
                                                              index,
                                                      })
                                                  }
                                              },
                                          }
                                        : {}

                                    return (
                                        <WrapperComponent
                                            key={`${item.value}_${index}`}
                                            {...wrapperProps}
                                        >
                                            <DropdownItem
                                                type="button"
                                                className={classnames(
                                                    css.option,
                                                    {
                                                        [css.optionDeprecated]:
                                                            item?.isDeprecated,
                                                        [`${css['option--focused']}`]:
                                                            index ===
                                                            selectedOptionIndex,
                                                        [`${css['option--selected']}`]:
                                                            item.value ===
                                                            value,
                                                        [css[
                                                            'option--disabled'
                                                        ]]: item.isDisabled,
                                                    },
                                                )}
                                                onMouseEnter={() => {
                                                    this.setState({
                                                        selectedOptionIndex:
                                                            index,
                                                    })
                                                }}
                                                onClick={(event) => {
                                                    this._onOptionClick(
                                                        event,
                                                        item.value,
                                                    )
                                                }}
                                                disabled={item.isDisabled}
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
                                                {showSelectedOptionIcon &&
                                                    item.value === value && (
                                                        <span
                                                            className={classnames(
                                                                css.selectedIcon,
                                                                'material-icons',
                                                            )}
                                                        >
                                                            done
                                                        </span>
                                                    )}
                                            </DropdownItem>
                                            {item.tooltipText && (
                                                <UncontrolledTooltip
                                                    placement="right"
                                                    fade={false}
                                                    target={wrapperId}
                                                    boundariesElement="body"
                                                >
                                                    {item.tooltipText}
                                                </UncontrolledTooltip>
                                            )}
                                        </WrapperComponent>
                                    )
                                }),
                            ]
                        )}
                    </DropdownMenu>
                </UncontrolledDropdown>
                {rightAddon && (
                    <div
                        className={classnames({ 'input-group': !!rightAddon })}
                    >
                        <span className="input-group-append">
                            <span className="input-group-text">
                                {rightAddon}
                            </span>
                        </span>
                    </div>
                )}
                {caption && <Caption>{caption}</Caption>}
            </div>
        )
    }
}
