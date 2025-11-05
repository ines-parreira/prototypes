import { useEffect, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { motion } from 'framer-motion'
import { useHistory, useParams } from 'react-router-dom'

import { Button, PerformanceBadge } from 'AIJourney/components'
import { JOURNEY_TYPES, STEPS_NAMES } from 'AIJourney/constants'
import { useJourneyContext } from 'AIJourney/providers'
import { useFlag } from 'core/flags'

import { AdditionalInfo } from './components/AdditionalInfo'
import { AnimatedText } from './components/AnimatedText'
import { JourneyOption } from './components/JourneyOption'

import css from './LandingPage.less'

export const LandingPage = () => {
    const history = useHistory()
    const { shopName } = useParams<{ shopName: string }>()

    const isSessionAbandonedEnabled = useFlag(
        FeatureFlagKey.AiJourneySessionAbandonedEnabled,
    )

    const [isVisible, setIsVisible] = useState(true)
    const [selectedJourney, setSelectedJourney] = useState<string | null>(null)

    const availableJourneys = [
        {
            name: 'Abandoned Cart',
            description:
                'Stop leaving money on the table, let the Abandoned Cart Journey reclaim missed sales.',
            value: JOURNEY_TYPES.CART_ABANDONMENT,
        },
        {
            name: 'Abandoned Browse',
            description:
                'Retain your shoppers, let the Abandoned Browse Journey re-engage visitors who left without converting.',
            value: JOURNEY_TYPES.SESSION_ABANDONMENT,
        },
    ]

    const { journeyData, isLoading } = useJourneyContext()

    const shouldAccessOnboarding: boolean =
        !journeyData || journeyData?.state === 'draft'

    useEffect(() => {
        if (!shouldAccessOnboarding) {
            history.push(`/app/ai-journey/${shopName}/performance`)
        }
    }, [shouldAccessOnboarding, history, shopName])

    const handleContinue = () => {
        const journeyTypeToRedirect = isSessionAbandonedEnabled
            ? selectedJourney
            : JOURNEY_TYPES.CART_ABANDONMENT

        setIsVisible(false)
        setTimeout(() => {
            history.push(
                `/app/ai-journey/${shopName}/${journeyTypeToRedirect}/${STEPS_NAMES.SETUP}`,
            )
        }, 700)
    }

    const shouldDisableButton = isSessionAbandonedEnabled
        ? !selectedJourney
        : false

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
                        {isSessionAbandonedEnabled ? (
                            availableJourneys.map((journey) => (
                                <JourneyOption
                                    description={journey.description}
                                    name={journey.name}
                                    onChange={setSelectedJourney}
                                    selected={selectedJourney === journey.value}
                                    value={journey.value}
                                    key={`journey-option-${journey.name}`}
                                />
                            ))
                        ) : (
                            <AdditionalInfo />
                        )}
                    </div>
                    <div className={css.continueButton}>
                        <Button
                            isDisabled={shouldDisableButton}
                            label="Try out now"
                            onClick={handleContinue}
                        />
                    </div>
                </>
            )}
        </motion.div>
    )
}
