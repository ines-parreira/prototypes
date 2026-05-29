import { useMemo } from 'react'

import { useAllUserAvailabilities } from './useAllUserAvailabilities'

export function useAllAvailableUserIds(): Set<number> {
    const allUserAvailabilities = useAllUserAvailabilities()

    return useMemo(() => {
        const availableUserIds = allUserAvailabilities
            .filter((availability) => availability.user_status === 'available')
            .map((availability) => availability.user_id)

        return new Set(availableUserIds)
    }, [allUserAvailabilities])
}
