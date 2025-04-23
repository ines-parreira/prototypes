import React, { useCallback, useEffect, useState } from 'react'

import { debounce, isObject, toPlainObject } from 'lodash'

import { useAgentActivity } from '@gorgias/realtime'

import { TYPING_ACTIVITY_AGENT_TIMEOUT_MS } from 'state/newMessage/constants'
import { reportError } from 'utils/errors'

export type TypingActivityProps = {
    handleTypingActivity: () => void
}

const handlePubNubError = (error: unknown) => {
    const status =
        isObject(error) && 'status' in error
            ? toPlainObject(error?.status)
            : undefined
    reportError(new Error('Realtime typing status error'), {
        extra: { status },
    })
}

export default function withTypingActivity<P>(
    WrappedComponent: React.ComponentType<P & TypingActivityProps>,
) {
    return function WithTypingActivityWrapper(props: P) {
        const [isTyping, setIsTyping] = useState(false)
        const { startTyping, stopTyping } = useAgentActivity()

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
                    handlePubNubError(error)
                }
            }
        }, [isTyping, startTyping])

        const handleStopTyping = useCallback(async () => {
            if (isTyping) {
                try {
                    await stopTyping()
                } catch (error) {
                    handlePubNubError(error)
                }
            }
        }, [isTyping, stopTyping])

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
