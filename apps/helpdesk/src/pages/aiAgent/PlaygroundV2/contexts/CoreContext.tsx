import { createContext, ReactNode, useContext } from 'react'

import { GetTestSessionLogsResponse } from 'models/aiAgentPlayground/types'
import { useAiAgentHttpIntegration } from 'pages/aiAgent/PlaygroundV2/hooks/useAiAgentHttpIntegration'
import { usePlaygroundPolling } from 'pages/aiAgent/PlaygroundV2/hooks/usePlaygroundPolling'
import { useTestSession } from 'pages/aiAgent/PlaygroundV2/hooks/useTestSession'

import { usePlaygroundChannel } from '../hooks/usePlaygroundChannel'
import { PlaygroundChannelAvailability, PlaygroundChannels } from '../types'

type CoreContextValue = {
    testSessionId: string | null
    isTestSessionLoading: boolean
    // TODO: Refactor to make function indempotent
    // getOrCreateTestSession: () => Promise<string>
    createTestSession: () => Promise<string | null>
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
    const { baseUrl } = useAiAgentHttpIntegration()
    const channelState = usePlaygroundChannel()
    const sessionState = useTestSession(baseUrl, {
        areActionsAllowedToExecute: arePlaygroundActionsAllowed ?? false,
    })
    const pollingState = usePlaygroundPolling({
        testSessionId: sessionState.testSessionId ?? undefined,
        baseUrl: baseUrl,
    })

    const contextValue: CoreContextValue = {
        ...sessionState,
        ...pollingState,
        ...channelState,
    }

    return (
        <CoreContext.Provider value={contextValue}>
            {children}
        </CoreContext.Provider>
    )
}
