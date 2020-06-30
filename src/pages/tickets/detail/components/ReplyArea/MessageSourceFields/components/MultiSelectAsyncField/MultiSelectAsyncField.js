import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import _initial from 'lodash/initial'
import _find from 'lodash/find'
import _max from 'lodash/max'
import _min from 'lodash/min'
import _cloneDeep from 'lodash/cloneDeep'
import _trim from 'lodash/trim'
import _isArray from 'lodash/isArray'

import css from './MultiSelectAsyncField.less'

const addressesSeperator = ','

class MultiSelectAsyncField extends React.Component {
    static propTypes = {
        value: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
        placeholder: PropTypes.string,
        disabled: PropTypes.bool.isRequired,
        required: PropTypes.bool.isRequired, // true if a value is required
        allowCreate: PropTypes.bool.isRequired, // true item creation is allowed
        allowCreateConstraint: PropTypes.func, // constraint function called if item creation is allowed
        loadOptions: PropTypes.func.isRequired, // async function returning search results when typing
        autoFocus: PropTypes.bool,
    }

    static defaultProps = {
        allowCreate: false,
        disabled: false,
        required: false,
    }

    inputRef: ?HTMLInputElement

    state = {
        inputValue: '',
        options: [], // displayed options when typing by async loading
        focusedOptionIndex: 0, // index of focused option (hovered by mouse or keyboard controlled)
        focusedItemIndex: null, // index of focused item (clicked by mouse)
    }

    componentDidMount() {
        if (this.props.autoFocus) {
            this.focusInput()
        }
    }

    // unmounting or closed by user (blur somewhere in the page)
    componentWillUnmount() {
        this._onLeaving()
    }

    _onLeaving = () => {
        // try to select hovered option if there is one
        // /!\ DISABLED as this behavior could add unwanted unseen options on blur
        // const {options, focusedOptionIndex} = this.state
        // if (options.length) {
        //     return this._selectOption(focusedOptionIndex)
        // }

        // otherwise add currently written input value
        this._createItemsFromInputValues(this.state.inputValue)
    }

    /**
     * Prevent event from propagating
     * @param e
     * @private
     */
    _killEvent = (e) => {
        if (!e) {
            return
        }

        e.stopPropagation()
        e.preventDefault()
    }

    focusInput = () => {
        const input = ReactDOM.findDOMNode(this.inputRef)

        if (input) {
            input.focus()
        }
    }

    _emptyInput = () => {
        this._setInputValue('')
    }

    _setInputValue = (value) => {
        this.setState({inputValue: value}, () => {
            this._emptyOptions()
        })
    }

    /**
     * Get item at passed index
     * @param index
     * @private
     */
    _getItem = (index) => {
        const {value} = this.props

        if (value.length) {
            if (value.length > index) {
                return value[index]
            }
        }
    }

    /**
     * Select option at passed index from options list
     * @param index
     * @private
     */
    _selectOption = (index) => {
        const {options} = this.state

        if (options.length) {
            if (options.length > index) {
                this._addValues([options[index]])
                this._emptyOptions()
            }
        }
    }

    /**
     * Empty options list
     * @private
     */
    _emptyOptions = () => {
        this.setState({options: []})
    }

    /**
     * Generate an item from an input value (triggered when Enter is pressed, etc.)
     * @param inputValue
     * @returns {*}
     * @private
     */
    _itemFromInput = (inputValue) => {
        // look for "Name <address@mail.com>"
        const formattedAddresses = inputValue.match(/<([^>]+)>/g) || []
        if (formattedAddresses.length) {
            const name = _trim(inputValue.split('<')[0])
            const address = _trim(formattedAddresses[0], '<>')

            return {
                name,
                value: address,
            }
        }

        return {
            value: _trim(inputValue),
        }
    }

    _itemsFromValues = (values) => {
        return values.map(this._itemFromInput)
    }

    /**
     * Generate items from values (may come from input) and add it to items
     * @param values
     * @private
     */
    _createItemsFromInputValues = (values) => {
        if (!values) {
            return
        }
        let formattedValues = values

        if (!_isArray(formattedValues)) {
            formattedValues = [formattedValues]
        }

        const {allowCreate, allowCreateConstraint} = this.props

        // check if can create value
        let canCreateValue = allowCreate

        if (!canCreateValue) {
            return
        }

        // if there is a creation constraint, apply
        if (allowCreateConstraint) {
            formattedValues = formattedValues.filter((value) => {
                const item = this._itemFromInput(value)
                return allowCreateConstraint(item.value)
            })

            // don't do anything if there is nothing to create
            if (formattedValues.length === 0) {
                return
            }
        }

        this._createItems(formattedValues)
    }

    /**
     * Add passed items to items list
     * @param items
     * @private
     */
    _addValues = (items) => {
        const {value, onChange} = this.props

        const filteredItems = items.filter((item) => {
            return !_find(value, {value: item.value})
        })

        onChange(value.concat(filteredItems))
    }

    /**
     * Remove item from items list at passed index
     * @param index
     * @private
     */
    _removeValue = (index) => {
        const {value, onChange} = this.props
        const newValue = _cloneDeep(value)
        newValue.splice(index, 1)
        onChange(newValue)
    }

    /**
     * Triggered when input changes
     * @param e
     * @private
     */
    _onInputChange = (e) => {
        const inputValue = e.target.value

        // if pasting a list of addresses, add them one by one to current addresses
        if (inputValue.includes(addressesSeperator)) {
            this._killEvent(e)
            const splitAddresses = inputValue.split(addressesSeperator)
            return this._createItemsFromInputValues(splitAddresses)
        }

        this.setState(
            {
                inputValue,
                focusedOptionIndex: 0,
            },
            () => {
                return this.props.loadOptions(inputValue, (options) => {
                    this.setState({options})
                })
            }
        )
    }

    /**
     * Triggered when keydown on input
     * @param e
     * @private
     */
    _onInputKeyDown = (e) => {
        const {value, onChange} = this.props
        const {inputValue, options, focusedOptionIndex} = this.state

        const key = e.key

        const killedEventsKeys = ['ArrowUp', 'ArrowDown', 'Enter']
        if (killedEventsKeys.includes(key)) {
            this._killEvent(e)
        }

        // value related commands
        switch (key) {
            // close options
            case 'Escape':
                if (options.length) {
                    this._killEvent(e)
                    this._emptyOptions()
                }
                break
            // delete previous value
            case 'Backspace':
                if (!inputValue) {
                    onChange(_initial(value))
                }
                break
            // move option selection down
            case 'ArrowUp': {
                const newFocusedOptionIndex = _max([focusedOptionIndex - 1, 0])
                this.setState({focusedOptionIndex: newFocusedOptionIndex})
                break
            }
            // move option selection up
            case 'ArrowDown': {
                const newFocusedOptionIndex = _min([
                    focusedOptionIndex + 1,
                    options.length - 1,
                ])
                this.setState({focusedOptionIndex: newFocusedOptionIndex})
                break
            }
            // create new value / select option
            case addressesSeperator:
            case 'Tab':
            case 'Enter': {
                if (options.length) {
                    // selection
                    this._onOptionClick(e, focusedOptionIndex)
                } else {
                    // creation
                    this._createItemsFromInputValues(inputValue)
                }
                break
            }
            default:
        }
    }

    _createItems = (values) => {
        this._addValues(this._itemsFromValues(values))
        this._emptyInput()
        this.focusInput()
    }

    _onOptionClick = (e, index) => {
        this._killEvent(e)
        this._selectOption(index)
        this._emptyInput()
        this.focusInput()
    }

    _onItemClickRemove = (e, index) => {
        this._killEvent(e)
        this._removeValue(index)
        this.focusInput()
    }

    _onInputBlur = (e) => {
        this._killEvent(e)
        this._onLeaving()
    }

    _onItemClick = (e, index) => {
        this._killEvent(e)
        this.setState({
            focusedItemIndex: index,
        })
    }

    _onItemDoubleClick = (e, index) => {
        this._killEvent(e)
        const item = this._getItem(index)

        if (item) {
            if (item.name) {
                this._setInputValue(`${item.name} <${item.value}>`)
            } else {
                this._setInputValue(item.value)
            }
            this._onItemClickRemove(e, index)
        }
    }

    _onItemBlur = (e) => {
        this._killEvent(e)
        this.setState({
            focusedItemIndex: null,
        })
    }

    render() {
        const {value, disabled, placeholder, required} = this.props

        const hasOptions = !!this.state.options.length

        const placeholderOnEmpty = value.length ? '' : placeholder

        // we set the input as required only if this field is required and there is no tag (no value) to this field
        const isInputRequired = required && !value.length

        return (
            <div className={css.field}>
                <div className={css.values} onClick={this.focusInput}>
                    {value.map((item, index) => (
                        <div
                            key={index}
                            className={classnames(css.item, {
                                [css['item--focused']]:
                                    this.state.focusedItemIndex === index,
                            })}
                            tabIndex="999999" // tabIndex is a trick to make the div focusable
                            onBlur={this._onItemBlur}
                            onClick={(e) => this._onItemClick(e, index)}
                            onDoubleClick={(e) =>
                                this._onItemDoubleClick(e, index)
                            }
                        >
                            <span>{item.label}</span>
                            <span
                                className={css['item-remove-button']}
                                onClick={(e) =>
                                    this._onItemClickRemove(e, index)
                                }
                            >
                                <i className="material-icons">close</i>
                            </span>
                        </div>
                    ))}
                    <input
                        type="text"
                        ref={(ref) => (this.inputRef = ref)}
                        className={css.input}
                        value={this.state.inputValue}
                        onChange={this._onInputChange}
                        onKeyDown={this._onInputKeyDown}
                        onBlur={this._onInputBlur}
                        disabled={disabled}
                        required={isInputRequired}
                        placeholder={placeholderOnEmpty}
                        tabIndex="2"
                    />
                </div>
                <div
                    className={classnames(css.suggestions, {
                        [css['suggestions--hidden']]: !hasOptions,
                    })}
                >
                    {this.state.options.map((option, index) => (
                        <div
                            key={index}
                            className={classnames(css.suggestion, {
                                [css['suggestion--focused']]:
                                    this.state.focusedOptionIndex === index,
                            })}
                            onMouseEnter={() =>
                                this.setState({focusedOptionIndex: index})
                            }
                            onClick={(e) => this._onOptionClick(e, index)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            </div>
        )
    }
}

export default MultiSelectAsyncField
