import { renderHook } from '@repo/testing'

import {
    CustomerCustomFieldWithValue,
    HttpResponse,
    ListCustomerCustomFieldsValues200,
    useListCustomerCustomFieldsValues,
} from '@gorgias/helpdesk-queries'

import {
    apiListCursorPaginationResponse,
    axiosSuccessResponse,
} from 'fixtures/axiosResponse'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { assumeMock } from 'utils/testing'

import {
    STALE_TIME_MS,
    useCustomerFieldValues,
} from '../useCustomerFieldValues'

jest.mock('@gorgias/helpdesk-queries')
const useGetCustomFieldValuesMock = assumeMock(
    useListCustomerCustomFieldsValues,
)

describe('useCustomFieldValues', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    const customerId = 420

    it('should call useGetCustomFieldValues with proper id', () => {
        renderHook(() => useCustomerFieldValues(customerId))

        expect(useGetCustomFieldValuesMock.mock.calls[0][0]).toBe(customerId)
    })

    it('should provide a stale time param', () => {
        renderHook(() => useCustomerFieldValues(customerId))

        expect(
            useGetCustomFieldValuesMock.mock.calls[0][1]?.query?.staleTime,
        ).toBe(STALE_TIME_MS)
    })

    it('should provide a select param that picks the correct subset of data', () => {
        renderHook(() => useCustomerFieldValues(customerId))

        const data = [
            {
                field: ticketDropdownFieldDefinition,
                value: 'value',
            } as CustomerCustomFieldWithValue,
        ]

        expect(
            useGetCustomFieldValuesMock.mock.calls[0][1]?.query?.select!(
                axiosSuccessResponse(
                    apiListCursorPaginationResponse(data),
                ) as HttpResponse<ListCustomerCustomFieldsValues200>,
            ),
        ).toStrictEqual(apiListCursorPaginationResponse(data))
    })

    it('should provide a meta param with an error message', () => {
        renderHook(() => useCustomerFieldValues(customerId))

        expect(
            useGetCustomFieldValuesMock.mock.calls[0][1]?.query?.meta
                ?.errorMessage,
        ).toBe('Failed to fetch custom field values')
    })
})
