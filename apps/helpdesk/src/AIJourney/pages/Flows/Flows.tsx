import { useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import type { JourneyApiDTO } from '@gorgias/convert-client'
import { JourneyTypeEnum } from '@gorgias/convert-client'

import {
    AnalyticsCard,
    DigestCard,
    JourneyPlaceholder,
    Selector,
} from 'AIJourney/components'
import { useAIJourneyKpis } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import { useAIJourneyTotalConversations } from 'AIJourney/hooks/useAIJourneyTotalConversations/useAIJourneyTotalConversations'
import { useFilters } from 'AIJourney/hooks/useFilters/useFilters'
import { useJourneyContext } from 'AIJourney/providers'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import {
    formatMetricTrend,
    formatMetricValue,
} from 'domains/reporting/pages/common/utils'
import { useGetNamespacedShopNameForStore } from 'domains/reporting/pages/convert/hooks/useGetNamespacedShopNameForStore'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

import css from './Flows.less'

const digestContent = (
    revenueVariation: string,
    conversionVariationContent: string,
    conversations: string,
) => (
    <>
        Over the last 28 days, your journeys recovered <b>{revenueVariation}</b>
        , converting at <b>{conversionVariationContent}</b>, with{' '}
        <b>
            {conversations}{' '}
            {conversations === '1' ? 'total recipient' : 'total recipients'}
        </b>
        .{' '}
    </>
)

type UpcomingJourney = {
    name: string
}

type AvailableJourney = {
    name: string
    available?: boolean
    type: JourneyTypeEnum
}

const defaultUpcomingJourneys: UpcomingJourney[] = []

const defaultAvailableJourneys: AvailableJourney[] = [
    {
        name: 'Cart Abandoned',
        available: true,
        type: JourneyTypeEnum.CartAbandoned,
    },
    {
        name: 'Browse Abandoned',
        available: true,
        type: JourneyTypeEnum.SessionAbandoned,
    },
    {
        name: 'Customer Win-back',
        available: true,
        type: JourneyTypeEnum.WinBack,
    },
    {
        name: 'Welcome New Subscribers',
        available: true,
        type: JourneyTypeEnum.Welcome,
    },
    {
        name: 'Post-purchase Follow-up',
        available: true,
        type: JourneyTypeEnum.PostPurchase,
    },
]

const FILTERS = ['All', 'Active', 'Coming soon']

export const Flows = () => {
    const [filter, setFilter] = useState('All')

    const isAiJourneyWinBackEnabled = useFlag(
        FeatureFlagKey.AiJourneyWinBackEnabled,
    )

    const isAiJourneyWelcomeFlowEnabled = useFlag(
        FeatureFlagKey.AiJourneyWelcomeFlowEnabled,
    )

    const isAiJourneyPostPurchaseEnabled = useFlag(
        FeatureFlagKey.AiJourneyPostPurchaseEnabled,
    )

    const { journeys, currentIntegration, isLoadingJourneys } =
        useJourneyContext()

    const { availableJourneys, upcomingJourneys } = useMemo(() => {
        const disabledJourneyTypes = [
            !isAiJourneyWinBackEnabled && JourneyTypeEnum.WinBack,
            !isAiJourneyWelcomeFlowEnabled && JourneyTypeEnum.Welcome,
            !isAiJourneyPostPurchaseEnabled && JourneyTypeEnum.PostPurchase,
        ].filter(Boolean) as JourneyTypeEnum[]

        const availableJourneys = defaultAvailableJourneys.filter(
            (journey) => !disabledJourneyTypes.includes(journey.type),
        )

        const upcomingJourneys = [
            ...defaultUpcomingJourneys,
            ...defaultAvailableJourneys
                .filter((journey) =>
                    disabledJourneyTypes.includes(journey.type),
                )
                .map((journey) => ({ name: journey.name })),
        ]

        return { availableJourneys, upcomingJourneys }
    }, [
        isAiJourneyWinBackEnabled,
        isAiJourneyWelcomeFlowEnabled,
        isAiJourneyPostPurchaseEnabled,
    ])

    const inactiveJourneys = availableJourneys.filter((availableJourney) => {
        return !journeys?.some(
            (journey) => journey.type === availableJourney.type,
        )
    })

    const namespacedShopName = useGetNamespacedShopNameForStore(
        currentIntegration?.id ? [currentIntegration.id] : [],
    )
    const integrationId = useMemo(() => {
        return currentIntegration?.id || 0
    }, [currentIntegration])

    const filters = useFilters()
    const granularity = ReportingGranularity.Week
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)

    const totalConversations = useAIJourneyTotalConversations(
        integrationId.toString(),
        userTimezone,
        filters,
        granularity,
    )
    const formattedTotalConversationsSent =
        totalConversations?.value > 1000
            ? `${(totalConversations.value / 1000).toFixed(1)}k`
            : totalConversations.value.toString()

    let filteredUserJourneys: JourneyApiDTO[] | undefined
    switch (filter) {
        case 'All':
            filteredUserJourneys = journeys
            break
        case 'Active':
            filteredUserJourneys = journeys?.filter((j) => j.state === 'active')
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

    let filteredInactiveJourneys: AvailableJourney[]
    switch (filter) {
        case 'All':
            filteredInactiveJourneys = inactiveJourneys
            break
        case 'Coming soon':
        default:
            filteredInactiveJourneys = []
            break
    }

    const { metrics } = useAIJourneyKpis({
        integrationId: integrationId.toString(),
        shopName: namespacedShopName,
        filters,
        journeyIds: journeys?.map((journey) => journey.id),
    })
    const isLoadingMetrics = metrics?.some((metric) => metric.isLoading)

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
            revenueVariationContent: `${gmvInfluencedFormattedValue}${gmvInfluencedFormattedTrend && parseFloat(gmvInfluencedFormattedTrend) !== 0 ? ` (${gmvInfluencedVariationDescription}${gmvInfluencedFormattedTrend})` : ''}`,
            conversionVariationContent: `${conversionRateFormattedValue}${conversionRateFormattedTrend && parseFloat(conversionRateFormattedTrend) !== 0 ? ` (${conversionRateVariationDescription}${conversionRateFormattedTrend})` : ''}`,
        }
    }, [metrics])

    return (
        <div className={css.container}>
            <DigestCard
                badgeContent="AI Journey Flows"
                content={digestContent(
                    metricsContent.revenueVariationContent,
                    metricsContent.conversionVariationContent,
                    formattedTotalConversationsSent,
                )}
                metrics={metrics}
                isLoading={isLoadingJourneys || isLoadingMetrics}
            />
            <div className={css.header}>
                <div>
                    <span className={css.filterPrimaryText}>Journeys</span>
                    <span className={css.filterSecondaryText}>
                        {` (${filteredUpcomingJourneys.length + (filteredUserJourneys?.length ?? 0)})`}
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
                {filteredUserJourneys?.map((journey) => (
                    <AnalyticsCard
                        period={{
                            start: filters.period.start_datetime,
                            end: filters.period.end_datetime,
                        }}
                        integrationId={integrationId}
                        journey={journey}
                        key={journey.id}
                    />
                ))}
                {filteredInactiveJourneys.map(
                    ({ available, name, type }, index) => (
                        <JourneyPlaceholder
                            name={name}
                            key={index}
                            available={available}
                            type={type}
                        />
                    ),
                )}
                {filteredUpcomingJourneys.map((journey, index) => (
                    <JourneyPlaceholder name={journey.name} key={index} />
                ))}
            </div>
            <DrillDownModal />
        </div>
    )
}
