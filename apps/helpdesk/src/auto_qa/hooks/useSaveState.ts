import { useEffect, useState } from 'react'

export type SaveState = 'idle' | 'saving' | 'saved'

export default function useSaveState(isSaving: boolean) {
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
        }, 3000)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [saveState])

    return saveState
}
