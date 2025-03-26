import React, { useCallback } from 'react'

import _debounce from 'lodash/debounce'
import _throttle from 'lodash/throttle'

import { useAgentActivity } from '@gorgias/realtime'

import { TYPING_ACTIVITY_AGENT_TIMEOUT_MS } from 'state/newMessage/constants'

export type TypingActivityProps = {
    handleTypingActivity: () => void
}

export default function withTypingActivity<P>(
    WrappedComponent: React.ComponentType<P & TypingActivityProps>,
) {
    return function WithTypingActivityWrapper(props: P) {
        const { startTyping, stopTyping } = useAgentActivity()

        // eslint-disable-next-line react-hooks/exhaustive-deps
        const throttledStartTyping = useCallback(
            _throttle(startTyping, TYPING_ACTIVITY_AGENT_TIMEOUT_MS, {
                trailing: false,
            }),
            [startTyping],
        )

        // eslint-disable-next-line react-hooks/exhaustive-deps
        const debouncedStopTyping = useCallback(
            _debounce(stopTyping, TYPING_ACTIVITY_AGENT_TIMEOUT_MS),
            [stopTyping],
        )

        const handleTypingActivity = useCallback(() => {
            throttledStartTyping()
            debouncedStopTyping()
        }, [throttledStartTyping, debouncedStopTyping])

        React.useEffect(() => {
            return () => {
                throttledStartTyping.cancel()
                debouncedStopTyping.cancel()
            }
        }, [throttledStartTyping, debouncedStopTyping])

        return (
            <WrappedComponent
                {...props}
                handleTypingActivity={handleTypingActivity}
            />
        )
    }
}
