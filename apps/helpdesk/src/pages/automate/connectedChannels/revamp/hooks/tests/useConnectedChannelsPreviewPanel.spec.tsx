import { act, renderHook } from '@testing-library/react'

import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import { useConnectedChannelsPreviewPanel } from '../useConnectedChannelsPreviewPanel'

jest.mock('pages/common/hooks/useCollapsibleColumn', () => ({
    useCollapsibleColumn: jest.fn(),
}))

jest.mock(
    '../../components/ConnectedChannelsPreviewPanel/ConnectedChannelsPreviewPanel',
    () => ({
        ConnectedChannelsPreviewPanel: () => (
            <div>ConnectedChannelsPreviewPanel</div>
        ),
    }),
)

describe('useConnectedChannelsPreviewPanel', () => {
    const mockSetCollapsibleColumnChildren = jest.fn()
    const mockSetIsCollapsibleColumnOpen = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useCollapsibleColumn as jest.Mock).mockReturnValue({
            setCollapsibleColumnChildren: mockSetCollapsibleColumnChildren,
            setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
        })
    })

    it('should call setIsCollapsibleColumnOpen with true on mount', () => {
        renderHook(() => useConnectedChannelsPreviewPanel())

        expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(true)
    })

    it('should call setCollapsibleColumnChildren with a component on mount', () => {
        renderHook(() => useConnectedChannelsPreviewPanel())

        expect(mockSetCollapsibleColumnChildren).toHaveBeenCalledTimes(1)
        expect(mockSetCollapsibleColumnChildren).toHaveBeenCalledWith(
            expect.anything(),
        )
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
