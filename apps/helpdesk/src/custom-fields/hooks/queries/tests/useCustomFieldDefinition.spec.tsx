import React from 'react'

import { useGetCustomFieldDefinition } from 'custom-fields/hooks/queries/queries'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useCustomFieldDefinition } from '../useCustomFieldDefinition'

jest.mock('custom-fields/hooks/queries/queries')
const useGetCustomFieldDefinitionMock = assumeMock(useGetCustomFieldDefinition)

describe('useCustomFieldDefinition', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    const customFieldId = 123

    it('should call useGetCustomFieldDefinition with proper id', () => {
        renderHook(() => useCustomFieldDefinition(customFieldId))

        expect(useGetCustomFieldDefinitionMock.mock.calls[0][0]).toBe(
            customFieldId,
        )
    })

    it('should provide a select param that picks the correct subset of data', () => {
        renderHook(() => useCustomFieldDefinition(customFieldId))

        expect(
            useGetCustomFieldDefinitionMock.mock.calls[0][1]?.select!(
                axiosSuccessResponse(ticketDropdownFieldDefinition),
            ),
        ).toBe(ticketDropdownFieldDefinition)
    })

    it('should provide a staleTime param of 1 hour', () => {
        renderHook(() => useCustomFieldDefinition(customFieldId))

        expect(
            useGetCustomFieldDefinitionMock.mock.calls[0][1]?.staleTime,
        ).toBe(60 * 60 * 1000)
    })

    it('should provide a meta param with an error message', () => {
        renderHook(() => useCustomFieldDefinition(customFieldId))

        expect(
            useGetCustomFieldDefinitionMock.mock.calls[0][1]?.meta
                ?.errorMessage,
        ).toBe('Failed to fetch custom field')
    })
})
