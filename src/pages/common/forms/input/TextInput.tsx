import React, {
    cloneElement,
    ComponentProps,
    forwardRef,
    InputHTMLAttributes,
    isValidElement,
    ReactElement,
    Ref,
    useMemo,
} from 'react'
import _uniqueId from 'lodash/uniqueId'
import classnames from 'classnames'

import IconInput from './IconInput'

import css from './TextInput.less'

type Props = {
    hasError?: boolean
    inputClassName?: string
    isDisabled?: boolean
    isRequired?: boolean
    leftIcon?: ReactElement<ComponentProps<typeof IconInput>, typeof IconInput>
    rightIcon?: ReactElement<ComponentProps<typeof IconInput>, typeof IconInput>
    onChange: (nextValue: string) => void
} & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'disabled' | 'onChange' | 'required'
>

function TextInput(
    {
        className,
        hasError = false,
        inputClassName,
        isDisabled = false,
        isRequired = false,
        id,
        leftIcon,
        rightIcon,
        onChange,
        type,
        value,
        ...props
    }: Props,
    ref: Ref<HTMLInputElement> | null | undefined
) {
    const inputId = useMemo(() => id || _uniqueId('input-text-'), [id])

    return (
        <div
            className={classnames(
                css.wrapper,
                {[css.isDisabled]: isDisabled},
                className
            )}
        >
            {leftIcon &&
                isValidElement(leftIcon) &&
                cloneElement(leftIcon, {position: 'left'})}
            <input
                type={type || 'text'}
                className={classnames(
                    css.input,
                    {
                        [css.inputError]: hasError,
                        [css.hasLeftIcon]: !!leftIcon,
                        [css.hasRightIcon]: !!rightIcon,
                    },
                    inputClassName
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
            {rightIcon &&
                isValidElement(rightIcon) &&
                cloneElement(rightIcon, {position: 'right'})}
        </div>
    )
}

export default forwardRef(TextInput)
