import { useEffect, useMemo, useState } from 'react'

import { motion } from 'framer-motion'
import { useHistory, useParams } from 'react-router-dom'

import { Button, PerformanceBadge } from 'AIJourney/components'
import { useIntegrations } from 'AIJourney/providers'
import { useJourneys } from 'AIJourney/queries'

import { AdditionalInfo } from './components/AdditionalInfo'
import { AnimatedText } from './components/AnimatedText'

import css from './LandingPage.less'

export const LandingPage = () => {
    const history = useHistory()
    const { shopName } = useParams<{ shopName: string }>()
    const [isVisible, setIsVisible] = useState(true)

    const handleContinue = () => {
        setIsVisible(false)
        setTimeout(() => {
            history.push(`/app/ai-journey/${shopName}/conversation-setup`)
        }, 700)
    }

    const { integrations, isLoading: isLoadingIntegrations } = useIntegrations()

    const currentIntegration = useMemo(() => {
        if (isLoadingIntegrations) return undefined
        return integrations.find((i) => i.name === shopName)
    }, [integrations, shopName, isLoadingIntegrations])

    const {
        data: merchantAiJourneys,
        isError,
        isLoading: isLoadingJourneys,
    } = useJourneys(currentIntegration?.id, {
        enabled: !!currentIntegration || !isLoadingIntegrations,
    })

    const abandonedCartJourney = merchantAiJourneys?.find(
        (journey) => journey.type === 'cart_abandoned',
    )
    const shouldAccessOnboarding: boolean =
        !abandonedCartJourney || abandonedCartJourney?.state === 'draft'

    useEffect(() => {
        if (!shouldAccessOnboarding) {
            history.push(`/app/ai-journey/${shopName}/performance`)
        }
    }, [shouldAccessOnboarding, history, shopName])

    if (isError)
        return (
            <motion.div
                className={css.container}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className={css.error}>
                    <p>
                        An error occurred while fetching the AI Journey data.
                        Please try again later.
                    </p>
                </div>
            </motion.div>
        )

    const isPageLoading = isLoadingIntegrations || isLoadingJourneys

    return (
        <motion.div
            className={css.container}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.5 }}
        >
            {!isPageLoading && (
                <>
                    <PerformanceBadge />
                    <AnimatedText />
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
