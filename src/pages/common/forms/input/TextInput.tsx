import React, {forwardRef, InputHTMLAttributes, Ref, useMemo} from 'react'
import _uniqueId from 'lodash/uniqueId'
import classnames from 'classnames'

import css from './TextInput.less'

type Props = {
    hasError?: boolean
    isDisabled?: boolean
    isRequired?: boolean
    onChange: (nextValue: string) => void
} & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'disabled' | 'onChange' | 'required'
>

function TextInput(
    {
        className,
        hasError = false,
        isDisabled = false,
        isRequired = false,
        id,
        onChange,
        type,
        value,
        ...props
    }: Props,
    ref: Ref<HTMLInputElement> | null | undefined
) {
    const inputId = useMemo(() => id || _uniqueId('input-text-'), [id])

    return (
        <div className={className}>
            <input
                type={type || 'text'}
                className={classnames(
                    css.input,
                    {
                        [css.inputError]: hasError,
                    },
                    className
                )}
                value={value}
                id={inputId}
                name={inputId}
                onChange={(event) => onChange(event.target.value)}
                required={isRequired}
                disabled={isDisabled}
                ref={ref}
                {...props}
            />
        </div>
    )
}

export default forwardRef(TextInput)
