import React, {
    ButtonHTMLAttributes,
    ComponentProps,
    ForwardedRef,
    forwardRef,
    useContext,
} from 'react'

import {GroupContext} from 'pages/common/components/layout/Group'

import BaseButton from './BaseButton'
import ButtonSpinner from './ButtonSpinner'

export type {ButtonIntent, ButtonSize} from './BaseButton'

export type Props = ButtonHTMLAttributes<HTMLButtonElement> &
    Omit<ComponentProps<typeof BaseButton>, 'children'>

const Button = (
    {
        children,
        className,
        fillStyle,
        intent,
        isDisabled,
        isLoading,
        size,
        type = 'button',
        ...other
    }: Props,
    ref: ForwardedRef<HTMLButtonElement>
) => {
    const context = useContext(GroupContext)
    const safeIsDisabled = context?.isDisabled || isDisabled || isLoading

    return (
        <BaseButton
            className={className}
            fillStyle={fillStyle}
            intent={intent}
            isDisabled={safeIsDisabled}
            isLoading={isLoading}
            size={size}
        >
            {(elementAttributes) => (
                <button
                    {...other}
                    {...elementAttributes}
                    aria-disabled={safeIsDisabled || isLoading || false}
                    ref={ref}
                    type={type}
                    {...(safeIsDisabled
                        ? {
                              onClick: (event) => event.preventDefault(),
                              onSubmit: (event) => event.preventDefault(),
                          }
                        : {})}
                >
                    {isLoading && <ButtonSpinner />}
                    {typeof children === 'string' ? (
                        <span>{children}</span>
                    ) : (
                        children
                    )}
                </button>
            )}
        </BaseButton>
    )
}

export default forwardRef<HTMLButtonElement, Props>(Button)
