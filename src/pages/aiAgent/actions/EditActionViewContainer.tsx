import { useQueryClient } from '@tanstack/react-query'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Redirect, useParams } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import {
    storeWorkflowsConfigurationDefinitionKeys,
    useGetWorkflowConfiguration,
} from 'models/workflows/queries'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { ACTIONS, AI_AGENT } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { WorkflowConfiguration } from 'pages/automate/workflows/models/workflowConfiguration.types'

import EditActionView from './EditActionView'
import { StoresWorkflowConfiguration } from './types'

const EditActionViewContainer = () => {
    const queryClient = useQueryClient()

    const { shopName, shopType, id } = useParams<{
        shopType: 'shopify'
        shopName: string
        id: string
    }>()
    const { routes } = useAiAgentNavigation({ shopName })

    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    const storeConfigurationQueryKey =
        storeWorkflowsConfigurationDefinitionKeys.list({
            storeName: shopName,
            storeType: shopType,
        })

    const { data: configuration, isInitialLoading } =
        useGetWorkflowConfiguration(id, {
            initialData: queryClient
                .getQueryData<StoresWorkflowConfiguration>(
                    storeConfigurationQueryKey,
                )
                ?.find((action) => action.id === id),
            initialDataUpdatedAt: () =>
                queryClient.getQueryState(storeConfigurationQueryKey)
                    ?.dataUpdatedAt,
        })

    if (isInitialLoading) {
        return (
            <AiAgentLayout
                isLoading
                shopName={shopName}
                title={isStandaloneMenuEnabled ? ACTIONS : AI_AGENT}
            />
        )
    }

    if (!configuration) {
        return <Redirect to={routes.actions} />
    }

    return (
        <EditActionView
            configuration={configuration as WorkflowConfiguration}
        />
    )
}

export default EditActionViewContainer
