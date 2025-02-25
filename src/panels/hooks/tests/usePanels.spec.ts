import { MouseEvent as ReactMouseEvent } from 'react'

import { act, renderHook } from '@testing-library/react-hooks'

import { Config } from 'panels/types'

import usePanels from '../usePanels'
import useScreenSize from '../useScreenSize'

jest.mock('../useScreenSize')

const useScreenSizeMock = useScreenSize as jest.Mock

describe('usePanels', () => {
    const event = {
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100,
    } as unknown as ReactMouseEvent

    let addEventListenerMock: jest.Mock
    const config = [[200], [Infinity]] as Config

    beforeEach(() => {
        jest.restoreAllMocks()

        addEventListenerMock = jest.spyOn(
            window,
            'addEventListener',
        ) as jest.Mock
        jest.spyOn(window, 'removeEventListener')

        useScreenSizeMock.mockReturnValue([1000, 800])
    })

    it('should return computed panel widths', () => {
        const { result } = renderHook(() => usePanels(config))
        expect(result.current.panelWidths).toEqual([200, 800])
    })

    it('should update panel widths when screen size changes and use existing widths when config has not changed', () => {
        const { result, rerender } = renderHook(
            ({ config }) => usePanels(config),
            {
                initialProps: { config },
            },
        )
        useScreenSizeMock.mockReturnValue([2000, 800])
        rerender({ config })

        expect(result.current.panelWidths).toEqual([200, 1800])
    })

    it('should update panel widths when screen size changes , but recompute widths when config has changed', () => {
        const { result, rerender } = renderHook(
            ({ config }) => usePanels(config),
            {
                initialProps: { config },
            },
        )

        const newConfig = [[300], [Infinity]] as Config
        useScreenSizeMock.mockReturnValue([2000, 800])
        rerender({ config: newConfig })

        expect(result.current.panelWidths).toEqual([300, 1700])
    })

    it('should return a resize start handler for each handle', () => {
        const { result } = renderHook(() => usePanels(config))
        expect(result.current.resizeStartHandlers).toEqual([
            expect.any(Function),
        ])
    })

    it('should attach mouse handlers when a drag starts', () => {
        const { result } = renderHook(() => usePanels(config))

        act(() => {
            result.current.resizeStartHandlers[0](event)
        })

        expect(event.preventDefault).toHaveBeenCalledWith()
        expect(window.addEventListener).toHaveBeenCalledWith(
            'mouseup',
            expect.any(Function),
        )
        expect(window.addEventListener).toHaveBeenCalledWith(
            'mousemove',
            expect.any(Function),
        )
    })

    it('should return new panel widths when the mouse is moved', () => {
        const { result } = renderHook(() => usePanels(config))

        act(() => {
            result.current.resizeStartHandlers[0](event)
        })

        const mouseMoveCall = addEventListenerMock.mock.calls.find(
            ([eventName]) => eventName === 'mousemove',
        ) as [string, (ev: MouseEvent) => void]
        const mouseMove = mouseMoveCall[1]

        act(() => {
            mouseMove({ clientX: 90 } as MouseEvent)
        })

        expect(result.current.panelWidths).toEqual([190, 810])
    })

    it('should remove event listeners when a drag stops', () => {
        const { result } = renderHook(() => usePanels(config))

        act(() => {
            result.current.resizeStartHandlers[0](event)
        })

        const mouseUpCall = addEventListenerMock.mock.calls.find(
            ([eventName]) => eventName === 'mouseup',
        ) as [string, () => void]
        const mouseUp = mouseUpCall[1]

        act(() => {
            mouseUp()
        })

        expect(window.removeEventListener).toHaveBeenCalledWith(
            'mouseup',
            expect.any(Function),
        )
        expect(window.removeEventListener).toHaveBeenCalledWith(
            'mousemove',
            expect.any(Function),
        )
    })
})
