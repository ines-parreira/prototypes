import React, {Component, PropTypes} from 'react'
import {
    UncontrolledDropdown,
    DropdownMenu,
    DropdownItem,
    DropdownToggle,
    Badge,
} from 'reactstrap'
import classnames from 'classnames'
import _max from 'lodash/max'
import _min from 'lodash/min'

import css from './MultiSelectField.less'

export default class MultiSelectField extends Component {
    static propTypes = {
        allowCustomValues: PropTypes.bool,
        options: PropTypes.array,
        plural: PropTypes.string,
        singular: PropTypes.string,
        style: PropTypes.object,
        tagColor: PropTypes.string,
        values: PropTypes.array,
        className: PropTypes.string,

        onChange: PropTypes.func.isRequired,
    }

    static defaultProps = {
        allowCustomValues: false,
        options: [],
        plural: 'items',
        singular: 'item',
        style: null,
        tagColor: '#0275d8',
        values: [],
    }

    constructor(props) {
        super(props)
        this.state = this._initialState(props)
    }

    _initialState = (props) => {
        return {
            input: '',
            optionsOpen: false,
            // select first option by default if custom values are not allowed
            selectedOptionIndex: props.allowCustomValues ? -1 : 0,
            filteredOptions: this._filterOptions(props.options, props.values, '')
        }
    }

    componentWillReceiveProps(nextProps, nextState) {
        const hasNewOptions = this.props.options.length !== nextProps.options.length ||
            !!nextProps.options.filter(option => !this.props.options.includes(option))

        if (this.props.values.length !== nextProps.values.length || hasNewOptions) {
            this.setState({
                filteredOptions: this._filterOptions(nextProps.options, nextProps.values, nextState.input)
            })
        }
    }

    _addValue = (value) => {
        const {allowCustomValues, options, values} = this.props
        // check for available options
        if (!allowCustomValues && !options.map(option => option.value).includes(value)) {
            return
        }
        // check for duplicate
        if (values.includes(value)) {
            return
        }
        this.props.onChange(this.props.values.concat([value]))
        this._resetField()
    }

    _removeValue = (value) => {
        this.props.onChange(this.props.values.filter((v) => v !== value))
    }

    _resetField = () => {
        this.setState({
            input: '',
            selectedOptionIndex: this.props.allowCustomValues ? -1 : 0
        })
    }

    _filterOptions = (options, values, input) => {
        return options.filter((option) => {
            return !values.includes(option.value) &&
                (!input || option.label.toLowerCase().includes(input.toLowerCase()))
        })
    }

    _onInputChange = (event) => {
        const {options, values, allowCustomValues} = this.props
        const value = event.target.value
        this.setState({
            input: value,
            filteredOptions: this._filterOptions(options, values, value),
            selectedOptionIndex: allowCustomValues ? -1 : 0
        })
    }

    _onOptionClick = (event, value) => {
        this._stopPropagation(event)
        this._addValue(value)
        this._focusInput()
    }

    _stopPropagation = (event) => {
        if (!event) {
            return
        }

        event.stopPropagation()
        event.preventDefault()
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

    /**
     * Triggered when keydown on input
     * @param event
     * @private
     */
    _onInputKeyDown = (event) => {
        const {allowCustomValues, values} = this.props
        const {filteredOptions, selectedOptionIndex, input} = this.state
        const key = event.key
        const killedEventsKeys = ['ArrowUp', 'ArrowDown', 'Enter', 'Tab']
        const minSelectedOptionIndex = allowCustomValues ? -1 : 0

        if (killedEventsKeys.includes(key)) {
            this._stopPropagation(event)
        }

        switch (key) {
            // add value
            case 'Escape':
                this._blurInput()
                break
            case 'Tab':
            case 'Enter':
                if (selectedOptionIndex >= 0 && filteredOptions.length > selectedOptionIndex) {
                    // add selected option
                    this._addValue(filteredOptions[selectedOptionIndex].value)
                } else if (input) {
                    // add custom value
                    this._addValue(input)
                }
                break
            // delete previous value
            case 'Backspace':
                if (!input) {
                    this._removeValue(values[values.length - 1])
                }
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

    render() {
        const {allowCustomValues, plural, singular, values, style, tagColor, className} = this.props
        const {filteredOptions, input, optionsOpen, selectedOptionIndex} = this.state
        const hasNoFilteredOptions = filteredOptions.length === 0

        return (
            <div className={classnames('MultiSelectField', className)} style={style}>
                <div
                    className={css.select}
                    onClick={this._focusInput}
                >
                    {values.map((selected, index) => {
                        let selectedOption = this.props.options.find((option) => option.value === selected)
                        const label = selectedOption ? selectedOption.label : selected

                        return (
                            <Badge
                                className={css.tag}
                                style={{
                                    color: tagColor,
                                    margin: '0.25em 0.25em 0 0.25em',
                                }}
                                key={index}
                            >
                                <span>
                                    {label}
                                    <i
                                        className="material-icons ml-1"
                                        onClick={(event) => {
                                            this._stopPropagation(event)
                                            this._removeValue(selected)
                                            this._focusInput()
                                        }}
                                    >
                                        close
                                    </i>
                                </span>
                            </Badge>
                        )
                    })}
                    <div className={css['input-container']}>
                        <UncontrolledDropdown
                            isOpen={optionsOpen && (!hasNoFilteredOptions || !!input)}
                        >
                            <DropdownToggle
                                tag="div"
                                data-toggle="dropdown"
                            >
                                <input
                                    ref="input"
                                    className={`${css.input} ml-2`}
                                    placeholder={`Add ${plural}...`}
                                    value={input}
                                    onFocus={() => {
                                        this.setState({optionsOpen: true})
                                    }}
                                    onBlur={(event) => {
                                        this._stopPropagation(event)
                                        this.setState({optionsOpen: false})
                                    }}
                                    onKeyDown={this._onInputKeyDown}
                                    onChange={this._onInputChange}
                                />
                            </DropdownToggle>
                            <DropdownMenu
                                className={css.options}
                            >
                                {hasNoFilteredOptions && !allowCustomValues ? (
                                    <DropdownItem header>
                                        No result
                                    </DropdownItem>
                                ) : ([
                                    input && allowCustomValues && (
                                        <DropdownItem
                                            key={-1}
                                            type="button"
                                            className={classnames(css.option, {
                                                [`${css['option--focused']}`]: -1 === selectedOptionIndex
                                            })}
                                            onMouseEnter={() => {
                                                this.setState({selectedOptionIndex: -1})
                                            }}
                                            onMouseDown={(event) => {
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
                                                onMouseDown={(event) => {
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
                    </div>
                </div>
            </div>
        )
    }
}
