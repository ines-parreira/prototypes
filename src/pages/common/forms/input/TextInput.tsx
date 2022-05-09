import React, {
    forwardRef,
    InputHTMLAttributes,
    ReactNode,
    Ref,
    useCallback,
    useContext,
    useImperativeHandle,
    useState,
} from 'react'
import classnames from 'classnames'
import {useEffectOnce, useEvent} from 'react-use'

import {
    GroupContext,
    GroupPositionContext,
} from 'pages/common/components/layout/Group'
import {InputGroupContext} from 'pages/common/forms/input/InputGroup'
import useId from 'hooks/useId'

import css from './TextInput.less'

type Props = {
    hasError?: boolean
    inputClassName?: string
    isDisabled?: boolean
    isRequired?: boolean
    onChange?: (nextValue: string) => void
    prefix?: ReactNode
    suffix?: ReactNode
} & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'disabled' | 'onChange' | 'prefix' | 'required'
>

function TextInput(
    {
        autoFocus,
        className,
        hasError = false,
        inputClassName,
        isDisabled = false,
        isRequired = false,
        id,
        onChange,
        prefix,
        suffix,
        type,
        value,
        ...props
    }: Props,
    ref: Ref<HTMLInputElement> | null | undefined
) {
    const randomId = useId()
    const [inputElement, setInputElement] = useState<HTMLInputElement | null>(
        null
    )
    useImperativeHandle(ref, () => inputElement!)
    const inputId = id || 'input-text-' + randomId
    const context = useContext(GroupContext)
    const inputGroupContext = useContext(InputGroupContext)
    const appendPosition = useContext(GroupPositionContext) || ''
    const [isFocused, setIsFocused] = useState(!!autoFocus)

    const handleFocus = useCallback(() => {
        inputGroupContext?.setIsFocused(true)
        setIsFocused(true)
    }, [inputGroupContext])

    const handleBlur = useCallback(() => {
        inputGroupContext?.setIsFocused(false)
        setIsFocused(false)
    }, [inputGroupContext])

    useEffectOnce(() => {
        autoFocus && inputElement?.focus()
    })

    useEvent('focus', handleFocus, inputElement)
    useEvent('blur', handleBlur, inputElement)

    const handleAffixClick = useCallback(() => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [inputElement])

    return (
        <div
            className={classnames(
                css.wrapper,
                css[appendPosition],
                {
                    [css.hasError]: hasError,
                    [css.isDisabled]: context?.isDisabled || isDisabled,
                    [css.isFocused]: isFocused,
                    [css.isNested]: !!inputGroupContext,
                },
                className
            )}
        >
            {prefix && (
                <span className={css.prefix} onClick={handleAffixClick}>
                    {prefix}
                </span>
            )}
            <input
                ref={setInputElement}
                type={type || 'text'}
                className={classnames(css.input, inputClassName)}
                value={value}
                id={inputId}
                name={inputId}
                onChange={(event) => onChange?.(event.target.value)}
                required={isRequired}
                disabled={context?.isDisabled || isDisabled}
                autoFocus={autoFocus}
                {...props}
            />
            {suffix && (
                <span className={css.suffix} onClick={handleAffixClick}>
                    {suffix}
                </span>
            )}
        </div>
    )
}

export default forwardRef(TextInput)
