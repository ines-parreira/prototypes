import { useQueryClient } from '@tanstack/react-query'
import { Redirect, useParams } from 'react-router-dom'

import {
    storeWorkflowsConfigurationDefinitionKeys,
    useGetWorkflowConfiguration,
} from 'models/workflows/queries'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { SUPPORT_ACTIONS } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { WorkflowConfiguration } from 'pages/automate/workflows/models/workflowConfiguration.types'

import EditActionView from './EditActionView'
import GuidanceReferenceProvider from './providers/GuidanceReferenceProvider'
import StoreTrackstarProvider from './providers/StoreTrackstarProvider'
import { StoresWorkflowConfiguration } from './types'

const EditActionViewContainer = () => {
    const queryClient = useQueryClient()

    const { shopName, shopType, id } = useParams<{
        shopType: 'shopify'
        shopName: string
        id: string
    }>()
    const { routes } = useAiAgentNavigation({ shopName })

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
                title={SUPPORT_ACTIONS}
            />
        )
    }

    if (!configuration) {
        return <Redirect to={routes.actions} />
    }

    return (
        <StoreTrackstarProvider storeName={shopName} storeType={shopType}>
            <GuidanceReferenceProvider actions={[configuration]}>
                <EditActionView
                    configuration={configuration as WorkflowConfiguration}
                />
            </GuidanceReferenceProvider>
        </StoreTrackstarProvider>
    )
}

export default EditActionViewContainer
