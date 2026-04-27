import React from 'react'
import type { MutableRefObject } from 'react'

import { render, renderHook } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'

import { useTextOverflow } from '../useTextOverflow'

describe('useTextOverflow', () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should return ref and initial overflow state as false', () => {
        const { result } = renderHook(() => useTextOverflow<HTMLDivElement>())

        expect(result.current.ref.current).toBeNull()
        expect(result.current.isOverflowing).toBe(false)
    })

    const TestTextOverflow = ({
        offsetWidth,
        scrollWidth,
    }: {
        offsetWidth: number
        scrollWidth: number
    }) => {
        const { ref, isOverflowing } = useTextOverflow<HTMLDivElement>()

        return React.createElement(
            React.Fragment,
            null,
            React.createElement('div', {
                ref: (node: HTMLDivElement | null) => {
                    if (node) {
                        Object.defineProperty(node, 'offsetWidth', {
                            configurable: true,
                            value: offsetWidth,
                        })
                        Object.defineProperty(node, 'scrollWidth', {
                            configurable: true,
                            value: scrollWidth,
                        })
                    }
                    ;(ref as MutableRefObject<HTMLDivElement | null>).current =
                        node
                },
            }),
            React.createElement(
                'span',
                { 'data-testid': 'overflow-state' },
                String(isOverflowing),
            ),
        )
    }

    it('should detect overflow when scrollWidth > offsetWidth', async () => {
        render(
            React.createElement(TestTextOverflow, {
                offsetWidth: 100,
                scrollWidth: 200,
            }),
        )

        await waitFor(() => {
            expect(screen.getByTestId('overflow-state')).toHaveTextContent(
                'true',
            )
        })
    })

    it('should not detect overflow when scrollWidth <= offsetWidth', () => {
        render(
            React.createElement(TestTextOverflow, {
                offsetWidth: 200,
                scrollWidth: 100,
            }),
        )

        expect(screen.getByTestId('overflow-state')).toHaveTextContent('false')
    })
})
