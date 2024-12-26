import React from 'react'
import {useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'

import {useGetOrCreateSnippetHelpCenter} from 'pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'
import {usePublicResources} from 'pages/aiAgent/hooks/usePublicResources'
import {useAiAgentStoreConfigurationContext} from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import Loader from 'pages/common/components/Loader/Loader'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

import AiAgentPreviewModeSettingsView from './AiAgentPreviewModeSettingsView'

export const AiAgentPreviewModeSettingsContainer = () => {
    const {shopName} = useParams<{shopName: string}>()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const {
        storeConfiguration,
        isLoading: isStoreConfigLoading,
        updateStoreConfiguration,
    } = useAiAgentStoreConfigurationContext()

    const hasNoEmailConnected =
        !storeConfiguration?.monitoredEmailIntegrations?.length

    const {helpCenter, isLoading: isHelpCenterLoading} =
        useGetOrCreateSnippetHelpCenter({
            accountDomain,
            shopName,
        })

    const {
        sourceItems: publicUrls,
        isSourceItemsListLoading: isPublicUrlsLoading,
    } = usePublicResources({
        helpCenterId: helpCenter?.id,
    })

    const hasNoKnowledgeBase =
        !storeConfiguration?.helpCenterId && !publicUrls?.length

    const isPreviewModeEnabled = !!storeConfiguration?.isPreviewModeActive

    if (
        isStoreConfigLoading ||
        isHelpCenterLoading ||
        isPublicUrlsLoading ||
        !storeConfiguration
    ) {
        return <Loader aria-label="loader" />
    }

    return (
        <AiAgentPreviewModeSettingsView
            shopName={shopName}
            storeConfiguration={storeConfiguration}
            updateStoreConfiguration={updateStoreConfiguration}
            hasNoEmailConnected={hasNoEmailConnected}
            hasNoKnowledgeBase={hasNoKnowledgeBase}
            isPreviewModeEnabled={isPreviewModeEnabled}
        />
    )
}
