import { assumeMock, renderHook } from '@repo/testing'

import type {
    HttpResponse,
    ListCustomFields200,
} from '@gorgias/helpdesk-queries'
import { useListCustomFields } from '@gorgias/helpdesk-queries'

import {
    apiListCursorPaginationResponse,
    axiosSuccessResponse,
} from 'fixtures/axiosResponse'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'

import {
    STALE_TIME_MS,
    useCustomFieldDefinitions,
} from '../useCustomFieldDefinitions'

jest.mock('@gorgias/helpdesk-queries')
const useListCustomFieldsMock = assumeMock(useListCustomFields)

describe('useCustomFieldDefinitions', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    const listParams = { archived: false, object_type: 'Ticket' } as const

    it('should call useGetCustomFieldDefinitions with proper id', () => {
        renderHook(() => useCustomFieldDefinitions(listParams))

        expect(useListCustomFieldsMock.mock.calls[0][0]).toBe(listParams)
    })

    it('should provide a stale time param', () => {
        renderHook(() => useCustomFieldDefinitions(listParams))

        expect(useListCustomFieldsMock.mock.calls[0][1]?.query?.staleTime).toBe(
            STALE_TIME_MS,
        )
    })

    it('should provide a select param that picks the correct subset of data', () => {
        renderHook(() => useCustomFieldDefinitions(listParams))

        const ticketDropdownFieldDefinitions = apiListCursorPaginationResponse([
            ticketDropdownFieldDefinition,
        ])

        expect(
            useListCustomFieldsMock.mock.calls[0][1]?.query?.select!(
                axiosSuccessResponse(
                    ticketDropdownFieldDefinitions,
                ) as HttpResponse<ListCustomFields200>,
            ),
        ).toBe(ticketDropdownFieldDefinitions)
    })

    it('should provide a meta param with an error message', () => {
        renderHook(() => useCustomFieldDefinitions(listParams))

        expect(
            useListCustomFieldsMock.mock.calls[0][1]?.query?.meta?.errorMessage,
        ).toBe('Failed to fetch custom fields')
    })
})
