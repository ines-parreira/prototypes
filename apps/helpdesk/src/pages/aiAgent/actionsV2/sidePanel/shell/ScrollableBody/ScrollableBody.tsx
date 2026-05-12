import type { ReactNode } from 'react'

import classNames from 'classnames'

import css from './ScrollableBody.less'

type Props = {
    children: ReactNode
    padding?: 'md' | 'none'
    className?: string
}

export const ScrollableBody = ({
    children,
    padding = 'md',
    className,
}: Props) => {
    return (
        <div
            className={classNames(
                css.body,
                padding === 'md' && css.paddingMd,
                className,
            )}
        >
            {children}
        </div>
    )
}
