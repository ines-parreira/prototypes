import type React from 'react'
import { useCallback, useEffect, useState } from 'react'

import { debounce } from 'lodash'

import { useAgentActivity } from '@gorgias/realtime'

import { TYPING_ACTIVITY_AGENT_TIMEOUT_MS } from 'state/newMessage/constants'

export type TypingActivityProps = {
    handleTypingActivity: () => void
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
                } catch {}
            }
        }, [isTyping, startTyping])

        const handleStopTyping = useCallback(async () => {
            if (isTyping) {
                try {
                    await stopTyping()
                } catch {}
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
            // oxlint-disable-next-line exhaustive-deps
        }, [])

        return (
            <WrappedComponent
                {...props}
                handleTypingActivity={handleTypingActivity}
            />
        )
    }
}
