import { useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { motion } from 'framer-motion'
import { useHistory, useParams } from 'react-router-dom'

import { Button, PerformanceBadge } from 'AIJourney/components'
import { JOURNEY_TYPES, STEPS_NAMES } from 'AIJourney/constants'
import { useJourneyContext } from 'AIJourney/providers'

import { AnimatedText } from './components/AnimatedText'
import { JourneyOption } from './components/JourneyOption'

import css from './LandingPage.less'

export const LandingPage = () => {
    const history = useHistory()
    const { shopName } = useParams<{ shopName: string }>()

    const [isVisible, setIsVisible] = useState(true)
    const [selectedJourney, setSelectedJourney] = useState<string | null>(null)

    const isAiJourneyCampaignsEnabled = useFlag(
        FeatureFlagKey.AiJourneyCampaignsEnabled,
    )

    const isAiJourneyWinBackEnabled = useFlag(
        FeatureFlagKey.AiJourneyWinBackEnabled,
    )

    const isAiJourneyWelcomeFlowEnabled = useFlag(
        FeatureFlagKey.AiJourneyWelcomeFlowEnabled,
    )

    const isAiJourneyPostPurchaseEnabled = useFlag(
        FeatureFlagKey.AiJourneyPostPurchaseEnabled,
    )

    const availableJourneys = useMemo(
        () => [
            {
                name: 'Abandoned Cart',
                description:
                    'Stop leaving money on the table, let the Abandoned Cart Journey reclaim missed sales.',
                value: JOURNEY_TYPES.CART_ABANDONMENT,
            },
            {
                name: 'Browse Abandonment',
                description:
                    'Retain your shoppers, let the Browse Abandonment Journey re-engage visitors who left without converting.',
                value: JOURNEY_TYPES.SESSION_ABANDONMENT,
            },
            ...(isAiJourneyWinBackEnabled
                ? [
                      {
                          name: 'Customer Win-back',
                          description:
                              'Reconnect with inactive customers and revive their interest in your store using personalized AI-driven messages.',
                          value: JOURNEY_TYPES.WIN_BACK,
                      },
                  ]
                : []),
            ...(isAiJourneyWelcomeFlowEnabled
                ? [
                      {
                          name: 'Welcome customer',
                          description:
                              'Make a great first impression, let the Welcome Journey turn new subscribers into loyal customers.',
                          value: JOURNEY_TYPES.WELCOME,
                      },
                  ]
                : []),
            ...(isAiJourneyPostPurchaseEnabled
                ? [
                      {
                          name: 'Post-purchase Follow-up',
                          description:
                              'Enhance customer satisfaction by following up after purchase with timely, AI-personalized messages.',
                          value: JOURNEY_TYPES.POST_PURCHASE,
                      },
                  ]
                : []),
            ...(isAiJourneyCampaignsEnabled
                ? [
                      {
                          name: 'Campaigns',
                          description:
                              'Boost your sales with targeted SMS campaigns, crafted using AI to engage your audience effectively.',
                          value: JOURNEY_TYPES.CAMPAIGN,
                      },
                  ]
                : []),
        ],
        [
            isAiJourneyCampaignsEnabled,
            isAiJourneyWinBackEnabled,
            isAiJourneyWelcomeFlowEnabled,
            isAiJourneyPostPurchaseEnabled,
        ],
    )

    const { journeys, isLoading } = useJourneyContext()

    useEffect(() => {
        if (journeys?.length) {
            history.push(`/app/ai-journey/${shopName}/flows`)
        }
    }, [journeys, history, shopName])

    const handleContinue = () => {
        setIsVisible(false)
        setTimeout(() => {
            history.push(
                `/app/ai-journey/${shopName}/${selectedJourney}/${STEPS_NAMES.SETUP}`,
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
                        <PerformanceBadge content="AI Journey Performance" />
                        <AnimatedText />
                    </div>
                    <div className={css.additionalInfo}>
                        {availableJourneys.map((journey) => (
                            <JourneyOption
                                description={journey.description}
                                name={journey.name}
                                onChange={setSelectedJourney}
                                selected={selectedJourney === journey.value}
                                value={journey.value}
                                key={`journey-option-${journey.name}`}
                            />
                        ))}
                    </div>
                    <div className={css.continueButton}>
                        <Button
                            isDisabled={!selectedJourney}
                            label="Try out now"
                            onClick={handleContinue}
                        />
                    </div>
                </>
            )}
        </motion.div>
    )
}
