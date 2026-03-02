import type { ForwardedRef } from 'react'
import React, { forwardRef, useContext } from 'react'

import classnames from 'classnames'

import { LegacyButton as Button } from '@gorgias/axiom'
import type { LegacyButtonComponentProps as ButtonComponentProps } from '@gorgias/axiom'

import { GroupContext } from '../layout/Group'

import css from './IconButton.less'

type Props = {
    children?: string
    iconClassName?: string
} & Omit<ButtonComponentProps, 'children'>

const BaseIconButton = (
    {
        children,
        className,
        fillStyle,
        iconClassName = 'material-icons',
        size,
        ...others
    }: Props,
    ref: ForwardedRef<HTMLButtonElement>,
) => {
    const context = useContext(GroupContext)

    return (
        <Button
            className={classnames(
                className,
                css.wrapper,
                css[fillStyle || ''],
                css[size || ''],
            )}
            fillStyle={fillStyle}
            size={size}
            {...others}
            isDisabled={others.isDisabled || context?.isDisabled}
            ref={ref}
        >
            <i className={classnames(iconClassName, css.icon)}>{children}</i>
        </Button>
    )
}

/**
 * @deprecated This component is being phased out. Please use `IconButton` from `@gorgias/axiom` instead.
 * @date 2024-03-05
 * @type ui-kit-migration
 */
const IconButton = forwardRef<HTMLButtonElement, Props>(BaseIconButton)

export default IconButton
