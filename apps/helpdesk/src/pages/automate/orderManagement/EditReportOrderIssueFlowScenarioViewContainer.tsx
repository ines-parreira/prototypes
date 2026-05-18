import { useParams } from 'react-router-dom'

import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useConnectedChannelsContext } from 'pages/automate/connectedChannels/ConnectedChannelsContext'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import LegacyEditReportOrderIssueFlowScenarioViewContainer from './legacy/reportOrderIssue/EditReportOrderIssueFlowScenarioViewContainer'
import { EditReportOrderIssueFlowScenarioViewContainerRevamp } from './revamp/reportOrderIssue/editScenario/EditReportOrderIssueFlowScenarioViewContainer'

export const EditReportOrderIssueFlowScenarioViewContainer = () => {
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
        return <EditReportOrderIssueFlowScenarioViewContainerRevamp />
    }

    return <LegacyEditReportOrderIssueFlowScenarioViewContainer />
}
