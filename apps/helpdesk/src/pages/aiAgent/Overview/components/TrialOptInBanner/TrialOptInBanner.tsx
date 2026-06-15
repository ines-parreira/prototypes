import { Banner, Button } from '@gorgias/axiom'

import { useAppSelector } from 'hooks/useAppSelector'
import type { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

const BANNER_DESCRIPTION_BY_TRIAL_TYPE: Record<TrialType, string> = {
    [TrialType.AiAgent]:
        'Start your 2-week trial to let AI Agent respond to your shoppers.',
    [TrialType.ShoppingAssistant]:
        'Start your 2-week trial to let AI Agent respond to your customers.',
}

type Props = {
    shopName: string | undefined
    storeActivations: Record<string, StoreActivation>
}

export const TrialOptInBanner = ({ shopName, storeActivations }: Props) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const trialAccess = useTrialAccess(shopName)

    const { openTrialUpgradeModal } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
        trialType: trialAccess.trialType,
        source: 'overview_post_setup',
    })

    return (
        <Banner
            intent="ai"
            icon="ai-agent-feedback"
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
                intent="ai"
            >
                Start trial
            </Button>
        </Banner>
    )
}
