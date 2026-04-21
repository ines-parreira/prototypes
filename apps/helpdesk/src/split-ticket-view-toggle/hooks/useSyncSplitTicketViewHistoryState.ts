import { useCallback, useEffect } from 'react'

import { useHistory, useLocation } from 'react-router-dom'

type SplitTicketViewLocationState = {
    previousSplitTicketViewEnabled?: boolean
}

type Props = {
    isSplitTicketViewEnabled: boolean
    setSplitTicketView: (value: boolean) => void
}

export default function useSyncSplitTicketViewHistoryState({
    isSplitTicketViewEnabled,
    setSplitTicketView,
}: Props) {
    const history = useHistory()
    const { pathname, state } =
        useLocation<SplitTicketViewLocationState | null>()

    useEffect(() => {
        const previousSplitTicketViewEnabled =
            state?.previousSplitTicketViewEnabled

        if (
            history.action !== 'POP' ||
            typeof previousSplitTicketViewEnabled !== 'boolean'
        ) {
            return
        }

        setSplitTicketView(previousSplitTicketViewEnabled)
        history.replace(pathname, {
            ...state,
            previousSplitTicketViewEnabled: undefined,
        })
    }, [history, pathname, setSplitTicketView, state])

    const syncSplitTicketViewHistoryState = useCallback(() => {
        history.replace(pathname, {
            ...(state ?? {}),
            previousSplitTicketViewEnabled: isSplitTicketViewEnabled,
        })
    }, [history, isSplitTicketViewEnabled, pathname, state])

    return {
        syncSplitTicketViewHistoryState,
    }
}
