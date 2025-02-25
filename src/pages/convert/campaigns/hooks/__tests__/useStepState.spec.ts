import { renderHook } from '@testing-library/react-hooks'

import { useStepState } from 'pages/convert/campaigns/hooks/useStepState'

describe('useStepState()', () => {
    describe('is edit mode', () => {
        it('returns empty object', () => {
            const { result } = renderHook(() =>
                useStepState({ isEditMode: true }),
            )
            expect(result.current).toEqual({})
        })
    })

    describe('is create mode', () => {
        it('returns count if the step is pristine', () => {
            const { result } = renderHook(() =>
                useStepState({ count: 1, isPristine: true, isEditMode: false }),
            )

            expect(result.current).toEqual({ count: 1 })
        })

        it('returns isValid if the step is not pristine but valid', () => {
            const { result } = renderHook(() =>
                useStepState({
                    isValid: true,
                    isPristine: false,
                    isEditMode: false,
                }),
            )
            expect(result.current).toEqual({ isValid: true, isInvalid: false })
        })

        it('returns isInvalid if the step is not pristine but invalid', () => {
            const { result } = renderHook(() =>
                useStepState({
                    isValid: false,
                    isPristine: false,
                    isEditMode: false,
                }),
            )
            expect(result.current).toEqual({ isValid: false, isInvalid: true })
        })
    })
})
