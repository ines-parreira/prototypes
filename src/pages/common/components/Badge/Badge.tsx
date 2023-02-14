import React, {CSSProperties, HTMLAttributes, ReactNode} from 'react'
import classnames from 'classnames'

import css from './Badge.less'

type Props = {
    children: ReactNode
    style?: CSSProperties
    type?: ColorType
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
    Light = 'light',
    Blue = 'blue',
    LightSuccess = 'light-success',
    LightError = 'light-error',
}

const Badge = ({className, children, style, type, ...props}: Props) => {
    return (
        <div
            className={classnames(css.badge, className)}
            style={{
                ...(!!type
                    ? {backgroundColor: `var(--background-${type})`}
                    : {}),
                ...(type === 'light' ||
                type === 'blue' ||
                type === 'light-success' ||
                type === 'light-error'
                    ? {color: `var(--text-${type})`}
                    : {}),
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    )
}

export default Badge
