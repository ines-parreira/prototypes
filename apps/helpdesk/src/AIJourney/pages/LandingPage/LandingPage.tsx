import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { useHistory, useParams } from 'react-router-dom'

import { Button, PerformanceBadge } from 'AIJourney/components'
import { STEPS_NAMES } from 'AIJourney/constants'
import { useJourneyContext } from 'AIJourney/providers'

import { AdditionalInfo } from './components/AdditionalInfo'
import { AnimatedText } from './components/AnimatedText'

import css from './LandingPage.less'

export const LandingPage = () => {
    const history = useHistory()
    const { shopName } = useParams<{ shopName: string }>()
    const [isVisible, setIsVisible] = useState(true)

    const { currentJourney, journeyType, isLoading } = useJourneyContext()

    const shouldAccessOnboarding: boolean =
        !currentJourney || currentJourney?.state === 'draft'

    useEffect(() => {
        if (!shouldAccessOnboarding) {
            history.push(`/app/ai-journey/${shopName}/performance`)
        }
    }, [shouldAccessOnboarding, history, shopName])

    const handleContinue = () => {
        setIsVisible(false)
        setTimeout(() => {
            history.push(
                `/app/ai-journey/${shopName}/${journeyType}/${STEPS_NAMES.SETUP}`,
            )
        }, 700)
    }

    return (
        <motion.div
            className={css.container}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.5 }}
        >
            {!isLoading && (
                <>
                    <div className={css.header}>
                        <PerformanceBadge />
                        <AnimatedText />
                    </div>
                    <div className={css.additionalInfo}>
                        <AdditionalInfo />
                        <div className={css.continueButton}>
                            <Button
                                label="Try out now"
                                onClick={handleContinue}
                            />
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    )
}
