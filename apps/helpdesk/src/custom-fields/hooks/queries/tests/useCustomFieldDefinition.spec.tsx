import { renderHook } from '@repo/testing'

import {
    CustomField,
    HttpResponse,
    useGetCustomField,
} from '@gorgias/helpdesk-queries'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { assumeMock } from 'utils/testing'

import { useCustomFieldDefinition } from '../useCustomFieldDefinition'

jest.mock('@gorgias/helpdesk-queries')
const useGetCustomFieldMock = assumeMock(useGetCustomField)

describe('useCustomFieldDefinition', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    const customFieldId = 123

    it('should call useGetCustomFieldDefinition with proper id', () => {
        renderHook(() => useCustomFieldDefinition(customFieldId))

        expect(useGetCustomFieldMock.mock.calls[0][0]).toBe(customFieldId)
    })

    it('should provide a select param that picks the correct subset of data', () => {
        renderHook(() => useCustomFieldDefinition(customFieldId))

        expect(
            useGetCustomFieldMock.mock.calls[0][1]?.query?.select!(
                axiosSuccessResponse(
                    ticketDropdownFieldDefinition,
                ) as HttpResponse<CustomField>,
            ),
        ).toBe(ticketDropdownFieldDefinition)
    })

    it('should provide a staleTime param of 1 hour', () => {
        renderHook(() => useCustomFieldDefinition(customFieldId))

        expect(useGetCustomFieldMock.mock.calls[0][1]?.query?.staleTime).toBe(
            60 * 60 * 1000,
        )
    })

    it('should provide a meta param with an error message', () => {
        renderHook(() => useCustomFieldDefinition(customFieldId))

        expect(
            useGetCustomFieldMock.mock.calls[0][1]?.query?.meta?.errorMessage,
        ).toBe('Failed to fetch custom field')
    })
})
