import classnames from 'classnames'
import React, {ReactNode} from 'react'

import DashboardGrid from './DashboardGrid'
import css from './DashboardSection.less'

type Props = {
    className?: string
    children: ReactNode
    title: ReactNode
    titleExtra?: ReactNode
}

export default function DashboardSection({
    className,
    children,
    title,
    titleExtra,
}: Props) {
    return (
        <div className={classnames(css.wrapper, className)}>
            <div className={css.title}>
                <div
                    className={classnames(
                        css.titleText,
                        'heading-page-semibold'
                    )}
                >
                    {title}
                </div>

                {titleExtra}
            </div>

            <DashboardGrid>{children}</DashboardGrid>
        </div>
    )
}
