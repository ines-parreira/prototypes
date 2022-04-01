import React, {
    ChangeEvent,
    FocusEvent,
    KeyboardEvent,
    MouseEvent,
    SyntheticEvent,
} from 'react'
import {findDOMNode} from 'react-dom'
import classnames from 'classnames'
import _initial from 'lodash/initial'
import _find from 'lodash/find'
import _max from 'lodash/max'
import _min from 'lodash/min'
import _cloneDeep from 'lodash/cloneDeep'
import _trim from 'lodash/trim'
import _isArray from 'lodash/isArray'

import {ReceiverValue} from 'state/ticket/utils'

import css from './MultiSelectAsyncField.less'

const addressesSeperator = ','

type Props = {
    value: ReceiverValue[]
    onChange: (value: any) => void
    placeholder: string
    disabled: boolean
    required: boolean // true if a value is required
    allowCreate: boolean // true item creation is allowed
    allowCreateConstraint: (args: any) => void // constraint function called if item creation is allowed
    loadOptions: (
        input: string,
        callback: (options: ReceiverValue[]) => void
    ) => Promise<void> // async function returning search results when typing
    autoFocus?: boolean
}

type State = {
    inputValue: string
    options: ReceiverValue[]
    focusedOptionIndex: number
    focusedItemIndex: number | null
}
class MultiSelectAsyncField extends React.Component<Props, State> {
    static defaultProps: Pick<Props, 'allowCreate' | 'disabled' | 'required'> =
        {
            allowCreate: false,
            disabled: false,
            required: false,
        }

    inputRef?: HTMLInputElement | null

    state: State = {
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
        this.onLeaving()
    }

    onLeaving = () => {
        // try to select hovered option if there is one
        // /!\ DISABLED as this behavior could add unwanted unseen options on blur
        // const {options, focusedOptionIndex} = this.state
        // if (options.length) {
        //     return this._selectOption(focusedOptionIndex)
        // }

        // otherwise add currently written input value
        this.createItemsFromInputValues(this.state.inputValue)
    }

    /**
     * Prevent event from propagating
     * @param e
     * @private
     */
    killEvent = (e: SyntheticEvent) => {
        if (!e) {
            return
        }

        e.stopPropagation()
        e.preventDefault()
    }

    focusInput = () => {
        const input = findDOMNode(this.inputRef) as HTMLElement

        if (input) {
            input.focus()
        }
    }

    emptyInput = () => {
        this.setInputValue('')
    }

    setInputValue = (value: string) => {
        this.setState({inputValue: value}, () => {
            this.emptyOptions()
        })
    }

    getItem = (index: number) => {
        const {value} = this.props

        if (value.length) {
            if (value.length > index) {
                return value[index]
            }
        }
    }

    selectOption = (index: number) => {
        const {options} = this.state

        if (options.length) {
            if (options.length > index) {
                this.addValues([options[index]])
                this.emptyOptions()
            }
        }
    }

    emptyOptions = () => {
        this.setState({options: []})
    }

    /**
     * Generate an item from an input value (triggered when Enter is pressed, etc.)
     */
    itemFromInput = (inputValue: string) => {
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

    itemsFromValues = (values: string[]) => {
        return values.map(this.itemFromInput)
    }

    /**
     * Generate items from values (may come from input) and add it to items
     * @param values
     * @private
     */
    createItemsFromInputValues = (values: string | string[]) => {
        if (!values) {
            return
        }
        let formattedValues = values

        if (!_isArray(formattedValues)) {
            formattedValues = [formattedValues]
        }

        const {allowCreate, allowCreateConstraint} = this.props

        // check if can create value
        if (!allowCreate) {
            return
        }

        // if there is a creation constraint, apply
        if (allowCreateConstraint) {
            formattedValues = formattedValues.filter((value) => {
                const item = this.itemFromInput(value)
                return allowCreateConstraint(item.value)
            })

            // don't do anything if there is nothing to create
            if (formattedValues.length === 0) {
                return
            }
        }

        this.createItems(formattedValues)
    }

    addValues = (
        items: {
            name?: string
            value: string
        }[]
    ) => {
        const {value, onChange} = this.props
        const filteredItems = items.filter((item) => {
            return !_find(value, {value: item.value})
        })

        onChange(value.concat(filteredItems as ReceiverValue[]))
    }

    removeValue = (index: number) => {
        const {value, onChange} = this.props
        const newValue = _cloneDeep(value)
        newValue.splice(index, 1)
        onChange(newValue)
    }

    onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value

        // if pasting a list of addresses, add them one by one to current addresses
        if (inputValue.includes(addressesSeperator)) {
            this.killEvent(e)
            const splitAddresses = inputValue.split(addressesSeperator)
            return this.createItemsFromInputValues(splitAddresses)
        }

        this.setState(
            {
                inputValue,
                focusedOptionIndex: 0,
            },
            () => {
                void this.props.loadOptions(inputValue, (options) => {
                    this.setState({options})
                })
            }
        )
    }

    onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        const {value, onChange} = this.props
        const {inputValue, options, focusedOptionIndex} = this.state

        const key = e.key

        const killedEventsKeys = ['ArrowUp', 'ArrowDown', 'Enter']
        if (killedEventsKeys.includes(key)) {
            this.killEvent(e)
        }

        // value related commands
        switch (key) {
            // close options
            case 'Escape':
                if (options.length) {
                    this.killEvent(e)
                    this.emptyOptions()
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
                const newFocusedOptionIndex = _max([
                    focusedOptionIndex - 1,
                    0,
                ]) as number
                this.setState({focusedOptionIndex: newFocusedOptionIndex})
                break
            }
            // move option selection up
            case 'ArrowDown': {
                const newFocusedOptionIndex = _min([
                    focusedOptionIndex + 1,
                    options.length - 1,
                ]) as number
                this.setState({focusedOptionIndex: newFocusedOptionIndex})
                break
            }
            // create new value / select option
            case addressesSeperator:
            case 'Tab':
            case 'Enter': {
                if (options.length) {
                    // selection
                    this.onOptionClick(e, focusedOptionIndex)
                } else {
                    // creation
                    this.createItemsFromInputValues(inputValue)
                }
                break
            }
            default:
        }
    }

    createItems = (values: string[]) => {
        this.addValues(this.itemsFromValues(values))
        this.emptyInput()
        this.focusInput()
    }

    onOptionClick = (
        e:
            | MouseEvent<HTMLDivElement, globalThis.MouseEvent>
            | KeyboardEvent<HTMLInputElement>,
        index: number
    ) => {
        this.killEvent(e)
        this.selectOption(index)
        this.emptyInput()
        this.focusInput()
    }

    onItemClickRemove = (
        e: MouseEvent<HTMLSpanElement, globalThis.MouseEvent>,
        index: number
    ) => {
        this.killEvent(e)
        this.removeValue(index)
        this.focusInput()
    }

    onInputBlur = (e: FocusEvent<HTMLInputElement>) => {
        this.killEvent(e)
        this.onLeaving()
    }

    onItemClick = (
        e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
        index: number
    ) => {
        this.killEvent(e)
        this.setState({
            focusedItemIndex: index,
        })
    }

    onItemDoubleClick = (
        e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
        index: number
    ) => {
        this.killEvent(e)
        const item = this.getItem(index)

        if (item) {
            if (item.name) {
                this.setInputValue(`${item.name} <${item.value}>`)
            } else {
                this.setInputValue(item.value)
            }
            this.onItemClickRemove(e, index)
        }
    }

    onItemBlur = (e: FocusEvent<HTMLDivElement>) => {
        this.killEvent(e)
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
                            tabIndex={999999} // tabIndex is a trick to make the div focusable
                            onBlur={this.onItemBlur}
                            onClick={(e) => this.onItemClick(e, index)}
                            onDoubleClick={(e) =>
                                this.onItemDoubleClick(e, index)
                            }
                        >
                            <span>{item.label}</span>
                            <span
                                className={css['item-remove-button']}
                                onClick={(e) =>
                                    this.onItemClickRemove(e, index)
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
                        onChange={this.onInputChange}
                        onKeyDown={this.onInputKeyDown}
                        onBlur={this.onInputBlur}
                        disabled={disabled}
                        required={isInputRequired}
                        placeholder={placeholderOnEmpty}
                        tabIndex={2}
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
                            onClick={(e) => this.onOptionClick(e, index)}
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
