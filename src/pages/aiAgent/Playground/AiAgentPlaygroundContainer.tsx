import { useFlags } from 'launchdarkly-react-client-sdk'
import { useParams } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'

import PostCompletionWizardModal from '../AiAgentOnboardingWizard/PostCompletionWizardModal'
import { AiAgentLayout } from '../components/AiAgentLayout/AiAgentLayout'
import { AI_AGENT, TEST } from '../constants'
import { AiAgentPlaygroundView } from './AiAgentPlaygroundView'

import css from './AiAgentPlaygroundContainer.less'

export const AiAgentPlaygroundContainer = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    return (
        <AiAgentLayout
            shopName={shopName}
            className={css.container}
            title={isStandaloneMenuEnabled ? TEST : AI_AGENT}
        >
            <AiAgentPlaygroundView shopName={shopName} />

            <PostCompletionWizardModal />
        </AiAgentLayout>
    )
}
