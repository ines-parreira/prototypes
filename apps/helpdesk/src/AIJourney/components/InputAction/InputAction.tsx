import { ChangeEvent, useRef, useState } from 'react'

import classNames from 'classnames'

import { isValidPhoneNumber } from 'AIJourney/utils'
import playIcon from 'assets/img/ai-journey/play.svg'

import css from './InputAction.less'

type InputActionProps = {
    value?: string
    onChange?: (value: string) => void
    onActionClick?: () => Promise<void>
}

const createUnderscores = (count: number): string => {
    return '_'.repeat(count)
}

const getCursorPosition = (digits: string) => {
    const length = digits.length

    if (length === 0) return 1 // After opening parenthesis
    if (length <= 3) return length + 1 // Within area code, after last digit
    if (length <= 6) return length + 3 // After ") " and within exchange
    return length + 4 // After ") " and "-"
}

export const InputAction = ({
    value,
    onChange = () => {},
    onActionClick,
}: InputActionProps) => {
    const [isSending, setIsSending] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const placeholder = '(___) ___-____'

    const isValid = isValidPhoneNumber(value)

    const formatPhoneNumber = (value: string) => {
        const digits = value.replace(/\D/g, '')

        if (digits.length <= 3) {
            return `(${digits}${createUnderscores(3 - digits.length)}) ___-____`
        } else if (digits.length <= 6) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3)}${createUnderscores(3 - digits.slice(3).length)}-____`
        }
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}${createUnderscores(4 - digits.slice(6, 10).length)}`
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target
        const inputValue = input.value

        // Extract digits from the input
        let digits = inputValue.replace(/\D/g, '')

        // Handle US phone numbers with country code prefix
        // Remove leading 1 if we have exactly 11 digits (US/Canada format)
        if (digits.length === 11 && digits.startsWith('1')) {
            digits = digits.substring(1)
        }

        // Limit to 10 digits max
        if (digits.length > 10) {
            return
        }

        const formattedValue = formatPhoneNumber(digits)
        onChange(formattedValue)

        const newCursorPosition = getCursorPosition(digits)

        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.setSelectionRange(
                    newCursorPosition,
                    newCursorPosition,
                )
            }
        }, 0)
    }

    const handleOnBlur = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target
        let digits = input.value.replace(/\D/g, '')

        // Handle US phone numbers with country code prefix
        // Remove leading 1 if we have exactly 11 digits (US/Canada format)
        if (digits.length === 11 && digits.startsWith('1')) {
            digits = digits.substring(1)
        }

        // Remove leading zeros
        const cleanedDigits = digits.replace(/^0+(?=\d)/, '')

        if (cleanedDigits !== digits) {
            const formattedValue = formatPhoneNumber(cleanedDigits)
            onChange(formattedValue)
        }
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
                inputMode="numeric"
                pattern="[0-9]*"
                value={value}
                placeholder={placeholder}
                onChange={handleChange}
                onBlur={handleOnBlur}
                onKeyDown={(evt) =>
                    ['e', 'E', '+', '-'].includes(evt.key) &&
                    evt.preventDefault()
                }
            />
            <button
                className={actionClass}
                onClick={handleActionClick}
                disabled={!isValid || isSending}
            >
                {isSending ? 'Sending SMS...' : 'Send test SMS'}
                <div className={actionDecoratorClass}>
                    <img className={css.play} src={playIcon} alt="arrow" />
                </div>
            </button>
        </div>
    )
}
