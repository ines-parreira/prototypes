import React, {
    ButtonHTMLAttributes,
    createContext,
    forwardRef,
    Ref,
} from 'react'
import classnames from 'classnames'
import {Spinner} from 'reactstrap'

import {AppendPosition} from 'pages/common/components/layout/Group'

import css from './Button.less'

export enum ButtonIntent {
    Primary = 'primary',
    Secondary = 'secondary',
    Text = 'text',
    Creation = 'creation',
    Destructive = 'destructive',
}

export enum ButtonSize {
    Medium = 'medium',
    Small = 'small',
}

type Props = {
    appendPosition?: AppendPosition
    intent?: ButtonIntent
    isDisabled?: boolean
    isLoading?: boolean
    size?: ButtonSize
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>

type ButtonContextState = {
    size: ButtonSize
}

export const ButtonContext = createContext<ButtonContextState>({
    size: ButtonSize.Medium,
})

const Button = forwardRef(function (
    {
        appendPosition,
        children,
        className,
        intent = ButtonIntent.Primary,
        isDisabled,
        isLoading,
        size = ButtonSize.Medium,
        ...otherProps
    }: Props,
    ref: Ref<HTMLButtonElement> | null | undefined
) {
    return (
        <ButtonContext.Provider value={{size}}>
            <button
                {...otherProps}
                className={classnames(
                    css.wrapper,
                    className,
                    css[intent],
                    css[size],
                    css[appendPosition || ''],
                    {
                        [css.isDisabled]: isDisabled || isLoading,
                    }
                )}
                disabled={isDisabled || isLoading}
                ref={ref}
            >
                {isLoading && <Spinner className={css.spinner} />}
                {children}
            </button>
        </ButtonContext.Provider>
    )
})

export default Button
