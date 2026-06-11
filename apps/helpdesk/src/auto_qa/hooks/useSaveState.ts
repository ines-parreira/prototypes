import { useEffect, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

export type SaveState = 'idle' | 'saving' | 'saved'

export function useSaveState(isSaving: boolean) {
    const [saveState, setSaveState] = useState<SaveState>('idle')

    useEffect(() => {
        setSaveState((currentSaveState) => {
            if (isSaving) {
                return 'saving'
            }

            if (currentSaveState === 'idle') {
                return 'idle'
            }

            return 'saved'
        })
    }, [isSaving])

    useEffect(() => {
        if (saveState !== 'saved') return

        const timeoutId = setTimeout(() => {
            setSaveState('idle')
        }, Duration.seconds(3))

        return () => {
            clearTimeout(timeoutId)
        }
    }, [saveState])

    return saveState
}
