import classNames from 'classnames'
import React, {ComponentProps, ReactNode, useRef} from 'react'

import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'

import HeaderTitle from 'pages/common/components/HeaderTitle'
import PageHeader from 'pages/common/components/PageHeader'
import {DrillDownModal} from 'pages/stats/DrillDownModal'

import css from './StatsPage.less'

type Props = {
    children: ReactNode
    titleExtra?: ReactNode
    headerCanduId?: string
} & ComponentProps<typeof HeaderTitle>

export default function StatsPage({
    children,
    titleExtra,
    headerCanduId,
    ...headerTitleProps
}: Props) {
    const ref = useRef(null)
    useInjectStyleToCandu(ref.current)

    return (
        <div className={classNames('full-width', css.wrapper)}>
            <div
                ref={ref}
                className={css.header}
                data-candu-id={headerCanduId || 'stat-header-container'}
            >
                <PageHeader
                    title={<HeaderTitle {...headerTitleProps} />}
                    className="mb-0"
                >
                    {titleExtra && (
                        <div className="d-flex flex-wrap float-right">
                            {titleExtra}
                        </div>
                    )}
                </PageHeader>
            </div>
            <div className={css.statsContainer}>{children}</div>
            <DrillDownModal />
        </div>
    )
}
