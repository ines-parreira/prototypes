import React, {useMemo} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import {useQueryClient} from '@tanstack/react-query'
import useAppDispatch from 'hooks/useAppDispatch'
import {AiAgentLayout} from 'pages/automate/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {handleError} from 'pages/automate/actions/hooks/errorHandler'
import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import {
    useGetWorkflowConfiguration,
    storeWorkflowsConfigurationDefinitionKeys,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'

import {
    StoresWorkflowConfiguration,
    CustomActionConfigurationFormInput,
    TemplateConfigurationFormInput,
} from './types'
import CustomActionsForm from './components/CustomActionsForm'
import TemplateActionsForm from './components/TemplateActionsForm'
import css from './ActionsView.less'

export default function EditActionFormView() {
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

    const {data: configurationData, isInitialLoading} =
        useGetWorkflowConfiguration(
            {
                id,
            },
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

    const {
        data: templateConfigurations,
        isInitialLoading: isTemplateConfigurationsLoading,
    } = useGetWorkflowConfigurationTemplates(
        {triggers: ['llm-prompt']},
        {
            enabled: !!configurationData?.template_internal_id,
        }
    )

    const templateConfiguration = useMemo(
        () =>
            templateConfigurations?.find(
                (template) =>
                    template.internal_id ===
                    configurationData?.template_internal_id
            ),
        [templateConfigurations, configurationData]
    )

    return (
        <AiAgentLayout
            isLoading={isInitialLoading || isTemplateConfigurationsLoading}
            shopName={shopName}
            className={css.actionsFormContainer}
        >
            {templateConfiguration ? (
                <TemplateActionsForm
                    initialConfigurationData={
                        configurationData as TemplateConfigurationFormInput
                    }
                    templateConfiguration={templateConfiguration}
                />
            ) : (
                <CustomActionsForm
                    initialConfigurationData={
                        configurationData as CustomActionConfigurationFormInput
                    }
                />
            )}
        </AiAgentLayout>
    )
}
