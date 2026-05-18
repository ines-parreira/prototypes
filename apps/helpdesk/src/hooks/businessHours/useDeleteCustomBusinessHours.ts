import { appQueryClient } from '@repo/api-resources'

import { toast } from '@gorgias/axiom'
import type { BusinessHoursDetails } from '@gorgias/helpdesk-queries'
import { queryKeys, useDeleteBusinessHours } from '@gorgias/helpdesk-queries'

export default function useDeleteCustomBusinessHours(
    businessHours: BusinessHoursDetails,
    onSuccess?: () => void,
) {
    return useDeleteBusinessHours({
        mutation: {
            onSettled: () => {
                appQueryClient.invalidateQueries({
                    queryKey: queryKeys.businessHours.listBusinessHours(),
                })
            },
            onSuccess: () => {
                toast.success(
                    `'${businessHours.name}' business hours were successfully deleted.`,
                )

                onSuccess?.()
            },
            onError: () => {
                toast.error(
                    "We couldn't delete your business hours. Please try again.",
                )
            },
        },
    })
}
