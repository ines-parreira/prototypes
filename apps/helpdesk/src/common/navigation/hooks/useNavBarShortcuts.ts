import { useMemo } from 'react'

import { useShortcuts } from '@repo/utils'

import { useNavBar } from './useNavBar/useNavBar'

export const useNavBarShortcuts = () => {
    const { onNavBarShortCutToggle } = useNavBar()
    const actions = useMemo(
        () => ({
            TOGGLE_NAVBAR: {
                action: () => onNavBarShortCutToggle(),
            },
        }),
        [onNavBarShortCutToggle],
    )

    return useShortcuts('App', actions)
}
