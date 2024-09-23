import {act, renderHook} from '@testing-library/react-hooks'

import useAutoQA from '../useAutoQA'

describe('useAutoQA', () => {
    it('should return the dimensions', () => {
        const {result} = renderHook(() => useAutoQA(1))
        expect(result.current.dimensions).toEqual([
            expect.objectContaining({name: 'resolution'}),
            expect.objectContaining({name: 'communication_skills'}),
        ])
    })

    it('should return an edited value if applicable', () => {
        const {result} = renderHook(() => useAutoQA(1))
        expect(result.current.dimensions).toEqual([
            expect.objectContaining({prediction: 0, explanation: 'Beep-boop'}),
            expect.objectContaining({
                prediction: 4,
                explanation: 'Beepity-boopity',
            }),
        ])

        act(() => {
            result.current.changeHandlers.resolution(1, 'Yup')
        })
        expect(result.current.dimensions).toEqual([
            expect.objectContaining({prediction: 1, explanation: 'Yup'}),
            expect.objectContaining({
                prediction: 4,
                explanation: 'Beepity-boopity',
            }),
        ])

        act(() => {
            result.current.changeHandlers.communication_skills(5, 'Excellent')
        })
        expect(result.current.dimensions).toEqual([
            expect.objectContaining({prediction: 1, explanation: 'Yup'}),
            expect.objectContaining({
                prediction: 5,
                explanation: 'Excellent',
            }),
        ])
    })
})
