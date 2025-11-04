import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'

import { DEFAULT_PLAYGROUND_CUSTOMER } from 'pages/aiAgent/constants'
import {
    InboundSettings,
    PlaygroundChannels,
    PlaygroundModes,
} from 'pages/aiAgent/PlaygroundV2/types'

export const DEFAULT_STATE: InboundSettings & {
    mode: PlaygroundModes
    channel: PlaygroundChannels
} = {
    mode: 'inbound' as const,
    channel: 'chat' as const,
    chatAvailability: 'online' as const,
    selectedCustomer: DEFAULT_PLAYGROUND_CUSTOMER,
    areActionsEnabled: false,
}

type SettingsState = {
    mode: PlaygroundModes
    channel: PlaygroundChannels
} & InboundSettings

type SettingsContextValue = {
    resetSettings: () => void
    setSettings: (newState: Partial<SettingsState>) => void
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
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
    const [localSettings, setLocalSettings] = useState<Partial<SettingsState>>(
        {},
    )

    const settingsState = useMemo<SettingsState>(() => {
        return {
            ...DEFAULT_STATE,
            ...localSettings,
        }
    }, [localSettings])

    const resetSettings = useCallback(() => {
        setLocalSettings({})
    }, [])

    useEffect(() => {
        if (settingsState.mode === 'outbound') {
            setLocalSettings((prev) => ({
                ...prev,
                channel: 'sms',
            }))
        }
    }, [settingsState.mode])

    const setSettings = useCallback((newState: Partial<SettingsState>) => {
        setLocalSettings((prev) => ({
            ...prev,
            ...newState,
        }))
    }, [])

    const value = useMemo(
        () => ({
            ...settingsState,
            resetSettings,
            setSettings,
        }),
        [settingsState, resetSettings, setSettings],
    )

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    )
}
