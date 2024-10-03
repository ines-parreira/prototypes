import React from 'react'
import {useParams} from 'react-router-dom'

import {AiAgentLayout} from 'pages/automate/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import useEffectOnce from 'hooks/useEffectOnce'
import {logEvent, SegmentEvent} from 'common/segment'
import LinkButton from 'pages/common/components/button/LinkButton'

import ActionsTemplatesCards from './components/ActionsTemplatesCards'
import CreateCustomActionButton from './components/CreateCustomActionButton'
import BackToActionButton from './components/BackToActionButton'

import css from './ActionTemplatesView.less'

const ActionTemplatesView = () => {
    const {shopName} = useParams<{shopName: string}>()
    const {data: templateConfigurations = [], isInitialLoading} =
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
        >
            <div className={css.backButtonContainer}>
                <BackToActionButton />
            </div>
            <div className={css.header}>
                Choose an Action and customize it to fit your needs
                <CreateCustomActionButton />
            </div>
            <ActionsTemplatesCards
                templateConfigurations={templateConfigurations}
                showCustomAction
            />
            <div className={css.requestBannerContainer}>
                <div className={css.requestBannerContent}>
                    <div className={css.requestBannerTitle}>
                        Which Actions should we build next?
                    </div>
                    Let us know which Actions you would like AI Agent to handle.
                </div>
                <LinkButton
                    intent="secondary"
                    href="https://link.gorgias.com/actions"
                >
                    Request action
                </LinkButton>
            </div>
        </AiAgentLayout>
    )
}

export default ActionTemplatesView
