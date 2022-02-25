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
}

const Badge = ({
    className,
    children,
    style,
    type = ColorType.Grey,
    ...props
}: Props) => {
    return (
        <div
            className={classnames(css.badge, className)}
            style={{
                backgroundColor: `var(--background-${type})`,
                ...(type === 'light' ? {color: `var(--text-${type})`} : {}),
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    )
}

export default Badge
