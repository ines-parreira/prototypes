import { act, renderHook } from '@testing-library/react'

import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import { useConnectedChannelsPreviewPanel } from '../useConnectedChannelsPreviewPanel'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({
        shopType: 'shopify',
        shopName: 'test-shop',
    })),
}))

jest.mock('pages/common/hooks/useCollapsibleColumn', () => ({
    useCollapsibleColumn: jest.fn(),
}))

jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels', () =>
    jest.fn(),
)

jest.mock(
    '../../components/ConnectedChannelsPreviewPanel/ConnectedChannelsPreviewPanel',
    () => ({
        ConnectedChannelsPreviewPanel: () => (
            <div>ConnectedChannelsPreviewPanel</div>
        ),
    }),
)

const mockUseSelfServiceChatChannels =
    useSelfServiceChatChannels as jest.MockedFunction<
        typeof useSelfServiceChatChannels
    >

const mockChatChannel = {
    type: 'chat',
    value: { id: 1, name: 'Test Channel', meta: { app_id: 'app-1' } },
} as any

describe('useConnectedChannelsPreviewPanel', () => {
    const mockSetCollapsibleColumnChildren = jest.fn()
    const mockSetIsCollapsibleColumnOpen = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useCollapsibleColumn as jest.Mock).mockReturnValue({
            setCollapsibleColumnChildren: mockSetCollapsibleColumnChildren,
            setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
        })
        mockUseSelfServiceChatChannels.mockReturnValue([mockChatChannel])
    })

    it('should call setIsCollapsibleColumnOpen with true on mount when chat channels exist', () => {
        renderHook(() => useConnectedChannelsPreviewPanel())

        expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(true)
    })

    it('should call setCollapsibleColumnChildren with a component on mount when chat channels exist', () => {
        renderHook(() => useConnectedChannelsPreviewPanel())

        expect(mockSetCollapsibleColumnChildren).toHaveBeenCalledTimes(1)
        expect(mockSetCollapsibleColumnChildren).toHaveBeenCalledWith(
            expect.anything(),
        )
    })

    it('should not open the panel when there are no chat channels', () => {
        mockUseSelfServiceChatChannels.mockReturnValue([])

        renderHook(() => useConnectedChannelsPreviewPanel())

        expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
        expect(mockSetCollapsibleColumnChildren).toHaveBeenCalledWith(null)
        expect(mockSetIsCollapsibleColumnOpen).not.toHaveBeenCalledWith(true)
    })

    it('should call setIsCollapsibleColumnOpen with false on unmount', () => {
        const { unmount } = renderHook(() => useConnectedChannelsPreviewPanel())

        act(() => {
            unmount()
        })

        expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
    })

    it('should call setCollapsibleColumnChildren with null on unmount', () => {
        const { unmount } = renderHook(() => useConnectedChannelsPreviewPanel())

        act(() => {
            unmount()
        })

        expect(mockSetCollapsibleColumnChildren).toHaveBeenLastCalledWith(null)
    })
})
