import _xor from 'lodash/xor'
import {useCallback, useState} from 'react'

export default function useExpandedMessages() {
    const [messages, setMessages] = useState<number[]>([])

    const toggleMessage = useCallback((messageId: number | undefined) => {
        if (!messageId) return
        setMessages((msgs) => _xor(msgs, [messageId]))
    }, [])

    return [messages, toggleMessage] as const
}
