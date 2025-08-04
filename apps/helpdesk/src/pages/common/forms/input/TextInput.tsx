import {
    ForwardedRef,
    forwardRef,
    InputHTMLAttributes,
    ReactNode,
    useCallback,
    useContext,
    useImperativeHandle,
    useState,
} from 'react'

import { useEffectOnce, useEvent, useId } from '@repo/hooks'
import classnames from 'classnames'

import {
    GroupContext,
    GroupPositionContext,
} from 'pages/common/components/layout/Group'
import IconInput from 'pages/common/forms/input/IconInput'
import { InputGroupContext } from 'pages/common/forms/input/InputGroup'

import css from './TextInput.less'

type Props = {
    hasError?: boolean
    inputClassName?: string
    isDisabled?: boolean
    isRequired?: boolean
    onChange?: (nextValue: string) => void
    prefix?: ReactNode
    suffix?: ReactNode
    inputWrapperClassName?: string
    withClearText?: boolean
    disableAffixClick?: boolean
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
        inputWrapperClassName,
        withClearText = false,
        disableAffixClick = false,
        ...props
    }: Props,
    ref: ForwardedRef<HTMLInputElement>,
) {
    const randomId = useId()
    const [inputElement, setInputElement] = useState<HTMLInputElement | null>(
        null,
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
        if (inputElement && !disableAffixClick) {
            inputElement.focus()
        }
    }, [inputElement, disableAffixClick])

    const handleClearText = useCallback(() => {
        onChange?.('')
    }, [onChange])

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
                className,
                inputWrapperClassName,
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
            {withClearText && (
                <span
                    className={css.suffix}
                    onClick={handleClearText}
                    role="button"
                    aria-label="Clear text"
                >
                    <IconInput className={css.clearIcon} icon="close" />
                </span>
            )}
        </div>
    )
}

export default forwardRef<HTMLInputElement, Props>(TextInput)
