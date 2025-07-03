import { useState } from 'react'

import {
    AnalyticsCard,
    DigestCard,
    JourneyPlaceholder,
    Selector,
} from 'AIJourney/components'

import css from './Performance.less'

const digestContent = (
    <>
        In the <b>last 30 days</b>, revenue is <b>up 14%</b>, driven primarily
        by your Abandoned Cart Journey converting at 12%. To{' '}
        <b>unlock an extra $5k</b>, your biggest opportunity is to{' '}
        <b>enable the Discount Code skill</b>.
    </>
)

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
        status: 'live',
    },
]

const FILTERS = ['All', 'Live', 'Coming soon']

export const Performance = () => {
    const [filter, setFilter] = useState('All')

    let filteredUserJourneys: userJourney[] = []
    switch (filter) {
        case 'All':
            filteredUserJourneys = userJourneys
            break
        case 'Live':
            filteredUserJourneys = userJourneys.filter(
                (j) => j.status === 'live',
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
            <DigestCard content={digestContent} metrics={digestMetrics} />
            <div className={css.header}>
                <div>
                    <span className={css.filterPrimaryText}>Journeys</span>
                    <span className={css.filterSecondaryText}>
                        {` (${filteredUpcomingJourneys.length + filteredUserJourneys.length})`}
                    </span>
                </div>
                <Selector
                    value={filter}
                    options={FILTERS}
                    onChange={setFilter}
                />
            </div>
            <div className={css.dashboardsContainer}>
                {filteredUserJourneys.map((journey, index) => (
                    <AnalyticsCard
                        analyticsData={analyticsData}
                        status={journey.status}
                        key={index}
                    />
                ))}
                {filteredUpcomingJourneys.map((journey, index) => (
                    <JourneyPlaceholder name={journey.name} key={index} />
                ))}
            </div>
        </div>
    )
}
