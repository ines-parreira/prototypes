import Skeleton from 'react-loading-skeleton'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import type { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'

import { PerformanceBadge } from '../PerformanceBadge/PerformanceBadge'
import { EmptyContent } from './components/EmptyContent/EmptyContent'
import { Metrics } from './components/Metrics/Metrics'

import css from './DigestCard.less'

type DigestCardProps = {
    badgeContent: string
    content?: React.ReactNode
    metrics?: MetricProps[]
    isLoading: boolean
}

export const DigestCard = ({
    badgeContent,
    content,
    metrics,
    isLoading,
}: DigestCardProps) => {
    const isEmpty =
        metrics?.every(
            (metric) => metric.value === 0 && metric.prevValue === 0,
        ) ?? true

    if (isLoading) {
        return (
            <div className={css.digestCard}>
                <div className={css.digestHeader}>
                    <PerformanceBadge content={badgeContent} />

                    <div className={css.digestContent}>
                        <Skeleton />
                    </div>
                </div>
                <div className={css.digestMetrics}>
                    <LoadingSpinner style={{ height: '25px', width: '25px' }} />
                </div>
            </div>
        )
    }

    return (
        <div className={css.digestCard}>
            <div className={css.digestHeader}>
                <PerformanceBadge content={badgeContent} />
                {isLoading && (
                    <LoadingSpinner style={{ height: '25px', width: '25px' }} />
                )}
                {!isEmpty && !isLoading && content && (
                    <div className={css.digestContent}>{content}</div>
                )}
            </div>
            <div className={css.digestMetrics}>
                {isEmpty ? (
                    <EmptyContent />
                ) : (
                    metrics?.map((metric, index) => (
                        <Metrics key={index} {...metric} />
                    ))
                )}
            </div>
        </div>
    )
}
