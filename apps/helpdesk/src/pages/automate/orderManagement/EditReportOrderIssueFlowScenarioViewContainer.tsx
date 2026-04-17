import { lazy, Suspense } from 'react'

import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useChatPreviewChannelsContext } from 'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import LegacyEditReportOrderIssueFlowScenarioViewContainer from './legacy/reportOrderIssue/EditReportOrderIssueFlowScenarioViewContainer'

const EditReportOrderIssueFlowScenarioViewContainerRevamp = lazy(() =>
    import(
        './revamp/reportOrderIssue/editScenario/EditReportOrderIssueFlowScenarioViewContainer'
    ).then((m) => ({
        default: m.EditReportOrderIssueFlowScenarioViewContainerRevamp,
    })),
)

export const EditReportOrderIssueFlowScenarioViewContainer = () => {
    const { shopName, selectedChannelId } = useChatPreviewChannelsContext()

    const storeIntegrations = useStoreIntegrations()
    const storeIntegration = storeIntegrations.find(
        (integration) =>
            getShopNameFromStoreIntegration(integration) === shopName,
    )

    const { shouldShowOrderManagementScreensRevamp } =
        useShouldShowChatSettingsRevamp(storeIntegration, selectedChannelId)

    if (shouldShowOrderManagementScreensRevamp) {
        return (
            <Suspense>
                <EditReportOrderIssueFlowScenarioViewContainerRevamp />
            </Suspense>
        )
    }

    return <LegacyEditReportOrderIssueFlowScenarioViewContainer />
}
