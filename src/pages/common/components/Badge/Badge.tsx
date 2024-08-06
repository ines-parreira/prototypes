import React, {
    CSSProperties,
    ForwardedRef,
    HTMLAttributes,
    ReactNode,
    forwardRef,
} from 'react'
import classnames from 'classnames'

import css from './Badge.less'

type Props = {
    children: ReactNode
    style?: CSSProperties
    type?: ColorType
    upperCase?: boolean
} & HTMLAttributes<HTMLDivElement>

export enum ColorType {
    Classic = 'classic',
    Modern = 'modern',
    Error = 'error',
    Success = 'success',
    Warning = 'warning',
    Grey = 'grey',
    DarkGrey = 'dark-grey',
    Indigo = 'indigo',
    Purple = 'purple',
    Dark = 'dark',
    Blue = 'blue',
    Teal = 'teal',
    Light = 'light',
    LightGrey = 'light-grey',
    LightDark = 'light-dark',
    LightSuccess = 'light-success',
    LightWarning = 'light-warning',
    LightError = 'light-error',
    LightPurple = 'light-purple',
    LightYellow = 'light-yellow',
    Magenta = 'magenta',
}

const Badge = (
    {className, children, style, type, upperCase = true, ...props}: Props,
    ref: ForwardedRef<HTMLDivElement>
) => {
    return (
        <div
            className={classnames(css.badge, className, {
                [css.upperCase]: upperCase,
            })}
            style={{
                ...(!!type
                    ? {
                          backgroundColor: `var(--background-${type})`,
                          color: `var(--text-${type}, var(--neutral-grey-0))`,
                      }
                    : {}),
                ...style,
            }}
            ref={ref}
            {...props}
        >
            {children}
        </div>
    )
}

export default forwardRef<HTMLDivElement, Props>(Badge)
