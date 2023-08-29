import {act, renderHook} from '@testing-library/react-hooks'

import {usePristineSteps} from '../usePristineSteps'

describe('usePristineSteps()', () => {
    it('returns the initial state', () => {
        const {result} = renderHook(() => usePristineSteps())

        expect(result.current.pristine).toEqual({
            basics: true,
            audience: true,
            message: true,
        })
    })

    it('updates the state of a step', () => {
        const {result} = renderHook(() => usePristineSteps())

        act(() => {
            result.current.onChangePristine('basics')
        })

        expect(result.current.pristine).toEqual({
            basics: false,
            audience: true,
            message: true,
        })
    })
})
