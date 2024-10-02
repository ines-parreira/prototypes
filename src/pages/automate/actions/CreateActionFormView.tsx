import React, {useMemo, useRef} from 'react'
import {useParams, useLocation} from 'react-router-dom'
import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import {AiAgentLayout} from 'pages/automate/aiAgent/components/AiAgentLayout/AiAgentLayout'
import useEffectOnce from 'hooks/useEffectOnce'

import CustomActionsForm from './components/CustomActionsForm'
import TemplateActionsForm from './components/TemplateActionsForm'
import {TemplateConfiguration, TemplateConfigurationFormInput} from './types'
import {
    generateNewCustomActionConfigurationFormInput,
    getTriggerstByKind,
} from './utils'
import css from './ActionsView.less'

export default function CreateActionFormView() {
    const {search, state: initialState} = useLocation<
        | Omit<
              Extract<TemplateConfiguration['apps'][number], {type: 'app'}>,
              'type'
          >
        | undefined
    >()
    const params = useMemo(() => new URLSearchParams(search), [search])
    const templateConfigurationId = params.get('template_id')

    const state = useRef(initialState)

    useEffectOnce(() => {
        window.history.replaceState(null, '')
    })

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
                name: template.name,
                initial_step_id: null,
                available_languages: [],
                is_draft: false,
                apps: template.apps.map((app) =>
                    app.type === 'app' && app.app_id === state.current?.app_id
                        ? {...app, api_key: state.current.api_key}
                        : app
                ),
                // FIXME: "requires_confirmation" should not be copied from template
                entrypoints: template.entrypoints,
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
                />
            ) : (
                <CustomActionsForm
                    initialConfigurationData={generateNewCustomActionConfigurationFormInput()}
                />
            )}
        </AiAgentLayout>
    )
}
