import { useCallback, useEffect, useState } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useNotify } from 'hooks/useNotify'
import { useCreateTestSessionMutation } from 'models/aiAgent/queries'
import type { AiAgentPlaygroundOptions } from 'models/aiAgent/types'
import { NotificationStatus } from 'state/notifications/types'

export const useTestSession = (
    baseUrl?: string,
    payload?: AiAgentPlaygroundOptions,
    useV3?: boolean,
    externalSessionId?: string,
) => {
    const { notify } = useNotify()
    const [testSessionId, setTestSessionId] = useState<string | null>(
        externalSessionId ?? null,
    )
    const {
        mutateAsync: createTestSessionAsync,
        isLoading,
        data,
        error,
    } = useCreateTestSessionMutation()

    const createTestSession = useCallback(
        async (overridePayload?: AiAgentPlaygroundOptions) => {
            const data = await createTestSessionAsync([
                baseUrl,
                overridePayload || payload,
                useV3,
            ])
            const testSessionId = data?.testModeSession.id

            setTestSessionId(testSessionId)
            return testSessionId
        },
        [createTestSessionAsync, payload, baseUrl, useV3],
    )

    useEffect(() => {
        const testSessionId = data?.testModeSession.id

        if (testSessionId) {
            setTestSessionId(testSessionId)
        }
    }, [data])

    useEffect(() => {
        if (error) {
            reportError(error, {
                tags: { team: SentryTeam.AI_AGENT },
                extra: {
                    context: 'Error creating test session',
                },
            })

            notify({
                status: NotificationStatus.Error,
                message:
                    'Error creating test session. Please reload the page or contact support.',
            })
        }
    }, [error, notify])

    const clearTestSession = useCallback(() => {
        setTestSessionId(null)
    }, [])

    return {
        testSessionId,
        isTestSessionLoading: isLoading,
        createTestSession,
        clearTestSession,
    }
}
