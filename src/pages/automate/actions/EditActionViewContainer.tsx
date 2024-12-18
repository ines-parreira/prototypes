import {useQueryClient} from '@tanstack/react-query'
import React from 'react'
import {Redirect, useParams} from 'react-router-dom'

import {
    storeWorkflowsConfigurationDefinitionKeys,
    useGetWorkflowConfiguration,
} from 'models/workflows/queries'
import {AiAgentLayout} from 'pages/automate/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import {WorkflowConfiguration} from 'pages/automate/workflows/models/workflowConfiguration.types'

import EditActionFormView from './EditActionFormView'
import EditActionView from './EditActionView'
import {StoresWorkflowConfiguration} from './types'

const EditActionViewContainer = () => {
    const queryClient = useQueryClient()

    const {shopName, shopType, id} = useParams<{
        shopType: 'shopify'
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
            initialDataUpdatedAt: () =>
                queryClient.getQueryState(storeConfigurationQueryKey)
                    ?.dataUpdatedAt,
        }
    )

    if (isInitialLoading) {
        return <AiAgentLayout isLoading shopName={shopName} />
    }

    if (!configuration) {
        return <Redirect to={routes.actions} />
    }

    if (configuration.steps.length > 1) {
        return (
            <EditActionView
                configuration={configuration as WorkflowConfiguration}
            />
        )
    }

    return (
        <EditActionFormView
            configuration={configuration as WorkflowConfiguration}
        />
    )
}

export default EditActionViewContainer
