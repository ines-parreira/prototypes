import classnames from 'classnames'
import React, {ReactNode} from 'react'

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
                        css[type]
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
