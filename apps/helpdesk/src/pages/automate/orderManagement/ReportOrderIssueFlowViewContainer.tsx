import { useParams } from 'react-router-dom'

import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { useStoreIntegrations } from 'pages/automate/common/hooks/useStoreIntegrations'
import { useConnectedChannelsContext } from 'pages/automate/connectedChannels/ConnectedChannelsContext'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'

import { ReportOrderIssueFlowViewContainer as LegacyReportOrderIssueFlowViewContainer } from './legacy/reportOrderIssue/ReportOrderIssueFlowViewContainer'
import { ReportOrderIssueFlowViewContainerRevamp } from './revamp/reportOrderIssue/ReportOrderIssueFlowViewContainer'

export const ReportOrderIssueFlowViewContainer = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const { channel } = useConnectedChannelsContext()

    const storeIntegrations = useStoreIntegrations()
    const storeIntegration = storeIntegrations.find(
        (integration) =>
            getShopNameFromStoreIntegration(integration) === shopName,
    )

    const { shouldShowOrderManagementScreensRevamp } =
        useShouldShowChatSettingsRevamp(storeIntegration, channel?.value.id)

    if (shouldShowOrderManagementScreensRevamp) {
        return <ReportOrderIssueFlowViewContainerRevamp />
    }

    return <LegacyReportOrderIssueFlowViewContainer />
}
