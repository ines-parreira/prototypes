import {renderHook} from '@testing-library/react-hooks'

import usePanelSizes from '../usePanelSizes'

describe('usePanelSizes', () => {
    it('should return an empty object if there are no panels', () => {
        const configs = {}
        const order: string[] = []
        const {result} = renderHook(() => usePanelSizes(600, configs, order))
        expect(result.current).toEqual([{}, expect.any(Function)])
    })

    it('should calculate panel sizes', () => {
        const configs = {
            panel1: {defaultSize: 200, minSize: 100, maxSize: 300},
            panel2: {defaultSize: 200, minSize: 100, maxSize: 300},
            panel3: {defaultSize: 200, minSize: 100, maxSize: 300},
        }
        const order = ['panel1', 'panel2', 'panel3']
        const {result} = renderHook(() => usePanelSizes(600, configs, order))
        expect(result.current[0]).toEqual({
            panel1: 200,
            panel2: 200,
            panel3: 200,
        })
    })
})
