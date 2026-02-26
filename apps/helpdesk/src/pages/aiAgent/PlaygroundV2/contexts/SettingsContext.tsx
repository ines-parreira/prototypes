import type { ReactNode } from 'react'
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'

import { DEFAULT_PLAYGROUND_CUSTOMER } from 'pages/aiAgent/constants'
import { useCoreContext } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import type {
    InboundSettings,
    PlaygroundModes,
    SupportedPlaygroundModes,
} from 'pages/aiAgent/PlaygroundV2/types'

export const DEFAULT_STATE: InboundSettings & {
    mode: PlaygroundModes
} = {
    mode: 'inbound' as const,
    chatAvailability: 'online' as const,
    selectedCustomer: DEFAULT_PLAYGROUND_CUSTOMER,
}

type SettingsState = {
    mode: PlaygroundModes
} & InboundSettings

type SettingsContextValue = {
    resetSettings: () => void
    setSettings: (newState: Partial<SettingsState>) => void
    supportedModes?: SupportedPlaygroundModes
} & SettingsState

const SettingsContext = createContext<SettingsContextValue | undefined>(
    undefined,
)

export const useSettingsContext = () => {
    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error(
            'useSettingsContext must be used within a SettingsProvider',
        )
    }
    return context
}

type SettingsProviderProps = {
    children: ReactNode
    supportedModes?: SupportedPlaygroundModes
}

export const SettingsProvider = ({
    children,
    supportedModes,
}: SettingsProviderProps) => {
    const {
        onChannelChange,
        onChannelAvailabilityChange,
        resetToDefaultActionsEnabled,
        resetToDefaultChannel,
    } = useCoreContext()
    const [localSettings, setLocalSettings] = useState<Partial<SettingsState>>(
        {},
    )

    const settingsState = useMemo<SettingsState>(() => {
        return {
            ...DEFAULT_STATE,
            mode: (supportedModes && supportedModes[0]) || DEFAULT_STATE.mode,
            ...localSettings,
        }
    }, [localSettings, supportedModes])

    const resetSettings = useCallback(() => {
        setLocalSettings({})
        resetToDefaultChannel()
        resetToDefaultActionsEnabled()
    }, [resetToDefaultActionsEnabled, resetToDefaultChannel])

    const setSettings = useCallback((newState: Partial<SettingsState>) => {
        setLocalSettings((prev) => ({
            ...prev,
            ...newState,
        }))
    }, [])

    useEffect(() => {
        if (settingsState.mode === 'outbound') {
            onChannelChange('sms')
        }
    }, [settingsState.mode, onChannelChange])

    useEffect(() => {
        onChannelAvailabilityChange(settingsState.chatAvailability)
    }, [settingsState.chatAvailability, onChannelAvailabilityChange])

    const value = useMemo(
        () => ({
            ...settingsState,
            resetSettings,
            setSettings,
            supportedModes,
        }),
        [settingsState, resetSettings, setSettings, supportedModes],
    )

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    )
}
