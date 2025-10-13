import { motion } from 'framer-motion'

import { LoadingSpinner } from '@gorgias/axiom'

import { PerformanceBadge } from 'AIJourney/components'
import { JourneyProvider, useJourneyContext } from 'AIJourney/providers'

import css from './Analytics.less'

const AnalyticsComponent = () => {
    const { journey: abandonedCartJourney, isLoading } = useJourneyContext()

    if (isLoading) {
        return <LoadingSpinner />
    }

    return (
        <motion.div
            className={css.container}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {!isLoading && (
                <>
                    <PerformanceBadge />
                    {`JourneyID: ${abandonedCartJourney?.id}`}
                </>
            )}
        </motion.div>
    )
}

export const Analytics = () => (
    <JourneyProvider journeyType="cart_abandoned">
        <AnalyticsComponent />
    </JourneyProvider>
)
