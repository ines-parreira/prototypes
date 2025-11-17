import type { ReactNode } from 'react'
import React from 'react'

import classnames from 'classnames'

import css from './VisualBuilderNodeIconContent.less'

type Props = {
    icon?: string
    type?: 'info' | 'warning'
    children: ReactNode
}

const VisualBuilderNodeIconContent = ({
    icon,
    type = 'info',
    children,
}: Props) => {
    return (
        <div className={css.container}>
            {icon && (
                <i
                    className={classnames(
                        'material-icons',
                        css.icon,
                        css[type],
                    )}
                >
                    {icon}
                </i>
            )}
            {children}
        </div>
    )
}

export default VisualBuilderNodeIconContent
