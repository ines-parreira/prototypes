import React, {PropTypes} from 'react'
import classnames from 'classnames'
import _initial from 'lodash/initial'
import _find from 'lodash/find'
import _max from 'lodash/max'
import _min from 'lodash/min'
import _cloneDeep from 'lodash/cloneDeep'
import _trim from 'lodash/trim'

import css from './MultiSelectAsyncField.less'

class MultiSelectAsyncField extends React.Component {
    static propTypes = {
        input: PropTypes.object.isRequired,
        placeholder: PropTypes.string,
        disabled: PropTypes.bool.isRequired,
        required: PropTypes.bool.isRequired, // true if a value is required
        allowCreate: PropTypes.bool.isRequired, // true item creation is allowed
        allowCreateConstraint: PropTypes.func, // constraint function called if item creation is allowed
        loadOptions: PropTypes.func.isRequired, // async function returning search results when typing
    }

    static defaultProps = {
        allowCreate: false,
        disabled: false,
        required: false,
    }

    state = {
        inputValue: '',
        options: [], // displayed options when typing by async loading
        focusedOptionIndex: 0, // index of focused option (hovered by mouse or keyboard controlled)
        focusedItemIndex: null, // index of focused item (clicked by mouse)
    }

    componentDidMount() {
        this._focusInput()
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
        this._createItemFromInputValue()
    }

    /**
     * Prevent event from propagating
     * @param e
     * @private
     */
    _killEvent = (e) => {
        e.stopPropagation()
        e.preventDefault()
    }

    _focusInput = () => {
        $(this.refs.input).focus()
    }

    _emptyInput = () => {
        this._setInputValue('')
    }

    _setInputValue = (value) => {
        this.setState({inputValue: value})
    }

    /**
     * Get item at passed index
     * @param index
     * @private
     */
    _getItem = (index) => {
        const {input: {value}} = this.props

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
                this._addValue(options[index])
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
            value: inputValue
        }
    }

    /**
     * Generate item from input value and add it to items
     * @param e
     * @private
     */
    _createItemFromInputValue = (e) => {
        const {
            allowCreate,
            allowCreateConstraint,
        } = this.props
        const {
            inputValue,
        } = this.state

        // check if can create value
        let canCreateValue = allowCreate

        // if there is a creation constraint, apply
        if (canCreateValue && allowCreateConstraint) {
            const item = this._itemFromInput(inputValue)
            canCreateValue = allowCreateConstraint(item.value)
        }

        if (canCreateValue) {
            this._onItemCreate(e, inputValue)
        }
    }

    /**
     * Add passed item to items list
     * @param item
     * @private
     */
    _addValue = (item) => {
        const {input: {value, onChange}} = this.props

        const alreadyExistingValue = _find(value, {value: item.value})

        if (!alreadyExistingValue) {
            onChange(value.concat([item]))
        }
    }

    /**
     * Remove item from items list at passed index
     * @param index
     * @private
     */
    _removeValue = (index) => {
        const {input: {value, onChange}} = this.props
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
        this.setState({
            inputValue,
            focusedOptionIndex: 0
        })

        this.props.loadOptions(inputValue, (options) => {
            this.setState({options})
        })
    }

    /**
     * Triggered when keydown on input
     * @param e
     * @private
     */
    _onInputKeyDown = (e) => {
        const {
            input: {value, onChange},
        } = this.props
        const {
            inputValue,
            options,
            focusedOptionIndex,
        } = this.state

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
                const newFocusedOptionIndex = _min([focusedOptionIndex + 1, options.length - 1])
                this.setState({focusedOptionIndex: newFocusedOptionIndex})
                break
            }
            // create new value / select option
            case ',':
            case 'Tab':
            case 'Enter': {
                if (options.length) { // selection
                    this._onOptionClick(e, focusedOptionIndex)
                } else { // creation
                    this._createItemFromInputValue(e)
                }
                break
            }
            default:
        }
    }

    /**
     * Create item handler
     * @param e
     * @param value
     * @private
     */
    _onItemCreate = (e, value) => {
        if (e) {
            this._killEvent(e)
        }

        this._addValue(this._itemFromInput(value))

        this._emptyInput()
        this._focusInput()
    }

    _onOptionClick = (e, index) => {
        if (e) {
            this._killEvent(e)
        }
        this._selectOption(index)
        this._emptyInput()
        this._focusInput()
    }

    _onItemClickRemove = (e, index) => {
        if (e) {
            this._killEvent(e)
        }
        this._removeValue(index)
        this._focusInput()
    }

    _onInputBlur = (e) => {
        if (e) {
            this._killEvent(e)
        }
        this._onLeaving()
    }

    _onItemClick = (e, index) => {
        if (e) {
            this._killEvent(e)
        }
        this.setState({
            focusedItemIndex: index,
        })
    }

    _onItemDoubleClick = (e, index) => {
        if (e) {
            this._killEvent(e)
        }
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
        if (e) {
            this._killEvent(e)
        }
        this.setState({
            focusedItemIndex: null,
        })
    }

    render() {
        const {
            input: {value},
            disabled,
            placeholder,
            required,
        } = this.props

        const hasOptions = !!this.state.options.length

        const placeholderOnEmpty = value.length ? '' : placeholder

        // we set the input as required only if this field is required and there is no tag (no value) to this field
        const isInputRequired = required && !value.length

        return (
            <div className={css.field}>
                <div
                    className={css.values}
                    onClick={this._focusInput}
                >
                    {
                        value.map((item, index) => (
                            <div
                                key={index}
                                className={classnames(css.item, {
                                    [css['item--focused']]: this.state.focusedItemIndex === index,
                                })}
                                tabIndex="999999" // tabIndex is a trick to make the div focusable
                                onBlur={this._onItemBlur}
                                onClick={(e) => this._onItemClick(e, index)}
                                onDoubleClick={(e) => this._onItemDoubleClick(e, index)}
                            >
                                <span>
                                    {item.label}
                                </span>
                                <span
                                    className={css['item-remove-button']}
                                    onClick={(e) => this._onItemClickRemove(e, index)}
                                >
                                    <i className="remove icon" />
                                </span>
                            </div>
                        ))
                    }
                    <input
                        type="text"
                        ref="input"
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
                    {
                        this.state.options.map((option, index) => (
                            <div
                                key={index}
                                className={classnames(css.suggestion, {
                                    [css['suggestion--focused']]: this.state.focusedOptionIndex === index,
                                })}
                                onMouseEnter={() => this.setState({focusedOptionIndex: index})}
                                onClick={(e) => this._onOptionClick(e, index)}
                            >
                                {option.label}
                            </div>
                        ))
                    }
                </div>
            </div>
        )
    }
}

export default MultiSelectAsyncField
