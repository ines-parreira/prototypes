import { lazy, Suspense } from 'react'

import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useChatPreviewChannelsContext } from 'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import LegacyCreateReportOrderIssueFlowScenarioViewContainer from './legacy/reportOrderIssue/CreateReportOrderIssueFlowScenarioViewContainer'

const CreateReportOrderIssueFlowScenarioViewContainerRevamp = lazy(() =>
    import(
        './revamp/reportOrderIssue/newScenario/CreateReportOrderIssueFlowScenarioViewContainer'
    ).then((m) => ({
        default: m.CreateReportOrderIssueFlowScenarioViewContainerRevamp,
    })),
)

export const CreateReportOrderIssueFlowScenarioViewContainer = () => {
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
                <CreateReportOrderIssueFlowScenarioViewContainerRevamp />
            </Suspense>
        )
    }

    return <LegacyCreateReportOrderIssueFlowScenarioViewContainer />
}
