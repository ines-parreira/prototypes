import { Duration } from '@gorgias/toolkit'

import { useListAllUserAvailabilities } from '@gorgias/helpdesk-queries'
import type { UserAvailability } from '@gorgias/helpdesk-queries'

export const USER_AVAILABILITIES_PAGE_LIMIT = 100

export function useAllUserAvailabilities(): UserAvailability[] {
    const { items } = useListAllUserAvailabilities(
        { limit: USER_AVAILABILITIES_PAGE_LIMIT },
        { exhaustPages: true, query: { staleTime: Duration.hours(1) } },
    )
    return items
}
