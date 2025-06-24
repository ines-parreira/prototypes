import { ChangeEvent, useState } from 'react'

import classNames from 'classnames'

import playIcon from 'assets/img/ai-journey/play.svg'

import css from './InputAction.less'

interface InputActionProps {
    value?: string
    onChange?: (value: string) => void
}

export const InputAction = ({
    value,
    onChange = () => {},
}: InputActionProps) => {
    const [isSending, setIsSending] = useState(false)

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target
        const newValue = input.value.replace(/\D/g, '')

        if (newValue.length > 20) return

        onChange(newValue)
    }

    const handleOnBlur = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target
        let newValue = input.value

        newValue = newValue.replace(/^0+(?=\d)/, '')

        if (newValue !== input.value) {
            onChange(newValue)
        }
    }

    const handleClick = () => {
        setIsSending(true)
        setTimeout(() => {
            setIsSending(false)
        }, 2000)
    }

    const actionClass = classNames(css.action, {
        [css['action--sending']]: isSending,
        [css['action--disabled']]: !Boolean(value),
    })

    const actionDecoratorClass = classNames(css.actionDecorator, {
        [css['actionDecorator--sending']]: isSending,
        [css['actionDecorator--disabled']]: !Boolean(value),
    })

    return (
        <div className={css.inputActionContainer}>
            <input
                className={css.input}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={value}
                maxLength={20}
                onChange={handleChange}
                onBlur={handleOnBlur}
                onKeyDown={(evt) =>
                    ['e', 'E', '+', '-'].includes(evt.key) &&
                    evt.preventDefault()
                }
            />
            <button
                className={actionClass}
                onClick={handleClick}
                disabled={!value || isSending}
            >
                {isSending ? 'Sending SMS...' : 'Send test SMS'}
                <div className={actionDecoratorClass}>
                    <img className={css.play} src={playIcon} alt="arrow" />
                </div>
            </button>
        </div>
    )
}
