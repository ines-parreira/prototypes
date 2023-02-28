import _noop from 'lodash/noop'
import {createContext} from 'react'

type MessageContextState = {
    expandedQuotes: number[]
    toggleQuote: (messageId: number | undefined) => void
}

const MessageQuoteContext = createContext<MessageContextState>({
    expandedQuotes: [],
    toggleQuote: _noop,
})

export default MessageQuoteContext
