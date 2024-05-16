import {useCallback, useMemo, useState} from 'react'

import {defaultSound, SoundValue} from 'services/NotificationSounds'

export type Setting = {
    enabled: boolean
    sound: '' | SoundValue
    volume: number
}

export default function useSoundSetting(initialSettings?: Setting) {
    const [state, setState] = useState<Setting>(initialSettings || defaultSound)

    const onChangeEnabled = useCallback((enabled: boolean) => {
        setState((s) => ({...s, enabled}))
    }, [])

    const onChangeSound = useCallback((sound: '' | SoundValue) => {
        setState((s) => ({...s, sound}))
    }, [])

    const onChangeVolume = useCallback((volume: number) => {
        setState((s) => ({...s, volume}))
    }, [])

    return useMemo(
        () => ({
            ...state,
            onChangeEnabled,
            onChangeSound,
            onChangeVolume,
        }),
        [onChangeEnabled, onChangeSound, onChangeVolume, state]
    )
}
