import { useMemo } from 'react'

import { useTicketInfobarNavigation } from '@repo/navigation'
import { useShortcuts } from '@repo/utils'

export function useTicketInfobarNavigationShortcuts() {
    const { onToggle } = useTicketInfobarNavigation()

    const actions = useMemo(
        () => ({
            TOGGLE_INFOBAR: {
                action: () => onToggle(),
            },
        }),
        [onToggle],
    )

    return useShortcuts('Infobar', actions)
}
