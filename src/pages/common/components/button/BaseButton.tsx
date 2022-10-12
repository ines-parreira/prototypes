import classnames from 'classnames'
import React, {
    createContext,
    HTMLAttributes,
    ReactNode,
    useContext,
    useMemo,
} from 'react'

import {
    GroupContext,
    GroupPositionContext,
} from 'pages/common/components/layout/Group'
import {InputGroupContext} from 'pages/common/forms/input/InputGroup'

import css from './BaseButton.less'

type ButtonSize = 'medium' | 'small'

type Props = {
    children: (elementProps: HTMLAttributes<HTMLElement>) => ReactNode
    className?: string
    fillStyle?: 'fill' | 'ghost'
    intent?: 'primary' | 'secondary' | 'destructive'
    isDisabled?: boolean
    isLoading?: boolean
    size?: ButtonSize
}

type BaseButtonContextState = {
    size: ButtonSize
}

export const BaseButtonContext = createContext<BaseButtonContextState>({
    size: 'medium',
})

const BaseButton = ({
    children,
    className,
    fillStyle = 'fill',
    intent = 'primary',
    isDisabled,
    isLoading,
    size = 'medium',
}: Props) => {
    const context = useContext(GroupContext)
    const appendPosition = useContext(GroupPositionContext) || ''
    const isInsideInputGroup = !!useContext(InputGroupContext)
    const classNames = classnames(
        css.wrapper,
        className,
        css[fillStyle],
        css[intent],
        css[size],
        css[appendPosition],
        {
            [css.isDisabled]: context?.isDisabled || isDisabled || isLoading,
            [css.isAuxiliaryButton]: isInsideInputGroup,
        }
    )
    const contextValue = useMemo(() => ({size}), [size])

    return (
        <BaseButtonContext.Provider value={contextValue}>
            {children({
                className: classNames,
            })}
        </BaseButtonContext.Provider>
    )
}

export default BaseButton
