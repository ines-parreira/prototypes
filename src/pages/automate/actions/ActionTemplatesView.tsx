import React from 'react'
import {useParams} from 'react-router-dom'

import Button from 'pages/common/components/button/Button'
import {AiAgentLayout} from 'pages/automate/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import ActionsTemplatesCards from './components/ActionsTemplatesCards'
import CreateCustomActionButton from './components/CreateCustomActionButton'
import BackToActionButton from './components/BackToActionButton'
import css from './ActionTemplatesView.less'

export default function ActionTemplatesView() {
    const {shopName} = useParams<{
        shopType: string
        shopName: string
    }>()

    const {data: templateConfigurations, isInitialLoading} =
        useGetWorkflowConfigurationTemplates(['llm-prompt'])

    return (
        <AiAgentLayout
            shopName={shopName}
            isLoading={isInitialLoading}
            className={css.container}
        >
            {templateConfigurations && templateConfigurations.length > 0 && (
                <>
                    <BackToActionButton />
                    <div className={css.templateHeader}>
                        <p>
                            Choose an Action and customize it to fit your needs
                        </p>
                        <CreateCustomActionButton />
                    </div>
                    <ActionsTemplatesCards
                        showCustomAction
                        templateConfigurations={templateConfigurations}
                    />
                    <div className={css.requestBannerContainer}>
                        <h3>Which Actions should we build next?</h3>
                        <p>
                            Let us know which Actions you would like AI Agent to
                            handle.
                        </p>
                        <a
                            href="https://link.gorgias.com/actions"
                            rel="noreferrer"
                            target="_blank"
                        >
                            <Button intent="secondary">Request action</Button>
                        </a>
                    </div>
                </>
            )}
        </AiAgentLayout>
    )
}
