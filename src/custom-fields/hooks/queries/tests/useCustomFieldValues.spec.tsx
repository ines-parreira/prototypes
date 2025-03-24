import React from 'react'

import { renderHook } from '@testing-library/react-hooks'

import { OBJECT_TYPES } from 'custom-fields/constants'
import { useGetCustomFieldValues } from 'custom-fields/hooks/queries/queries'
import {
    apiListCursorPaginationResponse,
    axiosSuccessResponse,
} from 'fixtures/axiosResponse'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { assumeMock } from 'utils/testing'

import { STALE_TIME_MS, useCustomFieldValues } from '../useCustomFieldValues'

jest.mock('custom-fields/hooks/queries/queries')
const useGetCustomFieldValuesMock = assumeMock(useGetCustomFieldValues)

describe('useCustomFieldValues', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    const params = {
        object_type: OBJECT_TYPES.TICKET,
        holderId: 420,
    } as const

    it('should call useGetCustomFieldValues with proper id', () => {
        renderHook(() => useCustomFieldValues(params))

        expect(useGetCustomFieldValuesMock.mock.calls[0][0]).toBe(params)
    })

    it('should provide a stale time param', () => {
        renderHook(() => useCustomFieldValues(params))

        expect(useGetCustomFieldValuesMock.mock.calls[0][1]?.staleTime).toBe(
            STALE_TIME_MS,
        )
    })

    it('should provide a select param that picks the correct subset of data', () => {
        renderHook(() => useCustomFieldValues(params))

        const data = [
            {
                field: ticketDropdownFieldDefinition,
                value: 'value',
            },
        ]

        expect(
            useGetCustomFieldValuesMock.mock.calls[0][1]?.select!(
                axiosSuccessResponse(apiListCursorPaginationResponse(data)),
            ),
        ).toStrictEqual(apiListCursorPaginationResponse(data))
    })

    it('should provide a meta param with an error message', () => {
        renderHook(() => useCustomFieldValues(params))

        expect(
            useGetCustomFieldValuesMock.mock.calls[0][1]?.meta?.errorMessage,
        ).toBe('Failed to fetch custom field values')
    })
})
