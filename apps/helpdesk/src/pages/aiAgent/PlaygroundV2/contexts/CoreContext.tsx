import type { ReactNode } from 'react'
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react'

import type { GetTestSessionLogsResponse } from 'models/aiAgentPlayground/types'
import { useAiAgentHttpIntegration } from 'pages/aiAgent/PlaygroundV2/hooks/useAiAgentHttpIntegration'
import { useDraftKnowledgeSync } from 'pages/aiAgent/PlaygroundV2/hooks/useDraftKnowledge'
import { usePlaygroundPolling } from 'pages/aiAgent/PlaygroundV2/hooks/usePlaygroundPolling'
import { useTestSession } from 'pages/aiAgent/PlaygroundV2/hooks/useTestSession'

import { usePlaygroundChannel } from '../hooks/usePlaygroundChannel'
import type {
    DraftKnowledge,
    PlaygroundChannelAvailability,
    PlaygroundChannels,
} from '../types'

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
    isDraftKnowledgeReady: boolean
    draftKnowledge?: DraftKnowledge
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
    draftKnowledge?: DraftKnowledge
}

export const CoreProvider = ({
    children,
    arePlaygroundActionsAllowed,
    draftKnowledge,
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

    const { isDraftKnowledgeReady } = useDraftKnowledgeSync(draftKnowledge)

    const resetToDefaultActionsEnabled = useCallback(() => {
        setAreActionsEnabledInSettings(DEFAULT_ACTIONS_ENABLED)
    }, [])

    const contextValue: CoreContextValue = useMemo(
        () => ({
            ...sessionState,
            ...pollingState,
            ...channelState,
            isDraftKnowledgeReady,
            draftKnowledge,
            areActionsEnabled,
            resetToDefaultActionsEnabled,
            setAreActionsEnabled: setAreActionsEnabledInSettings,
        }),
        [
            isDraftKnowledgeReady,
            draftKnowledge,
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
