import { useParams } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import useEffectOnce from 'hooks/useEffectOnce'
import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { SUPPORT_ACTIONS } from 'pages/aiAgent/constants'

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

    useEffectOnce(() => {
        logEvent(SegmentEvent.AutomateActionsTemplatesVisited)
    })

    return (
        <AiAgentLayout
            shopName={shopName}
            isLoading={isInitialLoading}
            className={css.container}
            title={SUPPORT_ACTIONS}
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
