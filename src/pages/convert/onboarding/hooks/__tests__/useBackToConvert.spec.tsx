import {act, renderHook} from '@testing-library/react-hooks'
import {
    BACK_TO_CONVERT_ONBOARDING_KEY,
    useBackToConvert,
} from '../useBackToConvert'

describe('useBackToConvert', () => {
    test('persists backIntegrationId in sessionStorage', () => {
        sessionStorage.removeItem(BACK_TO_CONVERT_ONBOARDING_KEY)

        const {result} = renderHook(() => useBackToConvert())

        act(() => {
            result.current.setBackIntegrationId(123)
        })

        expect(sessionStorage.getItem(BACK_TO_CONVERT_ONBOARDING_KEY)).toBe(
            '123'
        )

        expect(result.current.backIntegrationId).toBe('123')

        act(() => {
            result.current.removeBackIntegrationId()
        })

        expect(sessionStorage.getItem(BACK_TO_CONVERT_ONBOARDING_KEY)).toBe(
            null
        )

        expect(result.current.backIntegrationId).toBe('')
    })
})
