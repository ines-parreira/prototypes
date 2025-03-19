import { useFlags } from 'launchdarkly-react-client-sdk'
import { useParams } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import useEffectOnce from 'hooks/useEffectOnce'
import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { ACTIONS, AI_AGENT } from 'pages/aiAgent/constants'

import ActionsUseCaseTemplatesCards from './components/ActionsUseCaseTemplatesCards'
import BackToActionButton from './components/BackToActionButton'
import CreateCustomActionButton from './components/CreateCustomActionButton'

import css from './ActionTemplatesView.less'

const ActionTemplatesView = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const { data: templateConfigurations = [], isInitialLoading } =
        useGetWorkflowConfigurationTemplates({
            triggers: ['llm-prompt'],
        })
    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    useEffectOnce(() => {
        logEvent(SegmentEvent.AutomateActionsTemplatesVisited)
    })

    return (
        <AiAgentLayout
            shopName={shopName}
            isLoading={isInitialLoading}
            className={css.container}
            title={isStandaloneMenuEnabled ? ACTIONS : AI_AGENT}
        >
            <div className={css.backButtonContainer}>
                <BackToActionButton />
            </div>
            <div className={css.header}>
                Choose a template and customize it to fit your needs
                <CreateCustomActionButton />
            </div>
            <ActionsUseCaseTemplatesCards
                templates={templateConfigurations}
                showCustomAction
            />
        </AiAgentLayout>
    )
}

export default ActionTemplatesView
