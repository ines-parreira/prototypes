import { useQueryClient } from '@tanstack/react-query'

import {
    helpCenterKeys,
    useUpdateIntentStatus as useUpdateIntentStatusMutation,
} from 'models/helpCenter/queries'
import type { Components } from 'rest_api/help_center_api/client.generated'

type IntentStatusValue = Components.Schemas.UpdateIntentStatusDto['status']

export const useUpdateIntentStatus = (helpCenterId: number) => {
    const queryClient = useQueryClient()
    const { mutateAsync, isLoading } = useUpdateIntentStatusMutation()

    const updateIntentStatus = (intentId: string, status: IntentStatusValue) =>
        mutateAsync([
            undefined,
            { help_center_id: helpCenterId, intent: intentId },
            { status },
        ]).then(() => {
            queryClient.invalidateQueries({
                queryKey: helpCenterKeys.intents(helpCenterId),
            })
        })

    return { updateIntentStatus, isLoading }
}
