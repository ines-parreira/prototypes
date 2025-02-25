import { useMemo } from 'react'

import useShortcuts from 'hooks/useShortcuts'

import { useNavBar } from './useNavBar/useNavBar'

export const useNavBarShortcuts = () => {
    const { onMenuToggle } = useNavBar()
    const actions = useMemo(
        () => ({
            TOGGLE_NAVBAR: {
                action: () => onMenuToggle(),
            },
        }),
        [onMenuToggle],
    )

    return useShortcuts('App', actions)
}
