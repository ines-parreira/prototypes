import React, {Component, FocusEvent, KeyboardEvent, ChangeEvent} from 'react'
import classnames from 'classnames'

import css from './Input.less'

type Props = {
    placeholder: string
    value?: string
    isFocused: boolean
    onFocus: () => void
    onBlur: () => void
    onSubmit: () => void
    onDelete: () => void
    onUp: () => void
    onDown: () => void
    onChange: (value: string) => void
    isCompact?: boolean
}

export default class Input extends Component<Props> {
    inputRef = React.createRef<HTMLInputElement>()

    componentDidMount() {
        this.updateFocus()
    }

    componentDidUpdate() {
        this.updateFocus()
    }

    updateFocus = () => {
        const {isFocused} = this.props

        if (isFocused) {
            this.inputRef.current && this.inputRef.current.focus()
        } else {
            this.inputRef.current && this.inputRef.current.blur()
        }
    }

    handleBlur = (event: FocusEvent) => {
        const {onBlur} = this.props

        event.preventDefault()
        event.stopPropagation()
        onBlur()
    }

    handleKeyDown = (event: KeyboardEvent) => {
        const {onBlur, onChange, onDelete, onSubmit, onUp, onDown, value} =
            this.props
        const key = event.key
        const killedEventsKeys = ['ArrowUp', 'ArrowDown', 'Enter']

        if (killedEventsKeys.includes(key)) {
            event.preventDefault()
            event.stopPropagation()
        }

        switch (key) {
            // add value
            case 'Escape':
                onBlur()
                onChange('')
                break
            case 'Tab':
                if (value) {
                    event.preventDefault()
                    event.stopPropagation()
                    onSubmit()
                }
                break
            case 'Enter':
                onSubmit()
                break
            // delete previous value
            case 'Backspace':
                if (!value) {
                    onDelete()
                }
                break
            // move option selection down
            case 'ArrowUp':
                onUp()
                break
            // move option selection up
            case 'ArrowDown':
                onDown()
                break
            default:
        }
    }

    handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {onChange} = this.props
        const value = event.target.value
        onChange && onChange(value)
    }

    render() {
        const {placeholder, value, onFocus, isCompact} = this.props

        return (
            <input
                ref={this.inputRef}
                className={classnames(css.input, {
                    [css.compact]: isCompact,
                })}
                placeholder={placeholder}
                value={value}
                onFocus={onFocus}
                onBlur={this.handleBlur}
                onKeyDown={this.handleKeyDown}
                onChange={this.handleChange}
            />
        )
    }
}
