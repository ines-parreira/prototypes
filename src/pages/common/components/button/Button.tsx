import React, {
    ButtonHTMLAttributes,
    ComponentProps,
    forwardRef,
    useContext,
} from 'react'

import {GroupContext} from 'pages/common/components/layout/Group'

import BaseButton from './BaseButton'
import ButtonSpinner from './ButtonSpinner'

export {ButtonIntent, ButtonSize} from './BaseButton'

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
    Omit<ComponentProps<typeof BaseButton>, 'children'>

const Button = forwardRef<HTMLButtonElement, Props>(function (
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
    },
    ref
) {
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
                    disabled={safeIsDisabled || isLoading}
                    ref={ref}
                    type={type}
                >
                    {isLoading && <ButtonSpinner />}
                    {children}
                </button>
            )}
        </BaseButton>
    )
})

export default Button
