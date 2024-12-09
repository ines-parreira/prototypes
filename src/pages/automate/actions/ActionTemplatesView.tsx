import React from 'react'
import {useParams} from 'react-router-dom'

import {useFlag} from 'common/flags'
import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import useEffectOnce from 'hooks/useEffectOnce'
import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import {AiAgentLayout} from 'pages/automate/aiAgent/components/AiAgentLayout/AiAgentLayout'
import LinkButton from 'pages/common/components/button/LinkButton'

import css from './ActionTemplatesView.less'
import ActionsTemplatesCards from './components/ActionsTemplatesCards'
import BackToActionButton from './components/BackToActionButton'
import CreateCustomActionButton from './components/CreateCustomActionButton'

const ActionTemplatesView = () => {
    const {shopName} = useParams<{shopName: string}>()
    const {data: templateConfigurations = [], isInitialLoading} =
        useGetWorkflowConfigurationTemplates({
            triggers: ['llm-prompt'],
        })

    useEffectOnce(() => {
        logEvent(SegmentEvent.AutomateActionsTemplatesVisited)
    })

    const isMultiStepActionEnabled = useFlag(
        FeatureFlagKey.ActionsMultiStep,
        false
    )

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
                {isMultiStepActionEnabled
                    ? 'Choose a template and customize it to fit your needs'
                    : 'Choose an Action and customize it to fit your needs'}
                <CreateCustomActionButton />
            </div>
            <ActionsTemplatesCards
                templateConfigurations={templateConfigurations}
                showCustomAction
            />
            {!isMultiStepActionEnabled && (
                <div className={css.requestBannerContainer}>
                    <div className={css.requestBannerContent}>
                        <div className={css.requestBannerTitle}>
                            Which Actions should we build next?
                        </div>
                        Let us know which Actions you would like AI Agent to
                        handle.
                    </div>
                    <LinkButton
                        intent="secondary"
                        href="https://link.gorgias.com/actions"
                    >
                        Request action
                    </LinkButton>
                </div>
            )}
        </AiAgentLayout>
    )
}

export default ActionTemplatesView
