import React, {Component, PropTypes} from 'react'
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

import css from './SelectField.less'

export default class SelectField extends Component {
    static propTypes = {
        allowCustomValue: PropTypes.bool.isRequired,
        options: PropTypes.arrayOf(PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            text: PropTypes.string, // text used to filter with the search value
            label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired, // text displayed in the dropdown
        })),
        placeholder: PropTypes.string,
        singular: PropTypes.string,
        style: PropTypes.object,
        rightAddon: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

        onChange: PropTypes.func.isRequired,
        onSearchChange: PropTypes.func,
        className: PropTypes.string
    }

    static defaultProps = {
        allowCustomValue: false,
        options: [],
        placeholder: 'Select an option',
        singular: 'option',
        style: {},
        onSearchChange: _noop,
    }

    constructor(props) {
        super(props)
        this.state = this._initialState(props)
    }

    _initialState = (props) => {
        return {
            input: '',
            optionsOpen: false,
            selectedOptionIndex: props.allowCustomValue ? -1 : 0,
            filteredOptions: this._filterOptions(props.options, props.value, '')
        }
    }

    componentWillReceiveProps(nextProps) {
        const hasNewOptions = this.props.options.length !== nextProps.options.length ||
            !!nextProps.options.filter((option) => !this.props.options.includes(option))

        if (this.props.value !== nextProps.value || hasNewOptions) {
            this.setState({
                filteredOptions: this._filterOptions(nextProps.options, nextProps.value, this.state.input)
            })
        }
    }

    _filterOptions = (options, value, input) => {
        return options.filter((option) => {
            const searchableText = option.text ? option.text : option.label

            return option.value !== value &&
                (!input || searchableText.toLowerCase().includes(input.toLowerCase()))
        })
    }

    _onSearchChange = ({target: {value: input}}) => {
        const {allowCustomValue, options, value} = this.props
        this.setState({
            input: input,
            filteredOptions: this._filterOptions(options, value, input),
            selectedOptionIndex: allowCustomValue ? -1 : 0,
        })

        this.props.onSearchChange(input)
    }

    _stopPropagation = (event) => {
        if (!event) {
            return
        }

        event.stopPropagation()
        event.preventDefault()
    }

    _onSearchKeyDown = (event) => {
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
                if (selectedOptionIndex >= 0 && filteredOptions.length > selectedOptionIndex) {
                    // add selected option
                    onChange(filteredOptions[selectedOptionIndex].value)
                } else if (allowCustomValue && input) {
                    onChange(input)
                }

                this._toggleDropdown()
                break
            // move option selection down
            case 'ArrowUp':
                this.setState({selectedOptionIndex: _max([selectedOptionIndex - 1, minSelectedOptionIndex])})
                break
            // move option selection up
            case 'ArrowDown':
                this.setState({selectedOptionIndex: _min([selectedOptionIndex + 1, filteredOptions.length - 1])})
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

    _onOptionClick = (event, value) => {
        this._stopPropagation(event)
        this.props.onChange(value)
        this._toggleDropdown()
    }

    _focusInput = () => {
        if (this.refs.input) {
            this.refs.input.focus()
        }
    }

    _blurInput = () => {
        if (this.refs.input) {
            this.refs.input.blur()
            this.setState(this._initialState(this.props))
        }
    }

    render() {
        const {allowCustomValue, value, singular, style, placeholder, className, options, rightAddon} = this.props
        const {filteredOptions, input, optionsOpen, selectedOptionIndex} = this.state
        const selectedOption = options.find((option) => option.value === value)
        const hasNoFilteredOptions = filteredOptions.length === 0
        let label = selectedOption ? selectedOption.label : null

        if (allowCustomValue && value) {
            label = value
        }
        // 7: approximate width for a character in the input
        // 10: width of the arrow of the select
        // 305: max-width allowed (pixel perfect)
        // we use this value to increase the min height of the input and
        // the label to increase or decrease according to its content
        const selectMinWidth = _min([input.length * 7 + 10, 305])

        return (
            <div style={style}>
                <UncontrolledDropdown
                    toggle={this._toggleDropdown}
                    isOpen={optionsOpen}
                >
                    <DropdownToggle tag="div" data-toggle="dropdown" className={className}>
                        <div
                            className={`${css.select} dropdown-toggle`}
                            onClick={this._toggleDropdown}
                        >
                            <span
                                style={{
                                    minWidth: selectMinWidth,
                                    // hide the label when the input is filled
                                    // to keep the current width of the select
                                    opacity: input ? 0 : 1
                                }}
                                className={classnames(css.label, {
                                    [css.placeholder]: !label
                                })}
                            >
                                {label || placeholder}
                            </span>
                            <input
                                style={{
                                    minWidth: selectMinWidth
                                }}
                                className={css.input}
                                ref="input"
                                value={input}
                                onChange={this._onSearchChange}
                                onKeyDown={this._onSearchKeyDown}
                                type="text"
                            />
                        </div>
                    </DropdownToggle>
                    <DropdownMenu
                        className={css.options}
                    >
                        {hasNoFilteredOptions && !allowCustomValue ? (
                            <DropdownItem header>
                                No result
                            </DropdownItem>
                        ) : ([
                            input && allowCustomValue && (
                                <DropdownItem
                                    key={-1}
                                    type="button"
                                    className={classnames(css.option, {
                                        [`${css['option--focused']}`]: -1 === selectedOptionIndex
                                    })}
                                    onMouseEnter={() => {
                                        this.setState({selectedOptionIndex: -1})
                                    }}
                                    onClick={(event) => {
                                        this._onOptionClick(event, input)
                                    }}
                                >
                                    <i>
                                        {`Add ${singular} "`}
                                        <b>{`${input}`}</b>
                                        "
                                    </i>
                                </DropdownItem>
                            )
                            ,
                            ...filteredOptions.map((item, index) => {
                                return (
                                    <DropdownItem
                                        key={item.value}
                                        type="button"
                                        className={classnames(css.option, {
                                            [`${css['option--focused']}`]: index === selectedOptionIndex
                                        })}

                                        onMouseEnter={() => {
                                            this.setState({selectedOptionIndex: index})
                                        }}
                                        onClick={(event) => {
                                            this._onOptionClick(event, item.value)
                                        }}
                                    >
                                        {item.label}
                                    </DropdownItem>
                                )
                            })
                        ])}
                    </DropdownMenu>

                </UncontrolledDropdown>
                {
                    rightAddon && (
                        <div className={classnames({'input-group': !!rightAddon})}>
                            <span className="input-group-append">
                                <span className="input-group-text">
                                    {rightAddon}
                                </span>
                            </span>
                        </div>
                    )
                }
            </div>
        )
    }
}
