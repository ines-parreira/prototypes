import {
    act,
    render,
    renderHook,
    screen,
    waitFor,
} from '@testing-library/react'
import { vi } from 'vitest'

import { useContextValue } from '../useContextValue'

describe('useContextValue', () => {
    it('should return the panels api', () => {
        const { result } = renderHook(() => useContextValue(null, 1000))
        expect(result.current).toEqual({
            addHandle: expect.any(Function),
            addPanel: expect.any(Function),
            subtractSize: expect.any(Function),
            totalSize: 0,
        })
    })

    it('should add and remove a panel', async () => {
        const Wrapper = () => {
            return (
                <div data-testid="container">
                    <div data-panel-name="panel1" />
                </div>
            )
        }
        render(<Wrapper />)
        const container = screen.getByTestId('container')

        const { result } = renderHook(() =>
            useContextValue(container as HTMLDivElement, 1000),
        )

        const config = {
            defaultSize: 200,
            minSize: 100,
            maxSize: 300,
        }
        const listener = vi.fn()
        let removePanel: () => void
        act(() => {
            removePanel = result.current.addPanel('panel1', config, listener)
        })
        await waitFor(() => {
            expect(listener).toHaveBeenCalledWith({ size: 300 })
            expect(result.current.totalSize).toBe(300)
        })

        act(() => {
            removePanel()
        })

        await waitFor(() => {
            expect(result.current.totalSize).toBe(0)
        })
    })

    it('should subtract and restore size from the total', () => {
        const { result } = renderHook(() => useContextValue(null, 1000))
        let restoreSize: () => void
        act(() => {
            restoreSize = result.current.subtractSize(10)
        })

        expect(result.current.totalSize).toBe(10)

        act(() => {
            restoreSize()
        })
        expect(result.current.totalSize).toBe(0)
    })
})
