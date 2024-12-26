import React, {useMemo} from 'react'
import {Redirect, useParams} from 'react-router-dom'

import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import {AiAgentLayout} from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import {WorkflowConfiguration} from 'pages/automate/workflows/models/workflowConfiguration.types'

import css from './ActionsView.less'
import CustomActionForm from './components/CustomActionForm'
import TemplateActionForm from './components/TemplateActionForm'

type Props = {
    configuration: WorkflowConfiguration
}

const EditActionFormView = ({configuration}: Props) => {
    const {shopName} = useParams<{shopName: string}>()
    const {routes} = useAiAgentNavigation({shopName})

    const {data: templates = [], isInitialLoading: isTemplatesLoading} =
        useGetWorkflowConfigurationTemplates(
            {triggers: ['llm-prompt']},
            {enabled: !!configuration.template_internal_id}
        )

    const template = useMemo(
        () =>
            templates.find(
                (template) =>
                    template.internal_id === configuration.template_internal_id
            ),
        [templates, configuration.template_internal_id]
    )

    if (
        configuration.template_internal_id &&
        !template &&
        !isTemplatesLoading
    ) {
        return <Redirect to={routes.actions} />
    }

    return (
        <AiAgentLayout
            isLoading={isTemplatesLoading}
            shopName={shopName}
            className={css.actionsFormContainer}
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

export default EditActionFormView
