import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {NotificationStatus} from 'state/notifications/types'
import useSelfServiceStoreIntegration from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import {WorkflowConfigurationShallow} from '../models/workflowConfiguration.types'

export type UseWorkflowsEntrypointsReturnType = {
    workflows: WorkflowConfigurationShallow[]
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
        selfServiceConfiguration?.workflowsEntrypoints
            ?.filter((e) => configurationsMap[e.workflow_id])
            .map((e) => configurationsMap[e.workflow_id]) ?? []

    return {
        workflows,
        isFetchPending: isFetchPending,
        storeIntegrationId: storeIntegration?.id,
    }
}
