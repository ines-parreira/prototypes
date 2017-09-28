import React, {Component, PropTypes} from 'react'
import {
    UncontrolledDropdown,
    DropdownMenu,
    DropdownItem,
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
        showNoResult: PropTypes.bool,
        singular: PropTypes.string,
        values: PropTypes.array,

        onChange: PropTypes.func.isRequired
    }

    static defaultProps = {
        allowCustomValues: false,
        options: [],
        plural: 'items',
        singular: 'item',
        showNoResult: false,
        values: [],
    }

    constructor(props) {
        super(props)
        this.state = {
            input: '',
            optionsOpen: false,
            // select first option by default if custom values are not allowed
            selectedOptionIndex: props.allowCustomValues ? -1 : 0,
            filteredOptions: this._filterOptions(props.options, props.values, '')
        }
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (this.props.values.length !== nextProps.values.length) {
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
        }
    }

    /**
     * Triggered when keydown on input
     * @param event
     * @private
     */
    _onInputKeyDown = (event) => {
        const {filteredOptions, selectedOptionIndex, input} = this.state
        const {values} = this.props
        const key = event.key
        const killedEventsKeys = ['ArrowUp', 'ArrowDown', 'Enter']

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
                this.setState({selectedOptionIndex: _max([selectedOptionIndex - 1, 0])})
                break
            // move option selection up
            case 'ArrowDown':
                this.setState({selectedOptionIndex: _min([selectedOptionIndex + 1, filteredOptions.length - 1])})
                break
            default:
        }
    }

    render() {
        const {plural, showNoResult, values} = this.props
        const {filteredOptions, input, optionsOpen, selectedOptionIndex} = this.state

        return (
            <div>
                <div
                    className={`${css.select}`}
                    onClick={this._focusInput}
                >
                    {values.map((selected, index) => {
                        let selectedOption = this.props.options.find(option => option.value === selected)
                        const label = selectedOption ? selectedOption.label : selected

                        return (
                            <Badge
                                className="tag"
                                style={{
                                    color: '#0275d8',
                                    margin: '0.25em 0',
                                }}
                                key={index}
                            >
                                <span>
                                    {label}
                                    <i
                                        className="fa fa-fw fa-close cursor-pointer ml-1"
                                        onClick={(event) => {
                                            this._stopPropagation(event)
                                            this._removeValue(selected)
                                            this._focusInput()
                                        }}
                                    />
                                </span>
                            </Badge>
                        )
                    })}
                    <div className={css['input-container']}>
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
                        <UncontrolledDropdown
                            className={css.options}
                            style={{width: '230px'}}
                            isOpen={optionsOpen && (filteredOptions.length > 0 || showNoResult)}
                        >
                            <DropdownMenu>
                                {filteredOptions.length === 0 ? (
                                    <DropdownItem header>
                                        No result
                                    </DropdownItem>
                                ) : (
                                    filteredOptions.map((item, index) => {
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
                                                onMouseDown={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    this._addValue(item.value)
                                                    this._focusInput()
                                                }}
                                            >
                                                {item.label}
                                            </DropdownItem>
                                        )
                                    })
                                )}
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    </div>
                </div>
            </div>
        )
    }
}
