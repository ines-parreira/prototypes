import React, {
    ForwardedRef,
    forwardRef,
    InputHTMLAttributes,
    useState,
} from 'react'

import classnames from 'classnames'

import css from './StealthInput.less'

type Props = {
    isActive?: boolean
    isDisabled?: boolean
    hasError?: boolean
    onChange?: (nextValue: string) => void
    id: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'required'>

function StealthInput(
    {
        isActive: isExternalActive,
        isDisabled = false,
        hasError = false,
        onChange,
        onFocus,
        onBlur,
        type = 'text',
        value,
        className,
        placeholder = '+Add',
        id,
        ...props
    }: Props,
    ref: ForwardedRef<HTMLInputElement>,
) {
    const [isInputActive, setInputActive] = useState(false)
    const isActive = isExternalActive ?? isInputActive

    return (
        <input
            id={id}
            ref={ref}
            type={type}
            disabled={isDisabled}
            className={classnames(css.baseStyles, className, {
                // beware, order can matter
                [css.stealth]: !isActive,
                [css.valid]: isActive && !hasError,
                [css.invalid]: hasError,
            })}
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            onFocus={(evt) => {
                if (!isActive && !isDisabled) {
                    setInputActive(true)
                    onFocus?.(evt)
                }
            }}
            onBlur={(evt) => {
                if (isActive && !isDisabled) {
                    setInputActive(false)
                    onBlur?.(evt)
                }
            }}
            placeholder={placeholder}
            autoComplete="off"
            {...props}
        />
    )
}

export default forwardRef<HTMLInputElement, Props>(StealthInput)
