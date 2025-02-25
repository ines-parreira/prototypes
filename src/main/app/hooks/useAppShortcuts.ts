import { useMemo } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useShortcuts from 'hooks/useShortcuts'
import pendingMessageManager from 'services/pendingMessageManager/pendingMessageManager'
import { goToActiveView } from 'state/views/actions'

export default function useAppShortcuts() {
    const dispatch = useAppDispatch()

    const actions = useMemo(
        () => ({
            GO_VIEW: {
                action: (e: Event) => {
                    e.preventDefault()
                    dispatch(goToActiveView())
                },
            },
            UNDO_MESSAGE: {
                action: () => pendingMessageManager.undoMessage(),
            },
        }),
        [dispatch],
    )

    useShortcuts('App', actions)
}
