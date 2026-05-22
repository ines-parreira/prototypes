import { Banner, Button } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { TrialActivatedModal } from 'pages/aiAgent/trial/components/TrialActivatedModal/TrialActivatedModal'
import { TrialActivationModal } from 'pages/aiAgent/trial/components/TrialActivationModal'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

const BANNER_DESCRIPTION_BY_TRIAL_TYPE: Record<TrialType, string> = {
    [TrialType.AiAgent]:
        'Start your 2-week trial to let AI Agent respond to your shoppers.',
    [TrialType.ShoppingAssistant]:
        'Start your 2-week trial to let AI Agent respond to your customers.',
}

type Props = {
    shopName: string | undefined
}

export const TrialOptInBanner = ({ shopName }: Props) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { storeActivations } = useStoreActivations({
        storeName: shopName,
        withChatIntegrationsStatus: true,
        withStoresKnowledgeStatus: true,
    })

    const trialAccess = useTrialAccess(shopName)

    const {
        startTrial,
        isLoading,
        isTrialModalOpen,
        isSuccessModalOpen,
        closeTrialUpgradeModal,
        closeSuccessModal,
        openTrialUpgradeModal,
    } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
        trialType: trialAccess.trialType,
        source: 'overview_post_setup',
    })

    const trialModalProps = useTrialModalProps({ storeName: shopName })

    return (
        <>
            <Banner
                intent="ai"
                icon="ai-sparkles"
                title="AI Agent is ready"
                description={
                    BANNER_DESCRIPTION_BY_TRIAL_TYPE[trialAccess.trialType]
                }
                isClosable={false}
            >
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={openTrialUpgradeModal}
                >
                    Start trial
                </Button>
            </Banner>

            <TrialActivationModal
                isOpen={isTrialModalOpen}
                onClose={closeTrialUpgradeModal}
                onConfirm={startTrial}
                trialType={trialAccess.trialType}
                newPlan={trialModalProps.newTrialUpgradePlanModal.newPlan}
                isLoading={isLoading}
            />

            {isSuccessModalOpen && (
                <TrialActivatedModal
                    {...trialModalProps.trialActivatedModal}
                    onConfirm={closeSuccessModal}
                />
            )}
        </>
    )
}
