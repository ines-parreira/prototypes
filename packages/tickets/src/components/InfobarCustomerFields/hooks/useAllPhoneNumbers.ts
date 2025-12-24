import { useExhaustEndpoint } from '@repo/hooks'

import { listPhoneNumbers } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

export function useAllPhoneNumbers() {
    const queryParams = {
        limit: 100,
    }

    const { data, isLoading } = useExhaustEndpoint(
        queryKeys.phoneNumbers.listPhoneNumbers(queryParams),
        (cursor) => listPhoneNumbers({ cursor, ...queryParams }),
        { staleTime: 60_000, refetchOnWindowFocus: false },
    )

    return {
        phoneNumbers: data,
        isLoading,
    }
}
