import {useQueryClient} from '@tanstack/react-query'
import React, {useMemo} from 'react'
import {useParams, useHistory, Redirect} from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    useGetWorkflowConfiguration,
    storeWorkflowsConfigurationDefinitionKeys,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import {handleError} from 'pages/automate/actions/hooks/errorHandler'
import {AiAgentLayout} from 'pages/automate/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import {WorkflowConfiguration} from 'pages/automate/workflows/models/workflowConfiguration.types'

import css from './ActionsView.less'
import CustomActionForm from './components/CustomActionForm'
import TemplateActionForm from './components/TemplateActionForm'
import {StoresWorkflowConfiguration} from './types'

const EditActionFormView = () => {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()
    const history = useHistory()

    const {shopName, shopType, id} = useParams<{
        shopType: string
        shopName: string
        id: string
    }>()
    const {routes} = useAiAgentNavigation({shopName})

    const storeConfigurationQueryKey =
        storeWorkflowsConfigurationDefinitionKeys.list({
            storeName: shopName,
            storeType: shopType,
        })

    const {data: configuration, isInitialLoading} = useGetWorkflowConfiguration(
        id,
        {
            initialData: queryClient
                .getQueryData<StoresWorkflowConfiguration>(
                    storeConfigurationQueryKey
                )
                ?.find((action) => action.id === id),
            onError: (error) => {
                handleError(error, 'Failed to fetch action', dispatch)
                history.push(routes.actions)
            },
            initialDataUpdatedAt: () =>
                queryClient.getQueryState<StoresWorkflowConfiguration>(
                    storeConfigurationQueryKey
                )?.dataUpdatedAt,
        }
    )

    const {data: templates = [], isInitialLoading: isTemplatesLoading} =
        useGetWorkflowConfigurationTemplates(
            {triggers: ['llm-prompt']},
            {enabled: !!configuration?.template_internal_id}
        )

    const template = useMemo(
        () =>
            templates.find(
                (template) =>
                    template.internal_id === configuration?.template_internal_id
            ),
        [templates, configuration?.template_internal_id]
    )

    if (
        configuration?.template_internal_id &&
        !template &&
        !isTemplatesLoading
    ) {
        return <Redirect to={routes.actions} />
    }

    return (
        <AiAgentLayout
            isLoading={isInitialLoading || isTemplatesLoading}
            shopName={shopName}
            className={css.actionsFormContainer}
        >
            {template ? (
                <TemplateActionForm
                    configuration={configuration as WorkflowConfiguration}
                    template={template}
                />
            ) : (
                <CustomActionForm
                    configuration={configuration as WorkflowConfiguration}
                />
            )}
        </AiAgentLayout>
    )
}

export default EditActionFormView
