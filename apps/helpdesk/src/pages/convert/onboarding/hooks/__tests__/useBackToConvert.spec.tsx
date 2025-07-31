import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'

import {
    BACK_TO_CONVERT_ONBOARDING_KEY,
    useBackToConvert,
} from '../useBackToConvert'

describe('useBackToConvert', () => {
    test('persists backIntegrationId in sessionStorage', async () => {
        sessionStorage.removeItem(BACK_TO_CONVERT_ONBOARDING_KEY)

        const { result } = renderHook(() => useBackToConvert())

        act(() => {
            result.current.setBackIntegrationId(123)
        })

        await waitFor(() => {
            expect(sessionStorage.getItem(BACK_TO_CONVERT_ONBOARDING_KEY)).toBe(
                '123',
            )
        })

        expect(result.current.backIntegrationId).toBe('123')

        act(() => {
            result.current.removeBackIntegrationId()
        })

        await waitFor(() => {
            expect(sessionStorage.getItem(BACK_TO_CONVERT_ONBOARDING_KEY)).toBe(
                '',
            )
        })

        expect(result.current.backIntegrationId).toBe('')
    })
})
