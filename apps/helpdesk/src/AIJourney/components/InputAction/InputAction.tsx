import { ChangeEvent, useRef, useState } from 'react'

import classNames from 'classnames'
import { AsYouType } from 'libphonenumber-js'

import { isValidPhoneNumber } from 'AIJourney/utils'
import playIcon from 'assets/img/ai-journey/play.svg'

import css from './InputAction.less'

type InputActionProps = {
    value?: string
    onChange?: (value: string) => void
    onActionClick?: () => Promise<void>
}

export const InputAction = ({
    value,
    onChange = () => {},
    onActionClick,
}: InputActionProps) => {
    const [isSending, setIsSending] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const placeholder = '+1 555 555 5555'

    const isValid = isValidPhoneNumber(value)

    const cleanPhoneNumber = (input: string): string => {
        return input.replaceAll(/[^\d+]/g, '')
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value
        const cursorPosition = e.target.selectionStart || 0

        if (!inputValue) {
            onChange('')
            return
        }

        const cleanedValue = cleanPhoneNumber(inputValue)
        const formatter = new AsYouType()
        const formattedValue = formatter.input(cleanedValue)

        onChange(formattedValue)

        const charsBeforeCursor = inputValue.slice(0, cursorPosition)
        const digitsBeforeCursor = cleanPhoneNumber(charsBeforeCursor).length

        let newCursorPosition = 0
        let digitCount = 0

        for (let i = 0; i < formattedValue.length; i++) {
            if (/[\d+]/.test(formattedValue[i])) {
                digitCount++
                if (digitCount === digitsBeforeCursor) {
                    newCursorPosition = i + 1
                    break
                }
            }
        }

        if (digitCount < digitsBeforeCursor) {
            newCursorPosition = formattedValue.length
        }

        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.setSelectionRange(
                    newCursorPosition,
                    newCursorPosition,
                )
            }
        }, 0)
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pastedText = e.clipboardData.getData('text')

        const cleanedValue = cleanPhoneNumber(pastedText)
        const formatter = new AsYouType()
        const formattedValue = formatter.input(cleanedValue)

        onChange(formattedValue)
    }

    const handleActionClick = async () => {
        setIsSending(true)
        try {
            await onActionClick?.()
        } finally {
            setIsSending(false)
        }
    }

    const actionClass = classNames(css.action, {
        [css['action--sending']]: isSending,
        [css['action--disabled']]: !isValid,
    })

    const actionDecoratorClass = classNames(css.actionDecorator, {
        [css['actionDecorator--sending']]: isSending,
        [css['actionDecorator--disabled']]: !isValid,
    })

    return (
        <div className={css.inputActionContainer}>
            <input
                ref={inputRef}
                className={css.input}
                type="text"
                inputMode="tel"
                value={value}
                placeholder={placeholder}
                onChange={handleChange}
                onPaste={handlePaste}
            />
            <button
                className={actionClass}
                onClick={handleActionClick}
                disabled={!isValid || isSending}
            >
                {isSending ? 'Sending SMS...' : 'Send SMS'}
                <div className={actionDecoratorClass}>
                    <img className={css.play} src={playIcon} alt="arrow" />
                </div>
            </button>
        </div>
    )
}
