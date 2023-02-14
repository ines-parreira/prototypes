import React, {ComponentProps, ReactNode} from 'react'

import MetricCard from './MetricCard'
import MetricContent from './MetricContent'
import MetricTitle from './MetricTitle'

type Props = {
    children: ReactNode
    className?: string
    title: ReactNode
    tooltip?: ReactNode
} & Pick<ComponentProps<typeof MetricContent>, 'from'> &
    Pick<ComponentProps<typeof MetricTitle>, 'hint' | 'trendBadge'>

export default function Metric({
    children,
    className,
    from,
    hint,
    title,
    tooltip,
    trendBadge,
}: Props) {
    return (
        <MetricCard className={className}>
            <MetricTitle hint={hint} trendBadge={trendBadge}>
                {title}
            </MetricTitle>

            <MetricContent from={from}>{children}</MetricContent>

            {tooltip}
        </MetricCard>
    )
}
