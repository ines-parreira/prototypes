import Lottie from 'lottie-react'

import { Box, Button, Heading, Text } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { OPPORTUNITIES } from 'pages/aiAgent/constants'
import type { OpportunityPageState } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import TrialTryModal from 'pages/common/components/TrialTryModal/TrialTryModal'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import css from './RestrictedOpportunityMessage.less'

const BOOK_DEMO_URL =
    'https://www.gorgias.com/demo/customers/automate?utm_source=product&utm_medium=in_product&utm_campaign=ai_agent_feature_opportunities_paywall'

interface RestrictedOpportunityMessageProps {
    opportunitiesPageState: OpportunityPageState
    shopName: string
}

export const RestrictedOpportunityMessage = ({
    opportunitiesPageState,
    shopName,
}: RestrictedOpportunityMessageProps) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const { canSeeTrialCTA, canBookDemo, trialType } = useTrialAccess(shopName)
    const { storeActivations } = useStoreActivations({ storeName: shopName })

    const { openTrialUpgradeModal, isTrialModalOpen } =
        useShoppingAssistantTrialFlow({
            accountDomain,
            storeActivations,
            trialType,
            source: OPPORTUNITIES,
        })

    const { newTrialUpgradePlanModal } = useTrialModalProps({
        storeName: shopName,
        source: OPPORTUNITIES,
    })

    const handleBookDemo = () => {
        window.open(BOOK_DEMO_URL, '_blank')
    }

    const handleStartTrial = () => {
        openTrialUpgradeModal()
    }

    const renderCTA = () => {
        if (canSeeTrialCTA) {
            return (
                <Button variant="primary" onClick={handleStartTrial}>
                    {opportunitiesPageState.primaryCta?.label ?? 'Try for free'}
                </Button>
            )
        }

        if (canBookDemo) {
            return (
                <Button variant="primary" onClick={handleBookDemo}>
                    Book a demo
                </Button>
            )
        }

        return null
    }

    return (
        <div className={css.containerContent}>
            {opportunitiesPageState.media && (
                <div className={css.mediaFrame}>
                    {typeof opportunitiesPageState.media === 'object' ? (
                        <Lottie
                            animationData={opportunitiesPageState.media}
                            loop={true}
                            autoplay={true}
                            aria-label="Upgrade opportunities"
                            role="img"
                        />
                    ) : (
                        <img
                            className={css.media}
                            src={opportunitiesPageState.media}
                            alt="Upgrade opportunities"
                        />
                    )}
                </div>
            )}
            <Box flexDirection="column" gap="xs" alignItems="center">
                <Heading size="lg">{opportunitiesPageState.title}</Heading>
                <Text size="md" variant="regular" align="center">
                    {opportunitiesPageState.description}
                </Text>
            </Box>
            {renderCTA()}
            <TrialTryModal
                {...newTrialUpgradePlanModal}
                isOpen={isTrialModalOpen}
            />
        </div>
    )
}
