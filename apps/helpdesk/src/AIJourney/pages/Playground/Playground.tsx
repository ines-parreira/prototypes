import { motion } from 'framer-motion'

import { LoadingSpinner } from '@gorgias/axiom'

import { JourneyProvider, useJourneyContext } from 'AIJourney/providers'

import css from './Playground.less'

const PlaygroundComponent = () => {
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
                    <span>AI Journey Playground placeholder</span>
                    {`JourneyID: ${abandonedCartJourney?.id}`}
                </>
            )}
        </motion.div>
    )
}

export const Playground = () => (
    <JourneyProvider journeyType="cart_abandoned">
        <PlaygroundComponent />
    </JourneyProvider>
)
