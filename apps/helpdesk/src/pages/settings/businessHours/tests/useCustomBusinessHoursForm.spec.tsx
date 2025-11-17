import { renderHook } from '@testing-library/react'

import type { CustomBusinessHoursContextState } from '../CustomBusinessHoursContext'
import { CustomBusinessHoursContext } from '../CustomBusinessHoursContext'
import type { CustomBusinessHoursFormValues } from '../types'
import { useCustomBusinessHoursForm } from '../useCustomBusinessHoursForm'

const renderHookWithContext = (integrationsToOverride: number[]) => {
    return renderHook(() => useCustomBusinessHoursForm(), {
        wrapper: ({ children }) => (
            <CustomBusinessHoursContext.Provider
                value={
                    {
                        integrationsToOverride,
                    } as CustomBusinessHoursContextState
                }
            >
                {children}
            </CustomBusinessHoursContext.Provider>
        ),
    })
}

describe('useCustomBusinessHoursForm', () => {
    it('should return the correct validation errors when there are integrations to override and overrideConfirmation is not true', () => {
        const { result } = renderHookWithContext([1, 2, 3])

        expect(
            result.current.clientSideValidation(
                {} as CustomBusinessHoursFormValues,
            ),
        ).toEqual({
            overrideConfirmation:
                'You have to confirm overwriting the existing schedules to be able to add the custom business hours.',
        })
    })

    it('should not return the correct validation errors when there are no integrations to override', () => {
        const { result } = renderHookWithContext([])

        expect(
            result.current.clientSideValidation(
                {} as CustomBusinessHoursFormValues,
            ),
        ).toEqual({})
    })
})
