import type { ReactNode } from 'react'
import type React from 'react'
import { forwardRef } from 'react'

import classnames from 'classnames'

import css from 'domains/reporting/pages/common/layout/DashboardGrid.less'

type Props = {
    children: ReactNode
    className?: string
}

function DashboardGrid(
    { children, className }: Props,
    ref: React.Ref<HTMLDivElement>,
) {
    return (
        <div ref={ref} className={classnames(css.wrapper, className)}>
            {children}
        </div>
    )
}

const DefaultExportDashboardGrid = forwardRef<HTMLDivElement, Props>(
    DashboardGrid,
)

export { DefaultExportDashboardGrid }
