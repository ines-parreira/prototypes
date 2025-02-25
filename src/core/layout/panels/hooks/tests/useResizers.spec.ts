import { renderHook } from '@testing-library/react-hooks'

import useResizers from '../useResizers'

describe('usePanelGroup', () => {
    const configs = {
        panel1: {
            defaultSize: 200,
            minSize: 100,
            maxSize: 300,
        },
        panel2: {
            defaultSize: 200,
            minSize: 100,
            maxSize: 300,
        },
        panel3: {
            defaultSize: 200,
            minSize: 100,
            maxSize: 300,
        },
    }
    const order = ['panel1', 'panel2', 'panel3']

    let createResizer: jest.Mock

    beforeEach(() => {
        createResizer = jest.fn(() => jest.fn())
    })

    it('should create a resizer for each eligible panel', () => {
        const { result } = renderHook(() =>
            useResizers(createResizer, configs, order),
        )
        expect(result.current).toEqual({
            panel2: expect.any(Function),
            panel3: expect.any(Function),
        })
    })
})
