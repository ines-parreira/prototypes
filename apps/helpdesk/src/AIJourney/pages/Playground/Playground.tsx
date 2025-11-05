import { motion } from 'framer-motion'

import { LoadingSpinner } from '@gorgias/axiom'

import { useJourneyContext } from 'AIJourney/providers'

import css from './Playground.less'

export const Playground = () => {
    const { journeyData, isLoading } = useJourneyContext()

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
                    <span>AI Journey Playground placeholder</span>
                    {`JourneyID: ${journeyData?.id}`}
                </>
            )}
        </motion.div>
    )
}
