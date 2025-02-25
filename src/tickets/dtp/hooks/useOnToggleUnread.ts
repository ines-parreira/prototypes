import { useCallback, useMemo, useState } from 'react'

export type OnToggleUnreadFn = (ticketId: number, isUnread: boolean) => void

export function useOnToggleUnread() {
    const [onToggleUnread, setOnToggleUnread] = useState<OnToggleUnreadFn>()

    const registerOnToggleUnread = useCallback(
        (toggleUnreadFn: OnToggleUnreadFn) => {
            setOnToggleUnread(() => toggleUnreadFn)
        },
        [],
    )

    return useMemo(
        () => ({ onToggleUnread, registerOnToggleUnread }),
        [onToggleUnread, registerOnToggleUnread],
    )
}
