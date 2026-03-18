import { renderHook } from '@testing-library/react'

import { useExpandedMessages } from '../useExpandedMessages'

describe('useExpandedMessages', () => {
    it('throws when used outside ExpandedMessagesProvider', () => {
        expect(() => renderHook(() => useExpandedMessages())).toThrow(
            'useExpandedMessages must be used within ExpandedMessagesProvider',
        )
    })
})
