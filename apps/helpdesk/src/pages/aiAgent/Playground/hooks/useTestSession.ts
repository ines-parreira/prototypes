import { useCallback, useEffect, useState } from 'react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useNotify } from 'hooks/useNotify'
import { useCreateTestSessionMutation } from 'models/aiAgent/queries'
import { AiAgentPlaygroundOptions } from 'models/aiAgent/types'
import { NotificationStatus } from 'state/notifications/types'
import { reportError } from 'utils/errors'

export const useTestSession = (
    baseUrl?: string,
    payload?: AiAgentPlaygroundOptions,
) => {
    const { notify } = useNotify()
    const [testSessionId, setTestSessionId] = useState<string | null>(null)
    const {
        mutateAsync: createTestSessionAsync,
        isLoading,
        data,
        error,
    } = useCreateTestSessionMutation()

    const createTestSession = useCallback(async () => {
        const data = await createTestSessionAsync([baseUrl, payload])
        const testSessionId = data?.testModeSession.id

        if (testSessionId) {
            setTestSessionId(testSessionId)
            return testSessionId
        }

        return null
    }, [createTestSessionAsync, payload, baseUrl])

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

    return {
        testSessionId,
        isTestSessionLoading: isLoading,
        createTestSession,
    }
}
