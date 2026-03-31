import { appQueryClient } from '@repo/api-resources'

import type { BusinessHoursDetails } from '@gorgias/helpdesk-queries'
import { queryKeys, useDeleteBusinessHours } from '@gorgias/helpdesk-queries'

import { useNotify } from 'hooks/useNotify'

export default function useDeleteCustomBusinessHours(
    businessHours: BusinessHoursDetails,
    onSuccess?: () => void,
) {
    const notify = useNotify()

    return useDeleteBusinessHours({
        mutation: {
            onSettled: () => {
                appQueryClient.invalidateQueries({
                    queryKey: queryKeys.businessHours.listBusinessHours(),
                })
            },
            onSuccess: () => {
                notify.success(
                    `'${businessHours.name}' business hours were successfully deleted.`,
                )

                onSuccess?.()
            },
            onError: () => {
                notify.error(
                    "We couldn't delete your business hours. Please try again.",
                )
            },
        },
    })
}
