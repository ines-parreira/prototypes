import { useCallback, useState } from 'react'
import { xor } from '@gorgias/toolkit'

export function useExpandedMessages() {
    const [messages, setMessages] = useState<number[]>([])

    const toggleMessage = useCallback((messageId: number | undefined) => {
        if (!messageId) return
        setMessages((msgs) => xor(msgs, [messageId]))
    }, [])

    return [messages, toggleMessage] as const
}
