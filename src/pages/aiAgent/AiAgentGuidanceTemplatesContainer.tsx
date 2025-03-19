import { useFlags } from 'launchdarkly-react-client-sdk'
import { useParams } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'

import { AiAgentGuidanceTemplatesView } from './AiAgentGuidanceTemplatesView'
import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { AI_AGENT, GUIDANCE } from './constants'
import { useAiAgentHelpCenter } from './hooks/useAiAgentHelpCenter'

import css from './AiAgentGuidanceTemplatesContainer.less'

export const AiAgentGuidanceTemplatesContainer = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const guidanceHelpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'guidance',
    })
    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    if (!guidanceHelpCenter) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    return (
        <AiAgentLayout
            shopName={shopName}
            className={css.container}
            title={isStandaloneMenuEnabled ? GUIDANCE : AI_AGENT}
        >
            <AiAgentGuidanceTemplatesView shopName={shopName} />
        </AiAgentLayout>
    )
}
