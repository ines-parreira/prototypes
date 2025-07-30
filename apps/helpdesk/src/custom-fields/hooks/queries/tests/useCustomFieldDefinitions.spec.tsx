import React from 'react'

import { useGetCustomFieldDefinitions } from 'custom-fields/hooks/queries/queries'
import {
    apiListCursorPaginationResponse,
    axiosSuccessResponse,
} from 'fixtures/axiosResponse'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import {
    STALE_TIME_MS,
    useCustomFieldDefinitions,
} from '../useCustomFieldDefinitions'

jest.mock('custom-fields/hooks/queries/queries')
const useGetCustomFieldDefinitionsMock = assumeMock(
    useGetCustomFieldDefinitions,
)

describe('useCustomFieldDefinitions', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    const listParams = { archived: false, object_type: 'Ticket' } as const

    it('should call useGetCustomFieldDefinitions with proper id', () => {
        renderHook(() => useCustomFieldDefinitions(listParams))

        expect(useGetCustomFieldDefinitionsMock.mock.calls[0][0]).toBe(
            listParams,
        )
    })

    it('should provide a stale time param', () => {
        renderHook(() => useCustomFieldDefinitions(listParams))

        expect(
            useGetCustomFieldDefinitionsMock.mock.calls[0][1]?.staleTime,
        ).toBe(STALE_TIME_MS)
    })

    it('should provide a select param that picks the correct subset of data', () => {
        renderHook(() => useCustomFieldDefinitions(listParams))

        const ticketDropdownFieldDefinitions = apiListCursorPaginationResponse([
            ticketDropdownFieldDefinition,
        ])

        expect(
            useGetCustomFieldDefinitionsMock.mock.calls[0][1]?.select!(
                axiosSuccessResponse(ticketDropdownFieldDefinitions),
            ),
        ).toBe(ticketDropdownFieldDefinitions)
    })

    it('should provide a meta param with an error message', () => {
        renderHook(() => useCustomFieldDefinitions(listParams))

        expect(
            useGetCustomFieldDefinitionsMock.mock.calls[0][1]?.meta
                ?.errorMessage,
        ).toBe('Failed to fetch custom fields')
    })
})
