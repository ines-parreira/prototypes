import React, {useMemo, useRef} from 'react'
import {useParams, useLocation} from 'react-router-dom'
import {ulid} from 'ulidx'

import useEffectOnce from 'hooks/useEffectOnce'
import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import {AiAgentLayout} from 'pages/automate/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {WorkflowConfiguration} from 'pages/automate/workflows/models/workflowConfiguration.types'

import css from './ActionsView.less'
import CustomActionForm from './components/CustomActionForm'
import TemplateActionForm from './components/TemplateActionForm'
import {TemplateConfiguration} from './types'
import {getInitialConfiguration} from './utils'

const CreateActionFormView = () => {
    const {search, state: initialState} = useLocation<
        | Omit<
              Extract<TemplateConfiguration['apps'][number], {type: 'app'}>,
              'type'
          >
        | undefined
    >()
    const params = useMemo(() => new URLSearchParams(search), [search])
    const templateId = params.get('template_id')

    const state = useRef(initialState)

    useEffectOnce(() => {
        window.history.replaceState(null, '')
    })

    const {data: templates = [], isInitialLoading: isTemplatesLoading} =
        useGetWorkflowConfigurationTemplates(
            {triggers: ['llm-prompt']},
            {enabled: !!templateId}
        )

    const template = useMemo(
        () => templates.find((template) => template.id === templateId),
        [templates, templateId]
    )

    const {shopName} = useParams<{shopName: string}>()

    const configuration = useMemo<WorkflowConfiguration>(() => {
        if (template) {
            return {
                id: ulid(),
                internal_id: ulid(),
                name: template.name,
                initial_step_id: null,
                available_languages: [],
                is_draft: false,
                apps: template.apps.map((app) =>
                    app.type === 'app' && app.app_id === state.current?.app_id
                        ? {...app, api_key: state.current.api_key}
                        : app
                ),
                entrypoints: template.entrypoints,
                triggers: template.triggers.map((trigger) => {
                    if (trigger.kind === 'llm-prompt') {
                        return {
                            kind: 'llm-prompt',
                            settings: {
                                custom_inputs: [],
                                object_inputs: [],
                                outputs: [],
                                conditions: trigger.settings.conditions,
                            },
                        }
                    }

                    return trigger
                }),
                steps: [],
                transitions: [],
                template_internal_id: template.internal_id,
            }
        }

        return getInitialConfiguration()
    }, [template])

    return (
        <AiAgentLayout
            shopName={shopName}
            className={css.actionsFormContainer}
            isLoading={isTemplatesLoading}
        >
            {template ? (
                <TemplateActionForm
                    configuration={configuration}
                    template={template}
                />
            ) : (
                <CustomActionForm configuration={configuration} />
            )}
        </AiAgentLayout>
    )
}

export default CreateActionFormView
