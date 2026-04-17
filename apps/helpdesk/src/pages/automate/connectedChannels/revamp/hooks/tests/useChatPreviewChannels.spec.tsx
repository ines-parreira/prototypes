import type React from 'react'

import { act, renderHook } from '@testing-library/react'

import {
    ChatPreviewChannelsContext,
    useChatPreviewChannels,
    useChatPreviewChannelsContext,
} from '../useChatPreviewChannels'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

const { useParams } = jest.requireMock('react-router-dom')

describe('useChatPreviewChannelsContext', () => {
    it('should throw when used outside of ChatPreviewChannelsContext', () => {
        expect(() => renderHook(() => useChatPreviewChannelsContext())).toThrow(
            'useChatPreviewChannelsContext must be used within ChatPreviewChannelsContext',
        )
    })

    it('should return context value when used inside ChatPreviewChannelsContext', () => {
        const mockSetSelectedChannelId = jest.fn()
        const contextValue = {
            selectedChannelId: 42,
            setSelectedChannelId: mockSetSelectedChannelId,
            shopName: 'my-shop',
        }

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ChatPreviewChannelsContext.Provider value={contextValue}>
                {children}
            </ChatPreviewChannelsContext.Provider>
        )

        const { result } = renderHook(() => useChatPreviewChannelsContext(), {
            wrapper,
        })

        expect(result.current.selectedChannelId).toBe(42)
        expect(result.current.setSelectedChannelId).toBe(
            mockSetSelectedChannelId,
        )
        expect(result.current.shopName).toBe('my-shop')
    })
})

describe('useChatPreviewChannels', () => {
    beforeEach(() => {
        useParams.mockReturnValue({ shopName: 'test-shop' })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return shopName from route params', () => {
        const { result } = renderHook(() => useChatPreviewChannels())

        expect(result.current.shopName).toBe('test-shop')
    })

    it('should initialise selectedChannelId as undefined when no initial value is provided', () => {
        const { result } = renderHook(() => useChatPreviewChannels())

        expect(result.current.selectedChannelId).toBeUndefined()
    })

    it('should initialise selectedChannelId with the provided initial value', () => {
        const { result } = renderHook(() => useChatPreviewChannels(7))

        expect(result.current.selectedChannelId).toBe(7)
    })

    it('should update selectedChannelId when setSelectedChannelId is called', () => {
        const { result } = renderHook(() => useChatPreviewChannels())

        act(() => {
            result.current.setSelectedChannelId(99)
        })

        expect(result.current.selectedChannelId).toBe(99)
    })

    it('should reset selectedChannelId to undefined when setSelectedChannelId is called with undefined', () => {
        const { result } = renderHook(() => useChatPreviewChannels(5))

        act(() => {
            result.current.setSelectedChannelId(undefined)
        })

        expect(result.current.selectedChannelId).toBeUndefined()
    })
})
