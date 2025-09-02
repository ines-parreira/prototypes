import { useMemo, useState } from 'react'

import { useParams } from 'react-router-dom'

import {
    AnalyticsCard,
    DigestCard,
    JourneyPlaceholder,
    Selector,
} from 'AIJourney/components'
import { useAbandonedCartKpis } from 'AIJourney/hooks/useAbandonedCartKpis/useAbandonedCartKpis'
import { useAIJourneyKpis } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import { useAIJourneyTotalMessages } from 'AIJourney/hooks/useAIJourneyTotalMessages/useAIJourneyTotalMessages'
import { useIntegrations } from 'AIJourney/providers'
import { useJourneyData, useJourneys } from 'AIJourney/queries'
import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import {
    formatMetricTrend,
    formatMetricValue,
} from 'domains/reporting/pages/common/utils'
import { useGetNamespacedShopNameForStore } from 'domains/reporting/pages/convert/hooks/useGetNamespacedShopNameForStore'

import css from './Performance.less'

const digestContent = (
    revenueVariation: string,
    conversionVariationContent: string,
    messagesSent: string,
    hasDiscount?: boolean,
    hasMaxFollowUpMessages?: boolean,
) => (
    <>
        Over the last 30 days, your Abandoned Cart Journey recovered{' '}
        <b>{revenueVariation}</b>, converting at{' '}
        <b>{conversionVariationContent}</b>, with{' '}
        <b>
            {messagesSent} {messagesSent === '1' ? 'message' : 'messages'} sent
        </b>
        .{' '}
        {(!hasDiscount || !hasMaxFollowUpMessages) && (
            <>
                To drive more revenue, consider enabling the{' '}
                {!hasDiscount && <>Discount Code skill</>}{' '}
                {!hasDiscount && !hasMaxFollowUpMessages && <>or</>}{' '}
                {!hasMaxFollowUpMessages && <>Follow-up messages</>}.
            </>
        )}
    </>
)

type UserJourney = {
    name: string
    status: string
}

type UpcomingJourney = {
    name: string
}

const upcomingJourneys: UpcomingJourney[] = [
    {
        name: 'Welcome New Subscribers',
    },
    {
        name: 'Post-Purchase Follow-up',
    },
    {
        name: 'Customer Winback',
    },
]

const userJourneys: UserJourney[] = [
    {
        name: 'Abandoned Cart',
        status: 'Active',
    },
]

const FILTERS = ['All', 'Active', 'Coming soon']

export const Performance = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const [filter, setFilter] = useState('All')

    const { currentIntegration } = useIntegrations(shopName)
    const namespacedShopName = useGetNamespacedShopNameForStore(
        currentIntegration?.id ? [currentIntegration.id] : [],
    )
    const integrationId = useMemo(() => {
        return currentIntegration?.id || 0
    }, [currentIntegration])

    const { data: merchantAiJourneys, isLoading: isLoadingJourneys } =
        useJourneys(currentIntegration?.id, {
            enabled: !!currentIntegration?.id,
        })

    const abandonedCartJourney = merchantAiJourneys?.find(
        (journey) => journey.type === 'cart_abandoned',
    )
    const { data: journeyData, isLoading: isLoadingJourneyParams } =
        useJourneyData(abandonedCartJourney?.id, {
            enabled: !!integrationId && !!abandonedCartJourney?.id,
        })

    const { configuration: journeyParams } = journeyData || {}

    const totalMessagesSent = useAIJourneyTotalMessages(
        abandonedCartJourney?.id,
    )
    const formattedTotalMessagesSent =
        totalMessagesSent?.value > 1000
            ? `${(totalMessagesSent.value / 1000).toFixed(1)}k`
            : totalMessagesSent.value.toString()

    const {
        offer_discount: isDiscountEnabled,
        max_follow_up_messages: maxFollowUpMessages,
    } = journeyParams || {}

    let filteredUserJourneys: UserJourney[]
    switch (filter) {
        case 'All':
            filteredUserJourneys = userJourneys
            break
        case 'Active':
            filteredUserJourneys = userJourneys.filter(
                (j) => j.status === 'Active',
            )
            break
        default:
            filteredUserJourneys = []
    }

    let filteredUpcomingJourneys: UpcomingJourney[]
    switch (filter) {
        case 'All':
        case 'Coming soon':
            filteredUpcomingJourneys = upcomingJourneys
            break
        default:
            filteredUpcomingJourneys = []
    }

    const { metrics } = useAIJourneyKpis(
        integrationId.toString(),
        namespacedShopName,
    )

    const { metrics: journeyMetrics, period } = useAbandonedCartKpis({
        integrationId: integrationId.toString(),
        journeyId: abandonedCartJourney?.id,
        shopName,
    })

    const metricsContent = useMemo(() => {
        const [gmvInfluenced] = metrics
        const [, , conversionRate] = metrics

        const {
            formattedTrend: gmvInfluencedFormattedTrend,
            sign: gmvInfluencedSign = 0,
        } =
            gmvInfluenced.value != null && gmvInfluenced.prevValue != null
                ? formatMetricTrend(
                      gmvInfluenced.value,
                      gmvInfluenced.prevValue,
                      'percent',
                  )
                : { formattedTrend: null }

        const {
            formattedTrend: conversionRateFormattedTrend,
            sign: conversionRateSign = 0,
        } =
            conversionRate.value != null && conversionRate.prevValue != null
                ? formatMetricTrend(
                      conversionRate.value,
                      conversionRate.prevValue,
                      'percent',
                  )
                : { formattedTrend: null }

        const gmvInfluencedFormattedValue = formatMetricValue(
            gmvInfluenced.value,
            gmvInfluenced.metricFormat,
            undefined,
            gmvInfluenced.currency,
        )

        const conversionRateFormattedValue = formatMetricValue(
            conversionRate.value,
            conversionRate.metricFormat,
            undefined,
            conversionRate.currency,
        )

        const gmvInfluencedVariationDescription =
            gmvInfluencedSign === -1 ? '-' : '+'
        const conversionRateVariationDescription =
            conversionRateSign === -1 ? '-' : '+'

        return {
            revenueVariationContent: `${gmvInfluencedFormattedValue}${gmvInfluencedFormattedTrend && parseFloat(gmvInfluencedFormattedTrend) !== 0 ? ` ${gmvInfluencedVariationDescription}${gmvInfluencedFormattedTrend}` : ''}`,
            conversionVariationContent: `${conversionRateFormattedValue}${conversionRateFormattedTrend && parseFloat(conversionRateFormattedTrend) !== 0 ? ` ${conversionRateVariationDescription}${conversionRateFormattedTrend}` : ''}`,
        }
    }, [metrics])

    return (
        <div className={css.container}>
            <DigestCard
                content={digestContent(
                    metricsContent.revenueVariationContent,
                    metricsContent.conversionVariationContent,
                    formattedTotalMessagesSent,
                    isDiscountEnabled,
                    !!maxFollowUpMessages,
                )}
                metrics={metrics}
                isLoading={isLoadingJourneyParams || isLoadingJourneys}
            />
            <div className={css.header}>
                <div>
                    <span className={css.filterPrimaryText}>Journeys</span>
                    <span className={css.filterSecondaryText}>
                        {` (${filteredUpcomingJourneys.length + filteredUserJourneys.length})`}
                    </span>
                </div>
                <div style={{ maxWidth: '600px' }}>
                    <Selector
                        value={filter}
                        options={FILTERS}
                        onChange={setFilter}
                    />
                </div>
            </div>
            <div className={css.dashboardsContainer}>
                {abandonedCartJourney &&
                    filteredUserJourneys.map(() => (
                        <AnalyticsCard
                            period={period}
                            analyticsData={journeyMetrics}
                            journeyData={journeyData}
                            integrationId={integrationId}
                            abandonedCartJourney={abandonedCartJourney}
                            totalSent={formattedTotalMessagesSent}
                            key={abandonedCartJourney?.id}
                        />
                    ))}
                {filteredUpcomingJourneys.map((journey, index) => (
                    <JourneyPlaceholder name={journey.name} key={index} />
                ))}
            </div>
            <DrillDownModal />
        </div>
    )
}
