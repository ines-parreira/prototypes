import { useEffect, useRef } from 'react'

import { useSearchParam } from 'hooks/useSearchParam'

export const DIFF_SEARCH_PARAM = 'diff'
const DIFF_ENABLED_VALUE = 'true'

type UseDiffUrlSyncParams = {
    isDiffMode: boolean
    canEnableDiff: boolean
    // Only invoked while diff mode is off (to restore it), so it acts as "enable".
    toggleDiff: () => void | Promise<void>
}

/**
 * Mirrors the editor's diff view in the `diff` search param and restores it
 * from the param on load, so reloaded or shared URLs reopen the diff view.
 */
export function useDiffUrlSync({
    isDiffMode,
    canEnableDiff,
    toggleDiff,
}: UseDiffUrlSyncParams): void {
    const [diffParam, setDiffParam] = useSearchParam(DIFF_SEARCH_PARAM)
    const isDiffParamEnabled = diffParam === DIFF_ENABLED_VALUE

    const hasResolvedRestore = useRef(false)
    const hasTriggeredRestore = useRef(false)

    useEffect(() => {
        if (hasResolvedRestore.current) return

        if (!isDiffParamEnabled || isDiffMode) {
            hasResolvedRestore.current = true
            return
        }

        if (canEnableDiff && !hasTriggeredRestore.current) {
            hasTriggeredRestore.current = true
            void toggleDiff()
        }
    }, [isDiffParamEnabled, isDiffMode, canEnableDiff, toggleDiff])

    // Sync the URL only after any pending restore has settled.
    useEffect(() => {
        if (!hasResolvedRestore.current) return
        if (isDiffMode === isDiffParamEnabled) return

        setDiffParam(isDiffMode ? DIFF_ENABLED_VALUE : null)
    }, [isDiffMode, isDiffParamEnabled, setDiffParam])
}
