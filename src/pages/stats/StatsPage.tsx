import classNames from 'classnames'
import React, {ComponentProps, ReactNode, useRef} from 'react'

import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'

import HeaderTitle from 'pages/common/components/HeaderTitle'
import PageHeader from 'pages/common/components/PageHeader'
import {DrillDownModal} from 'pages/stats/DrillDownModal'

import css from './StatsPage.less'

export const StatsPageWrapper = ({children}: {children: React.ReactNode}) => (
    <div className={classNames('full-width', css.wrapper)}>
        {children}
        <DrillDownModal />
    </div>
)

export const StatsPageHeader = ({
    left,
    right,
    canduId = 'stat-header-container',
}: {
    left: React.ReactNode
    right?: React.ReactNode
    canduId?: string
}) => {
    const ref = useRef(null)
    useInjectStyleToCandu(ref.current)

    return (
        <div ref={ref} className={css.header} data-candu-id={canduId}>
            <PageHeader title={left} className="mb-0">
                {right && (
                    <div className="d-flex flex-wrap float-right">{right}</div>
                )}
            </PageHeader>
        </div>
    )
}

export const StatsPageContent = ({children}: {children: React.ReactNode}) => (
    <div className={css.statsContainer}>{children}</div>
)

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
    return (
        <StatsPageWrapper>
            <StatsPageHeader
                left={<HeaderTitle {...headerTitleProps} />}
                right={titleExtra}
                canduId={headerCanduId}
            />
            <StatsPageContent>{children}</StatsPageContent>
        </StatsPageWrapper>
    )
}
