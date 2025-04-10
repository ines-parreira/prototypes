import React, { ReactNode } from 'react'

import classnames from 'classnames'

import DashboardGrid from './DashboardGrid'

import css from './DashboardSection.less'

type Props = {
    className?: string
    children: ReactNode
    title?: ReactNode
    titleExtra?: ReactNode
}

export const DashboardSectionWrapper = ({ children, className }: Props) => {
    return <div className={classnames(css.wrapper, className)}>{children}</div>
}

export default function DashboardSection({
    className,
    children,
    title,
    titleExtra,
}: Props) {
    return (
        <DashboardSectionWrapper className={className}>
            {title && (
                <div className={css.title}>
                    <div
                        className={classnames(
                            css.titleText,
                            'heading-page-semibold',
                        )}
                    >
                        {title}
                    </div>

                    {titleExtra}
                </div>
            )}

            <DashboardGrid>{children}</DashboardGrid>
        </DashboardSectionWrapper>
    )
}
