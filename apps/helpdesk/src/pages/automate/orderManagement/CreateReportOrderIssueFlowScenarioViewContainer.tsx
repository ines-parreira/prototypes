import { lazy, Suspense } from 'react'

import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'
import { getGorgiasChatIntegrationsByStoreName } from 'state/integrations/selectors'

import LegacyCreateReportOrderIssueFlowScenarioViewContainer from './legacy/reportOrderIssue/CreateReportOrderIssueFlowScenarioViewContainer'

const CreateReportOrderIssueFlowScenarioViewContainerRevamp = lazy(() =>
    import(
        './revamp/reportOrderIssue/newScenario/CreateReportOrderIssueFlowScenarioViewContainer'
    ).then((m) => ({
        default: m.CreateReportOrderIssueFlowScenarioViewContainerRevamp,
    })),
)

export const CreateReportOrderIssueFlowScenarioViewContainer = () => {
    const { shopName } = useParams<{ shopName: string }>()

    const storeIntegrations = useStoreIntegrations()
    const storeIntegration = storeIntegrations.find(
        (integration) =>
            getShopNameFromStoreIntegration(integration) === shopName,
    )

    const chatIntegration = useAppSelector(
        getGorgiasChatIntegrationsByStoreName(shopName ?? ''),
    )
    const chatId = chatIntegration?.id

    const { shouldShowOrderManagementScreensRevamp } =
        useShouldShowChatSettingsRevamp(storeIntegration, chatId)

    if (shouldShowOrderManagementScreensRevamp) {
        return (
            <Suspense>
                <CreateReportOrderIssueFlowScenarioViewContainerRevamp />
            </Suspense>
        )
    }

    return <LegacyCreateReportOrderIssueFlowScenarioViewContainer />
}
