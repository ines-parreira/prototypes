import { createContext, useContext } from 'react'

import _noop from 'lodash/noop'

type MessageContextState = {
    expandedQuotes: number[]
    toggleQuote: (messageId: number | undefined) => void
}

const MessageQuoteContext = createContext<MessageContextState>({
    expandedQuotes: [],
    toggleQuote: _noop,
})

export default MessageQuoteContext

export const useMessageQuote = () => {
    const context = useContext(MessageQuoteContext)
    if (!context) {
        throw new Error(
            'useMessageQuote must be used within a MessageQuoteContextProvider',
        )
    }
    return context
}
