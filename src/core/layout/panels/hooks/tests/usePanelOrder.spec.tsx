import {render} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'
import React, {useState} from 'react'

import usePanelOrder from '../usePanelOrder'

describe('usePanelOrder', () => {
    it('should return an empty array if there is no container', () => {
        const {result} = renderHook(() => usePanelOrder(null, []))
        expect(result.current).toEqual([])
    })

    it('should return an empty array if no panel names are given', () => {
        let order: string[] = []
        const Test = () => {
            const [container, setContainer] = useState<HTMLDivElement | null>(
                null
            )
            order = usePanelOrder(container, [])

            return <div ref={setContainer} />
        }

        render(<Test />)
        expect(order).toEqual([])
    })

    it('should return panel names in the order they appear in the DOM', () => {
        let order: string[] = []
        const Test = () => {
            const [container, setContainer] = useState<HTMLDivElement | null>(
                null
            )
            order = usePanelOrder(container, [
                'panel2',
                'panel4',
                'panel3',
                'panel1',
            ])

            return (
                <div ref={setContainer}>
                    <div data-panel-name="panel1" />
                    <div data-panel-name="panel2" />
                    <div data-panel-name="panel3" />
                    <div data-panel-name="panel4" />
                </div>
            )
        }

        render(<Test />)
        expect(order).toEqual(['panel1', 'panel2', 'panel3', 'panel4'])
    })
})
