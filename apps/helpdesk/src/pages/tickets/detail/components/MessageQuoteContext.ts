import { createContext, useContext } from 'react'
import { noop } from '@gorgias/toolkit'

type MessageContextState = {
    expandedQuotes: number[]
    toggleQuote: (messageId: number | undefined) => void
}

const MessageQuoteContext = createContext<MessageContextState>({
    expandedQuotes: [],
    toggleQuote: noop,
})

export { MessageQuoteContext }

export const useMessageQuote = () => {
    const context = useContext(MessageQuoteContext)
    if (!context) {
        throw new Error(
            'useMessageQuote must be used within a MessageQuoteContextProvider',
        )
    }
    return context
}
