import {
    BusinessHoursDetails,
    useDeleteBusinessHours,
} from '@gorgias/helpdesk-queries'

import { useNotify } from 'hooks/useNotify'
import history from 'pages/history'

import { BUSINESS_HOURS_BASE_URL } from '../constants'

export default function useDeleteCustomBusinessHours(
    businessHours: BusinessHoursDetails,
) {
    const notify = useNotify()

    return useDeleteBusinessHours({
        mutation: {
            onSuccess: () => {
                notify.success(
                    `'${businessHours.name}' business hours were successfully deleted.`,
                )

                history.push(BUSINESS_HOURS_BASE_URL)
            },
            onError: () => {
                notify.error(
                    "We couldn't delete your business hours. Please try again.",
                )
            },
        },
    })
}
