import type { ComponentProps, ReactNode } from 'react'
import type React from 'react'
import { useRef } from 'react'

import classNames from 'classnames'

import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import css from 'domains/reporting/pages/common/layout/StatsPage.less'
import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import HeaderTitle from 'pages/common/components/HeaderTitle'
import PageHeader from 'pages/common/components/PageHeader'

export enum StatsPageBackgroundColor {
    Grey = 'grey',
}

export const StatsPageWrapper = ({
    children,
}: {
    children: React.ReactNode
}) => (
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

export const StatsPageContent = ({
    children,
    backgroundColor,
}: {
    children: React.ReactNode
    backgroundColor?: StatsPageBackgroundColor
}) => (
    <div
        className={classNames(
            css.statsContainer,
            backgroundColor && css[backgroundColor],
        )}
    >
        {children}
    </div>
)

type Props = {
    children: ReactNode
    backgroundColor?: StatsPageBackgroundColor
    titleExtra?: ReactNode
    headerCanduId?: string
    banner?: ReactNode
} & ComponentProps<typeof HeaderTitle>

/**
 * @deprecated This component is deprecated. Use `AnalyticsPage` instead for new reports.
 *
 * `AnalyticsPage` provides:
 * - Modern design using Axiom components
 * - Built-in tab support
 * - Sticky header with filters
 * - Better flexbox layout
 * - Consistent styling across analytics pages
 *
 * See `apps/helpdesk/src/domains/reporting/pages/common/layout/AnalyticsPage.tsx`
 * Example usage: `apps/helpdesk/src/pages/aiAgent/analyticsAiAgent/components/AnalyticsAiAgentLayout.tsx`
 */
export default function StatsPage({
    children,
    backgroundColor,
    titleExtra,
    headerCanduId,
    banner,
    ...headerTitleProps
}: Props) {
    return (
        <StatsPageWrapper>
            {banner}
            <StatsPageHeader
                left={<HeaderTitle {...headerTitleProps} />}
                right={titleExtra}
                canduId={headerCanduId}
            />
            <StatsPageContent backgroundColor={backgroundColor}>
                {children}
            </StatsPageContent>
        </StatsPageWrapper>
    )
}
