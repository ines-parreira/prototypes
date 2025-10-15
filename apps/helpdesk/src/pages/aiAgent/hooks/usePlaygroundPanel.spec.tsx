import { act, renderHook, waitFor } from '@testing-library/react'
import { useParams } from 'react-router'

import { usePlaygroundPanel } from './usePlaygroundPanel'

jest.mock('pages/AppContext')
jest.mock('react-router', () => ({
    useParams: jest.fn(),
}))
jest.mock('../components/PlaygroundPanel/PlaygroundPanel', () => ({
    PlaygroundPanel: () => <div>PlaygroundPanel</div>,
}))

const mockUseAppContext = require('pages/AppContext').useAppContext as jest.Mock
const mockUseParams = jest.mocked(useParams)

describe('usePlaygroundPanel', () => {
    const mockSetCollapsibleColumnChildren = jest.fn()
    const mockSetIsCollapsibleColumnOpen = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()

        mockUseAppContext.mockReturnValue({
            setCollapsibleColumnChildren: mockSetCollapsibleColumnChildren,
            isCollapsibleColumnOpen: false,
            setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
        })

        mockUseParams.mockReturnValue({})
    })

    afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    })

    describe('openPlayground', () => {
        it('should set playground panel as collapsible column children', async () => {
            const { result } = renderHook(() => usePlaygroundPanel())

            await act(async () => {
                await result.current.openPlayground()
            })

            expect(mockSetCollapsibleColumnChildren).toHaveBeenCalledWith(
                expect.objectContaining({ type: expect.any(Function) }),
            )
        })

        it('should open collapsible column', async () => {
            const { result } = renderHook(() => usePlaygroundPanel())

            await act(async () => {
                await result.current.openPlayground()
            })

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(true)
        })
    })

    describe('closePlayground', () => {
        it('should close collapsible column', async () => {
            const { result } = renderHook(() => usePlaygroundPanel())

            await act(async () => {
                result.current.closePlayground()
            })

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
        })

        it('should clear children after 300ms delay', async () => {
            const { result } = renderHook(() => usePlaygroundPanel())

            act(() => {
                result.current.closePlayground()
            })

            expect(mockSetCollapsibleColumnChildren).not.toHaveBeenCalledWith(
                null,
            )

            act(() => {
                jest.advanceTimersByTime(300)
            })

            await waitFor(() => {
                expect(mockSetCollapsibleColumnChildren).toHaveBeenCalledWith(
                    null,
                )
            })
        })

        it('should call setIsCollapsibleColumnOpen before clearing children', async () => {
            const { result } = renderHook(() => usePlaygroundPanel())

            act(() => {
                result.current.closePlayground()
            })

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
            expect(mockSetCollapsibleColumnChildren).not.toHaveBeenCalledWith(
                null,
            )

            act(() => {
                jest.advanceTimersByTime(300)
            })

            await waitFor(() => {
                expect(mockSetCollapsibleColumnChildren).toHaveBeenCalledWith(
                    null,
                )
            })
        })
    })

    describe('togglePlayground', () => {
        it('should open playground when closed', async () => {
            mockUseAppContext.mockReturnValue({
                setCollapsibleColumnChildren: mockSetCollapsibleColumnChildren,
                isCollapsibleColumnOpen: false,
                setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
            })

            const { result } = renderHook(() => usePlaygroundPanel())

            await act(async () => {
                await result.current.togglePlayground()
            })

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(true)
        })

        it('should close playground when open', async () => {
            mockUseAppContext.mockReturnValue({
                setCollapsibleColumnChildren: mockSetCollapsibleColumnChildren,
                isCollapsibleColumnOpen: true,
                setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
            })

            const { result } = renderHook(() => usePlaygroundPanel())

            await act(async () => {
                result.current.togglePlayground()
            })

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
        })

        it('should reflect current state in isPlaygroundOpen', () => {
            mockUseAppContext.mockReturnValue({
                setCollapsibleColumnChildren: mockSetCollapsibleColumnChildren,
                isCollapsibleColumnOpen: true,
                setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
            })

            const { result } = renderHook(() => usePlaygroundPanel())

            expect(result.current.isPlaygroundOpen).toBe(true)
        })
    })

    describe('isPlaygroundOpen', () => {
        it('should return false when playground is closed', () => {
            mockUseAppContext.mockReturnValue({
                setCollapsibleColumnChildren: mockSetCollapsibleColumnChildren,
                isCollapsibleColumnOpen: false,
                setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
            })

            const { result } = renderHook(() => usePlaygroundPanel())

            expect(result.current.isPlaygroundOpen).toBe(false)
        })

        it('should return true when playground is open', () => {
            mockUseAppContext.mockReturnValue({
                setCollapsibleColumnChildren: mockSetCollapsibleColumnChildren,
                isCollapsibleColumnOpen: true,
                setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
            })

            const { result } = renderHook(() => usePlaygroundPanel())

            expect(result.current.isPlaygroundOpen).toBe(true)
        })
    })

    describe('shopName from params', () => {
        it('should pass shopName from params to PlaygroundPanel', async () => {
            mockUseParams.mockReturnValue({ shopName: 'test-shop' })

            const { result } = renderHook(() => usePlaygroundPanel())

            await act(async () => {
                await result.current.openPlayground()
            })

            expect(mockSetCollapsibleColumnChildren).toHaveBeenCalledWith(
                expect.objectContaining({
                    props: expect.objectContaining({ shopName: 'test-shop' }),
                }),
            )
        })

        it('should create new playground panel when shopName changes', async () => {
            const { result, rerender } = renderHook(() => usePlaygroundPanel())

            await act(async () => {
                await result.current.openPlayground()
            })

            const firstCallIndex =
                mockSetCollapsibleColumnChildren.mock.calls.length - 1
            const firstPanel =
                mockSetCollapsibleColumnChildren.mock.calls[firstCallIndex]?.[0]

            mockUseParams.mockReturnValue({ shopName: 'different-shop' })

            rerender()

            await act(async () => {
                await result.current.openPlayground()
            })

            const secondCallIndex =
                mockSetCollapsibleColumnChildren.mock.calls.length - 1
            const secondPanel =
                mockSetCollapsibleColumnChildren.mock.calls[
                    secondCallIndex
                ]?.[0]

            expect(firstPanel).not.toBe(secondPanel)
        })
    })

    describe('callback stability', () => {
        it('should maintain stable callback references', () => {
            const { result, rerender } = renderHook(() => usePlaygroundPanel())

            const firstOpenPlayground = result.current.openPlayground
            const firstClosePlayground = result.current.closePlayground
            const firstTogglePlayground = result.current.togglePlayground

            rerender()

            expect(result.current.openPlayground).toBe(firstOpenPlayground)
            expect(result.current.closePlayground).toBe(firstClosePlayground)
            expect(result.current.togglePlayground).toBe(firstTogglePlayground)
        })

        it('should update callbacks when shopName changes', () => {
            const { result, rerender } = renderHook(() => usePlaygroundPanel())

            const firstOpenPlayground = result.current.openPlayground

            mockUseParams.mockReturnValue({ shopName: 'new-shop' })
            rerender()

            expect(result.current.openPlayground).not.toBe(firstOpenPlayground)
        })
    })

    describe('edge cases', () => {
        it('should handle multiple rapid open calls', async () => {
            const { result } = renderHook(() => usePlaygroundPanel())

            await act(async () => {
                await Promise.all([
                    result.current.openPlayground(),
                    result.current.openPlayground(),
                    result.current.openPlayground(),
                ])
            })

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(true)
        })

        it('should handle multiple rapid close calls', async () => {
            const { result } = renderHook(() => usePlaygroundPanel())

            act(() => {
                result.current.closePlayground()
                result.current.closePlayground()
                result.current.closePlayground()
            })

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
        })

        it('should handle rapid toggle calls', async () => {
            const { result, rerender } = renderHook(() => usePlaygroundPanel())

            await act(async () => {
                await result.current.togglePlayground()
            })

            mockUseAppContext.mockReturnValue({
                setCollapsibleColumnChildren: mockSetCollapsibleColumnChildren,
                isCollapsibleColumnOpen: true,
                setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
            })

            rerender()

            act(() => {
                result.current.togglePlayground()
            })

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledTimes(2)
        })
    })
})
