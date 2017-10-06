import React, {Component, PropTypes} from 'react'
import {
    Dropdown,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'
import classnames from 'classnames'
import _max from 'lodash/max'
import _min from 'lodash/min'

import css from './SelectField.less'
import Search from '../components/Search'

export default class SelectField extends Component {
    static propTypes = {
        style: PropTypes.object,
        placeholder: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        options: PropTypes.arrayOf(PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            text: PropTypes.string.isRequired, // text used to filter with the search value
            label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired, // text displayed in the dropdown
        })),
        onChange: PropTypes.func.isRequired
    }

    static defaultProps = {
        options: [],
        style: {},
        placeholder: ''
    }

    constructor(props) {
        super(props)
        this.state = {
            optionsOpen: false,
            selectedOptionIndex: 0,
            filteredOptions: this._filterOptions(props.options, props.value, '')
        }
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (this.props.value !== nextProps.value) {
            this.setState({
                filteredOptions: this._filterOptions(nextProps.options, nextProps.value, nextState.input)
            })
        }
    }

    _filterOptions = (options, value, input) => {
        return options.filter((option) => {
            return option.value !== value &&
                (!input || option.text.toLowerCase().includes(input.toLowerCase()))
        })
    }

    _onSearchChange = (input) => {
        const {options, value} = this.props
        this.setState({
            filteredOptions: this._filterOptions(options, value, input),
            selectedOptionIndex: 0
        })
    }

    _stopPropagation = (event) => {
        if (!event) {
            return
        }

        event.stopPropagation()
        event.preventDefault()
    }

    _onSearchKeyDown = (event) => {
        const {onChange} = this.props
        const {filteredOptions, selectedOptionIndex} = this.state
        const key = event.key
        const killedEventsKeys = ['ArrowUp', 'ArrowDown', 'Enter']

        if (killedEventsKeys.includes(key)) {
            this._stopPropagation(event)
        }

        switch (key) {
            // add selected option
            case 'Tab':
            case 'Enter':
                if (selectedOptionIndex >= 0 && filteredOptions.length > selectedOptionIndex) {
                    onChange(filteredOptions[selectedOptionIndex].value)
                    this._toggleDropdown()
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

    _toggleDropdown = () => {
        const {optionsOpen} = this.state
        this.setState({optionsOpen: !optionsOpen})
    }

    _onOptionClick = (event, value) => {
        this._stopPropagation(event)
        this.props.onChange(value)
        this._toggleDropdown()
    }

    render() {
        const {value, style, placeholder} = this.props
        const {filteredOptions, optionsOpen, selectedOptionIndex} = this.state
        const selectedOption = this.props.options.find(option => option.value === value)
        const label = selectedOption ? selectedOption.label : placeholder

        return (
            <div style={style}>
                <div>
                    <div
                        className="btn btn-secondary dropdown-toggle clickable"
                        onClick={this._toggleDropdown}
                    >
                        {label}
                    </div>
                </div>
                <Dropdown
                    toggle={this._toggleDropdown}
                    isOpen={optionsOpen}
                >
                    <DropdownMenu>
                        <DropdownItem
                            key="search"
                            header
                            className="dropdown-item-input"
                        >
                            <Search
                                onChange={this._onSearchChange}
                                onKeyDown={this._onSearchKeyDown}
                                autoFocus
                            />
                        </DropdownItem>
                        <DropdownItem
                            key="divider"
                            divider
                        />
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
                                        onMouseDown={(event) => {
                                            this._onOptionClick(event, item.value)
                                        }}
                                    >
                                        {item.label}
                                    </DropdownItem>
                                )
                            })
                        )}
                    </DropdownMenu>
                </Dropdown>
            </div>
        )
    }
}
