import React, { useCallback, useEffect, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { debounce, toPlainObject } from 'lodash'

import { isRealtimeError, useAgentActivity } from '@gorgias/realtime'

import { useFlag } from 'core/flags'
import { TYPING_ACTIVITY_AGENT_TIMEOUT_MS } from 'state/newMessage/constants'
import { reportError } from 'utils/errors'

export type TypingActivityProps = {
    handleTypingActivity: () => void
}

const handlePubNubError = (error: unknown) => {
    if (isRealtimeError(error)) {
        reportError(new Error(`PubNub Status error`), {
            tags: {
                operation: error?.status?.operation ?? 'unknown',
                statusCode: error?.status?.statusCode ?? 'unknown',
                category: error?.status?.category ?? 'unknown',
            },
            extra: { status: toPlainObject(error?.status) },
        })
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
