import { Banner, Button } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { TrialActivatedModal } from 'pages/aiAgent/trial/components/TrialActivatedModal/TrialActivatedModal'
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

type Props = {
    shopName: string | undefined
}

export const TrialOptInBanner = ({ shopName }: Props) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { storeActivations } = useStoreActivations({ storeName: shopName })

    const {
        startTrialDeprecated,
        isLoading,
        isTrialModalOpen,
        isSuccessModalOpen,
        closeTrialUpgradeModal,
        closeSuccessModal,
        onConfirmTrial,
        onDismissTrialUpgradeModal,
        openTrialUpgradeModal,
    } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
        trialType: TrialType.AiAgent,
        source: 'overview_post_setup',
    })

    const trialModalProps = useTrialModalProps({
        storeName: shopName,
        onConfirmTrial,
    })

    return (
        <>
            <Banner
                intent="ai"
                icon="ai-sparkles"
                title="AI Agent is ready"
                description="Start your 2-week trial to let AI Agent respond to your shoppers."
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

            {isTrialModalOpen && (
                <UpgradePlanModal
                    {...trialModalProps.trialUpgradePlanModal}
                    onClose={closeTrialUpgradeModal}
                    onConfirm={startTrialDeprecated}
                    onDismiss={onDismissTrialUpgradeModal}
                    isLoading={isLoading}
                    isTrial
                />
            )}

            {isSuccessModalOpen && (
                <TrialActivatedModal
                    {...trialModalProps.trialActivatedModal}
                    onConfirm={closeSuccessModal}
                />
            )}
        </>
    )
}
