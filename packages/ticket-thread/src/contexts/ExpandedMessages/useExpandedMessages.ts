import { useContext } from 'react'

import { ExpandedMessagesContext } from './context'

export function useExpandedMessages() {
    const context = useContext(ExpandedMessagesContext)

    if (!context) {
        throw new Error(
            'useExpandedMessages must be used within ExpandedMessagesProvider',
        )
    }

    return context
}
