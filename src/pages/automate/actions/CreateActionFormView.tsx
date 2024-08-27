import React, {useMemo, useState} from 'react'
import {useParams, useLocation} from 'react-router-dom'
import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import {AiAgentLayout} from 'pages/automate/aiAgent/components/AiAgentLayout/AiAgentLayout'
import CustomActionsForm from './components/CustomActionsForm'
import TemplateActionsForm from './components/TemplateActionsForm'
import {TemplateConfigurationFormInput} from './types'
import {
    generateNewCustomActionConfigurationFormInput,
    getTriggerstByKind,
} from './utils'
import css from './ActionsView.less'

export default function CreateActionFormView() {
    const {search} = useLocation()
    const params = useMemo(() => new URLSearchParams(search), [search])
    const [apiKeyModalIsOpen, setApiKeyModalIsOpen] = useState(false)
    const templateConfigurationId = params.get('template_id')

    const {
        data: templateConfigurations,
        isInitialLoading: isTemplateConfigurationsLoading,
    } = useGetWorkflowConfigurationTemplates(
        {triggers: ['llm-prompt']},
        {
            enabled: !!templateConfigurationId,
        }
    )

    const [templateConfiguration, newActionConfiguration] = useMemo(() => {
        const template = templateConfigurations?.find(
            (template) => template.id === templateConfigurationId
        )
        if (!template?.triggers) {
            return []
        }
        const llmPromptTrigger = getTriggerstByKind(
            template.triggers,
            'llm-prompt'
        )

        const newActionConfigurationFormInput: TemplateConfigurationFormInput =
            {
                name: template?.name,
                initial_step_id: null,
                available_languages: [],
                is_draft: false,
                apps: template?.apps,
                entrypoints: template?.entrypoints,
                triggers: [
                    {
                        kind: 'llm-prompt',
                        settings: {
                            custom_inputs: [],
                            object_inputs: [],
                            outputs: [],
                            conditions: llmPromptTrigger?.settings.conditions,
                        },
                    },
                ],
                steps: [],
                transitions: [],
            }
        return [template, newActionConfigurationFormInput]
    }, [templateConfigurations, templateConfigurationId])

    const {shopName} = useParams<{
        shopType: string
        shopName: string
    }>()

    const isTemplateAction = templateConfiguration && newActionConfiguration

    return (
        <AiAgentLayout
            shopName={shopName}
            className={css.actionsFormContainer}
            isLoading={isTemplateConfigurationsLoading}
        >
            {isTemplateAction ? (
                <TemplateActionsForm
                    initialConfigurationData={newActionConfiguration}
                    templateConfiguration={templateConfiguration}
                    apiKeyModalIsOpen={apiKeyModalIsOpen}
                    setApiKeyModalIsOpen={setApiKeyModalIsOpen}
                />
            ) : (
                <CustomActionsForm
                    initialConfigurationData={generateNewCustomActionConfigurationFormInput()}
                />
            )}
        </AiAgentLayout>
    )
}
