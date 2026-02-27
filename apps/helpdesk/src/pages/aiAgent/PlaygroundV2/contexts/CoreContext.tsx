import type { ReactNode } from 'react'
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import { useSearchParams } from '@repo/routing'

import type { AiAgentPlaygroundOptions } from 'models/aiAgent/types'
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
    createTestSession: (
        overridePayload?: AiAgentPlaygroundOptions,
    ) => Promise<string>
    clearTestSession: () => void
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
    useV3: boolean
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

    const [searchParams, setSearchParams] = useSearchParams()
    const useV3 = useRef(searchParams.get('use-v3') === 'true')
    const externalSessionId = useRef(
        searchParams.get('session-id') ?? undefined,
    )
    const syncedSessionId = useRef(externalSessionId.current)

    const sessionState = useTestSession(
        baseUrl,
        {
            areActionsAllowedToExecute: areActionsEnabled ?? false,
        },
        useV3.current,
        externalSessionId.current,
    )

    const pollingState = usePlaygroundPolling({
        testSessionId: sessionState.testSessionId ?? undefined,
        baseUrl: baseUrl,
        useV3: useV3.current,
    })

    useEffect(() => {
        if (!useV3.current) {
            return
        }

        if (!sessionState.testSessionId) {
            return
        }

        if (syncedSessionId.current === sessionState.testSessionId) {
            return
        }

        const nextSearchParams = new URLSearchParams(searchParams)
        nextSearchParams.set('session-id', sessionState.testSessionId)
        setSearchParams(nextSearchParams)
        syncedSessionId.current = sessionState.testSessionId
    }, [searchParams, sessionState.testSessionId, setSearchParams])

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
            useV3: useV3.current,
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
