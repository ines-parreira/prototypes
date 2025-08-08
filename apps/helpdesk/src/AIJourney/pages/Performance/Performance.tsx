import { useMemo, useState } from 'react'

import { useParams } from 'react-router-dom'

import {
    AnalyticsCard,
    DigestCard,
    JourneyPlaceholder,
    Selector,
} from 'AIJourney/components'
import { useAIJourneyKpis } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import { useIntegrations } from 'AIJourney/providers'
import { useJourneyConfiguration, useJourneys } from 'AIJourney/queries'

import css from './Performance.less'

const digestContent = (hasDiscount?: boolean) => (
    <>
        In the <b>last 30 days</b>, revenue is <b>up 14%</b>, driven primarily
        by your Abandoned Cart Journey converting at 12%.
        {!hasDiscount && (
            <>
                To <b>unlock an extra $5k</b>, your biggest opportunity is to{' '}
                <b>enable the Discount Code skill</b>.
            </>
        )}
    </>
)

const totalSent = '10'

const digestMetrics = [
    { label: 'Total Revenue', value: '$123,273' },
    { label: 'Total Orders', value: '7,289' },
    { label: 'Conversion Rate', value: '19%' },
]

type userJourney = {
    name: string
    status: string
}

type upcomingJourney = {
    name: string
}

const upcomingJourneys: upcomingJourney[] = [
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

const userJourneys: userJourney[] = [
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

    const integrationId = useMemo(() => {
        return currentIntegration?.id
    }, [currentIntegration])

    const { data: merchantAiJourneys, isLoading: isLoadingJourneys } =
        useJourneys(currentIntegration?.id, {
            enabled: !!currentIntegration?.id,
        })

    const abandonedCartJourney = merchantAiJourneys?.find(
        (journey) => journey.type === 'cart_abandoned',
    )
    const { data: journeyParams, isLoading: isLoadingJourneyParams } =
        useJourneyConfiguration(abandonedCartJourney?.id, {
            enabled: !!currentIntegration?.id && !!abandonedCartJourney?.id,
        })

    const { offer_discount: isDiscountEnabled } = journeyParams || {}

    let filteredUserJourneys: userJourney[] = []
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

    let filteredUpcomingJourneys: upcomingJourney[] = []
    switch (filter) {
        case 'All':
        case 'Coming soon':
            filteredUpcomingJourneys = upcomingJourneys
            break
        default:
            filteredUpcomingJourneys = []
    }

    const metrics = useAIJourneyKpis()

    return (
        <div className={css.container}>
            <DigestCard
                content={digestContent(isDiscountEnabled)}
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
                            analyticsData={digestMetrics}
                            journeyConfigurations={journeyParams}
                            integrationId={integrationId}
                            currentIntegration={currentIntegration}
                            abandonedCartJourney={abandonedCartJourney}
                            totalSent={totalSent}
                            key={abandonedCartJourney?.id}
                        />
                    ))}
                {filteredUpcomingJourneys.map((journey, index) => (
                    <JourneyPlaceholder name={journey.name} key={index} />
                ))}
            </div>
        </div>
    )
}
