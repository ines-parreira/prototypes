import React, {forwardRef, InputHTMLAttributes, Ref, useState} from 'react'
import classnames from 'classnames'

import css from './StealthInput.less'

type Props = {
    isActive?: boolean
    hasError?: boolean
    onChange?: (nextValue: string) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'required'>

function StealthInput(
    {
        isActive: isExternalActive,
        hasError = false,
        onChange,
        onFocus,
        onBlur,
        type = 'text',
        value,
        className,
        placeholder = '+Add',
        ...props
    }: Props,
    ref: Ref<HTMLInputElement>
) {
    const [isInputActive, setInputActive] = useState(false)
    const isActive = isExternalActive ?? isInputActive

    return (
        <input
            ref={ref}
            type={type}
            className={classnames(css.baseStyles, className, {
                // beware, order can matter
                [css.stealth]: !isActive,
                [css.isPlaceholding]:
                    typeof value === 'undefined' || value === '',
                [css.valid]: isActive && !hasError,
                [css.invalid]: hasError,
            })}
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            onFocus={(evt) => {
                if (!isActive) {
                    setInputActive(true)
                    onFocus?.(evt)
                }
            }}
            onBlur={(evt) => {
                if (isActive) {
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

export default forwardRef(StealthInput)
