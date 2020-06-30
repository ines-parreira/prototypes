// @flow
import React from 'react'

import css from './Input.less'

type Props = {
    placeholder: string,
    value: string,
    isFocused: boolean,
    onFocus: () => void,
    onBlur: () => void,
    onSubmit: () => void,
    onDelete: () => void,
    onUp: () => void,
    onDown: () => void,
    onChange: (string) => void,
}

export default class Input extends React.Component<Props> {
    // TODO (@pwlmaciejewski): FlowFixing for now. Types should be fine after flow version bump
    //$FlowFixMe
    inputRef: React.Ref<*>

    constructor(props: Props) {
        super(props)
        // TODO (@pwlmaciejewski): FlowFixing for now. Types should be fine after flow version bump
        //$FlowFixMe
        this.inputRef = React.createRef()
    }

    componentDidMount() {
        this._updateFocus()
    }

    componentDidUpdate() {
        this._updateFocus()
    }

    _updateFocus = () => {
        if (this.props.isFocused) {
            this.inputRef.current && this.inputRef.current.focus()
        } else {
            this.inputRef.current && this.inputRef.current.blur()
        }
    }

    _onBlur = (event: SyntheticEvent<*>) => {
        event.preventDefault()
        event.stopPropagation()
        this.props.onBlur()
    }

    _onKeyDown = (event: SyntheticKeyboardEvent<*>) => {
        const {value} = this.props
        const key = event.key
        const killedEventsKeys = ['ArrowUp', 'ArrowDown', 'Enter']

        if (killedEventsKeys.includes(key)) {
            event.preventDefault()
            event.stopPropagation()
        }

        switch (key) {
            // add value
            case 'Escape':
                this.props.onBlur()
                this.props.onChange('')
                break
            case 'Tab':
                if (value) {
                    event.preventDefault()
                    event.stopPropagation()
                    this.props.onSubmit()
                }
                break
            case 'Enter':
                this.props.onSubmit()
                break
            // delete previous value
            case 'Backspace':
                if (!value) {
                    this.props.onDelete()
                }
                break
            // move option selection down
            case 'ArrowUp':
                this.props.onUp()
                break
            // move option selection up
            case 'ArrowDown':
                this.props.onDown()
                break
            default:
        }
    }

    _onChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const {onChange} = this.props
        const value = event.target.value
        onChange && onChange(value)
    }

    render() {
        return (
            <input
                ref={this.inputRef}
                className={`${css.input} ml-2`}
                placeholder={this.props.placeholder}
                value={this.props.value}
                onFocus={this.props.onFocus}
                onBlur={this._onBlur}
                onKeyDown={this._onKeyDown}
                onChange={this._onChange}
            />
        )
    }
}
