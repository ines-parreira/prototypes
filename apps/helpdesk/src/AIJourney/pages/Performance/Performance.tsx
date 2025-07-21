import { useMemo, useState } from 'react'

import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'

import {
    AnalyticsCard,
    DigestCard,
    JourneyPlaceholder,
    Selector,
} from 'AIJourney/components'
import { useIntegrations } from 'AIJourney/providers'
import { useJourneyConfiguration, useJourneys } from 'AIJourney/queries'

import css from './Performance.less'

const digestContent = (hasDiscount?: boolean) => (
    <>
        In the <b>last 30 days</b>, revenue is <b>up 14%</b>, driven primarily
        by your Abandoned Cart Journey converting at 12%.{' '}
        {!hasDiscount && (
            <>
                To <b>unlock an extra $5k</b>, your biggest opportunity is to
                <b>enable the Discount Code skill</b>.
            </>
        )}
    </>
)

const totalSent = '10'

const digestMetrics = [
    { label: 'Total Revenue', value: '$123,273', variation: '+14%' },
    { label: 'Total Orders', value: '7,289', variation: '+90%' },
    { label: 'Conversion Rate', value: '19%', variation: '0%' },
    { label: 'Global Sentiment', value: 'Positive', variation: '-30%' },
]

const analyticsData = digestMetrics.filter(
    (d) => d.label !== 'Global Sentiment',
)

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

    const { data: merchantAiJourneys } = useJourneys(currentIntegration?.id, {
        enabled: !!currentIntegration?.id,
    })

    const abandonedCartJourney = merchantAiJourneys?.find(
        (journey) => journey.type === 'cart_abandoned',
    )
    const { data: journeyParams } = useJourneyConfiguration(
        abandonedCartJourney?.id,
        {
            enabled: !!currentIntegration?.id && !!abandonedCartJourney?.id,
        },
    )

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

    return (
        <div className={css.container}>
            <DigestCard
                content={digestContent(isDiscountEnabled)}
                metrics={digestMetrics}
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className={css.header}
            >
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
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 1.2 }}
                className={css.dashboardsContainer}
            >
                {abandonedCartJourney &&
                    filteredUserJourneys.map(() => (
                        <AnalyticsCard
                            analyticsData={analyticsData}
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
            </motion.div>
        </div>
    )
}
