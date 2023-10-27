import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {NotificationStatus} from 'state/notifications/types'
import useSelfServiceStoreIntegration from 'pages/automation/common/hooks/useSelfServiceStoreIntegration'
import {
    LanguageCode,
    WorkflowConfigurationShallow,
} from '../models/workflowConfiguration.types'

export type UseWorkflowsEntrypointsReturnType = {
    workflows: Array<{
        workflow_id: string
        name: string
        available_languages: LanguageCode[]
    }>
    storeIntegrationId?: number
    isFetchPending: boolean
}

type Props = {
    shopType: string
    shopName: string
    notifyMerchant: (message: string, kind: 'success' | 'error') => void
    configurationsMap: Record<string, WorkflowConfigurationShallow>
}

export default function useStoreWorkflows({
    shopType,
    shopName,
    notifyMerchant,
    configurationsMap,
}: Props): UseWorkflowsEntrypointsReturnType {
    const storeIntegration = useSelfServiceStoreIntegration(shopType, shopName)

    const {selfServiceConfiguration, isFetchPending} =
        useSelfServiceConfiguration(shopType, shopName, (notif) => {
            if (notif.status === NotificationStatus.Error && notif.message) {
                notifyMerchant(notif.message, 'error')
            }
        })

    const workflows =
        selfServiceConfiguration?.workflows_entrypoints
            ?.filter((e) => configurationsMap[e.workflow_id])
            .map((e) => ({
                ...e,
                name: configurationsMap[e.workflow_id]?.name ?? '',
                available_languages:
                    configurationsMap[e.workflow_id]?.available_languages ?? [],
            })) ?? []

    return {
        workflows,
        isFetchPending: isFetchPending,
        storeIntegrationId: storeIntegration?.id,
    }
}
