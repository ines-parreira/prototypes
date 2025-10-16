import { motion } from 'framer-motion'

import { LoadingSpinner } from '@gorgias/axiom'

import { PerformanceBadge } from 'AIJourney/components'
import { useJourneyContext } from 'AIJourney/providers'

import css from './Analytics.less'

export const Analytics = () => {
    const { currentJourney, isLoading } = useJourneyContext()

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
                    {`JourneyID: ${currentJourney?.id}`}
                </>
            )}
        </motion.div>
    )
}
