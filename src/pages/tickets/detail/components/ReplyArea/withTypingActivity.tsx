import React, { useCallback, useEffect, useState } from 'react'

import { debounce, toPlainObject } from 'lodash'

import {
    isRealtimeError,
    RealtimeError,
    useAgentActivity,
} from '@gorgias/realtime'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { TYPING_ACTIVITY_AGENT_TIMEOUT_MS } from 'state/newMessage/constants'
import { reportError } from 'utils/errors'

export type TypingActivityProps = {
    handleTypingActivity: () => void
}

const handlePubNubError = (error: unknown) => {
    if (isRealtimeError(error)) {
        const status = toPlainObject(error?.status) as RealtimeError['status']
        reportError(
            new Error(
                `Realtime typing status error with statusCode: ${status.statusCode ?? 'unknown'}`,
            ),
            {
                extra: { status },
            },
        )
    }
}

export default function withTypingActivity<P>(
    WrappedComponent: React.ComponentType<P & TypingActivityProps>,
) {
    return function WithTypingActivityWrapper(props: P) {
        const [isTyping, setIsTyping] = useState(false)
        const { startTyping, stopTyping } = useAgentActivity()
        const isCatchPNErrorsEnabled = useFlag(FeatureFlagKey.CatchPNErrors)

        // eslint-disable-next-line exhaustive-deps
        const debouncedStopTyping = useCallback(
            debounce(() => {
                setIsTyping(false)
            }, TYPING_ACTIVITY_AGENT_TIMEOUT_MS),
            [],
        )

        const handleStartTyping = useCallback(async () => {
            if (isTyping) {
                try {
                    await startTyping()
                } catch (error) {
                    isCatchPNErrorsEnabled && handlePubNubError(error)
                }
            }
        }, [isTyping, startTyping, isCatchPNErrorsEnabled])

        const handleStopTyping = useCallback(async () => {
            if (isTyping) {
                try {
                    await stopTyping()
                } catch (error) {
                    isCatchPNErrorsEnabled && handlePubNubError(error)
                }
            }
        }, [isTyping, stopTyping, isCatchPNErrorsEnabled])

        useEffect(() => {
            handleStartTyping()

            return () => {
                handleStopTyping()
            }
        }, [handleStartTyping, handleStopTyping])

        const handleTypingActivity = useCallback(() => {
            setIsTyping(true)
            debouncedStopTyping()
        }, [])

        return (
            <WrappedComponent
                {...props}
                handleTypingActivity={handleTypingActivity}
            />
        )
    }
}
