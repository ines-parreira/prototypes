import { renderHook } from '@repo/testing'
import { act, render, waitFor } from '@testing-library/react'

import { usePredictionIconPositionAdjuster } from '../usePredictionIconPositionAdjuster'

describe('usePredictionIconPositionAdjuster', () => {
    it('should set reference of hidden text', async () => {
        const { result } = renderHook(() =>
            usePredictionIconPositionAdjuster({
                value: 'inputValue',
                inputDimensions: {
                    width: 100,
                } as DOMRect,
                shouldShowIcon: false,
            }),
        )
        act(() => {
            render(<div ref={result.current.hiddenRef} />)

            waitFor(() => {
                expect(result.current).toMatchObject({
                    hiddenRef: { current: expect.any(Element) },
                })
            })
        })
    })

    it('should set icon left position relative to hidden text', async () => {
        const { result, rerender } = renderHook(() =>
            usePredictionIconPositionAdjuster({
                value: 'inputValue',
                inputDimensions: {
                    width: 100,
                } as DOMRect,
                shouldShowIcon: true,
            }),
        )
        act(() => {
            render(<div ref={result.current.hiddenRef} />)
            rerender()

            waitFor(() => {
                expect(result.current).toMatchObject({
                    iconLeft: 6,
                    hiddenRef: { current: expect.any(Element) },
                })
            })
        })
    })

    it('should set icon left position relative to the limit defined by the input', async () => {
        const { result, rerender } = renderHook(() =>
            usePredictionIconPositionAdjuster({
                value: 'inputValue',
                inputDimensions: {
                    width: 15,
                } as DOMRect,
                shouldShowIcon: true,
            }),
        )
        act(() => {
            render(<div ref={result.current.hiddenRef} />)
            rerender()

            waitFor(() => {
                expect(result.current).toMatchObject({
                    iconLeft: -2,
                    hiddenRef: { current: expect.any(Element) },
                })
            })
        })
    })
})
