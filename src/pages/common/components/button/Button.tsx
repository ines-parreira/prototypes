import React, {
    ButtonHTMLAttributes,
    createContext,
    forwardRef,
    Ref,
    useContext,
} from 'react'
import classnames from 'classnames'
import {Spinner} from 'reactstrap'

import {
    AppendPosition,
    GroupContext,
} from 'pages/common/components/layout/Group'
import {InputGroupContext} from 'pages/common/forms/input/InputGroup'

import css from './Button.less'

type ButtonSize = 'medium' | 'small'

type Props = {
    appendPosition?: AppendPosition
    intent?: 'primary' | 'secondary' | 'text' | 'destructive'
    isDisabled?: boolean
    isLoading?: boolean
    size?: ButtonSize
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>

type ButtonContextState = {
    size: ButtonSize
}

export const ButtonContext = createContext<ButtonContextState>({
    size: 'medium',
})

const Button = forwardRef(function (
    {
        appendPosition,
        children,
        className,
        intent = 'primary',
        isDisabled,
        isLoading,
        size = 'medium',
        type = 'button',
        ...otherProps
    }: Props,
    ref: Ref<HTMLButtonElement> | null | undefined
) {
    const context = useContext(GroupContext)
    const isInsideInputGroup = !!useContext(InputGroupContext)

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
                        [css.isDisabled]:
                            context?.isDisabled || isDisabled || isLoading,
                        [css.isAuxiliaryButton]: isInsideInputGroup,
                    }
                )}
                disabled={context?.isDisabled || isDisabled || isLoading}
                type={type}
                ref={ref}
            >
                {isLoading && <Spinner className={css.spinner} />}
                {children}
            </button>
        </ButtonContext.Provider>
    )
})

export default Button
