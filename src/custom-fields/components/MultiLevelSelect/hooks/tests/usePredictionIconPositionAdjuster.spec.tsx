import React from 'react'

import { act, render } from '@testing-library/react'

import { renderHook } from 'utils/testing/renderHook'

import { usePredictionIconPositionAdjuster } from '../usePredictionIconPositionAdjuster'

describe('usePredictionIconPositionAdjuster', () => {
    it('should set reference of hidden text', () => {
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

            expect(result.current).toMatchObject({
                hiddenRef: { current: expect.any(Element) },
            })
        })
    })

    it('should set icon left position relative to hidden text', () => {
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

            expect(result.current).toMatchObject({
                iconLeft: 6,
                hiddenRef: { current: expect.any(Element) },
            })
        })
    })

    it('should set icon left position relative to the limit defined by the input', () => {
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

            expect(result.current).toMatchObject({
                iconLeft: -2,
                hiddenRef: { current: expect.any(Element) },
            })
        })
    })
})
