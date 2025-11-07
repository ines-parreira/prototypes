import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react'

import { GetTestSessionLogsResponse } from 'models/aiAgentPlayground/types'
import { useAiAgentHttpIntegration } from 'pages/aiAgent/PlaygroundV2/hooks/useAiAgentHttpIntegration'
import { usePlaygroundPolling } from 'pages/aiAgent/PlaygroundV2/hooks/usePlaygroundPolling'
import { useTestSession } from 'pages/aiAgent/PlaygroundV2/hooks/useTestSession'

import { usePlaygroundChannel } from '../hooks/usePlaygroundChannel'
import { PlaygroundChannelAvailability, PlaygroundChannels } from '../types'

const DEFAULT_ACTIONS_ENABLED = false

type CoreContextValue = {
    testSessionId: string | null
    isTestSessionLoading: boolean
    // TODO: Refactor to make function indempotent
    // getOrCreateTestSession: () => Promise<string>
    createTestSession: () => Promise<string>
    testSessionLogs?: GetTestSessionLogsResponse
    isPolling: boolean
    startPolling: () => void
    stopPolling: () => void
    channel: PlaygroundChannels
    channelAvailability: PlaygroundChannelAvailability
    onChannelChange: (channel: PlaygroundChannels) => void
    onChannelAvailabilityChange: (
        availability: PlaygroundChannelAvailability,
    ) => void
    setAreActionsEnabled: (value: boolean) => void
    areActionsEnabled: boolean
    resetToDefaultChannel: () => void
    resetToDefaultActionsEnabled: () => void
}

const CoreContext = createContext<CoreContextValue | undefined>(undefined)

export const useCoreContext = () => {
    const context = useContext(CoreContext)
    if (!context) {
        throw new Error(
            'usePlaygroundStateContext must be used within PlaygroundStateProvider',
        )
    }
    return context
}

type CoreProviderProps = {
    children: ReactNode
    arePlaygroundActionsAllowed?: boolean
}

export const CoreProvider = ({
    children,
    arePlaygroundActionsAllowed,
}: CoreProviderProps) => {
    const [areActionsEnabledInSettings, setAreActionsEnabledInSettings] =
        useState(DEFAULT_ACTIONS_ENABLED)
    const areActionsEnabled =
        arePlaygroundActionsAllowed || areActionsEnabledInSettings
    const { baseUrl } = useAiAgentHttpIntegration()
    const channelState = usePlaygroundChannel()
    const sessionState = useTestSession(baseUrl, {
        areActionsAllowedToExecute: areActionsEnabled ?? false,
    })
    const pollingState = usePlaygroundPolling({
        testSessionId: sessionState.testSessionId ?? undefined,
        baseUrl: baseUrl,
    })
    const resetToDefaultActionsEnabled = useCallback(() => {
        setAreActionsEnabledInSettings(DEFAULT_ACTIONS_ENABLED)
    }, [])

    const contextValue: CoreContextValue = useMemo(
        () => ({
            ...sessionState,
            ...pollingState,
            ...channelState,
            areActionsEnabled,
            resetToDefaultActionsEnabled,
            setAreActionsEnabled: setAreActionsEnabledInSettings,
        }),
        [
            sessionState,
            pollingState,
            channelState,
            areActionsEnabled,
            resetToDefaultActionsEnabled,
        ],
    )

    return (
        <CoreContext.Provider value={contextValue}>
            {children}
        </CoreContext.Provider>
    )
}
