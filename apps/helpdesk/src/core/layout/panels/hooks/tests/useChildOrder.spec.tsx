import React, { useState } from 'react'

import { renderHook } from '@repo/testing'
import { render } from '@testing-library/react'

import useChildOrder from '../useChildOrder'

describe('useChildOrder', () => {
    it('should return an empty state if there is no container', () => {
        const { result } = renderHook(() => useChildOrder(null, [], []))
        expect(result.current).toEqual({ handlesMap: {}, panelOrder: [] })
    })

    it('should return an empty array if no panel names are given', () => {
        let result: ReturnType<typeof useChildOrder> | null = null
        const Test = () => {
            const [container, setContainer] = useState<HTMLDivElement | null>(
                null,
            )
            result = useChildOrder(container, [], [])

            return <div ref={setContainer} />
        }

        render(<Test />)
        expect(result).toEqual({ handlesMap: {}, panelOrder: [] })
    })

    it('should return panel names and a map of handles in the order they appear in the DOM', () => {
        let handles: Record<string, string> = {}
        let order: string[] = []

        const Test = () => {
            const [container, setContainer] = useState<HTMLDivElement | null>(
                null,
            )
            const { handlesMap, panelOrder } = useChildOrder(
                container,
                ['panel2', 'panel4', 'panel3', 'panel1'],
                ['handle-23', 'handle-98'],
            )
            handles = handlesMap
            order = panelOrder

            return (
                <div ref={setContainer}>
                    <div data-panel-name="panel1" />
                    <div data-panel-name="panel2" />
                    <div data-handle-id="handle-23" />
                    <div data-panel-name="panel3" />
                    <div data-handle-id="handle-98" />
                    <div data-panel-name="panel4" />
                </div>
            )
        }

        render(<Test />)
        expect(handles).toEqual({ panel3: 'handle-23', panel4: 'handle-98' })
        expect(order).toEqual(['panel1', 'panel2', 'panel3', 'panel4'])
    })
})
