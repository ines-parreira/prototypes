import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {OBJECT_TYPES} from 'custom-fields/constants'
import {useGetCustomFieldValues} from 'custom-fields/hooks/queries/queries'
import {
    apiListCursorPaginationResponse,
    axiosSuccessResponse,
} from 'fixtures/axiosResponse'
import {ticketDropdownFieldDefinition} from 'fixtures/customField'
import {NotificationStatus} from 'state/notifications/types'
import {assumeMock} from 'utils/testing'

import {STALE_TIME_MS, useCustomFieldValues} from '../useCustomFieldValues'

jest.mock('custom-fields/hooks/queries/queries')
const useGetCustomFieldValuesMock = assumeMock(useGetCustomFieldValues)

const mockStore = configureMockStore([thunk])()

describe('useCustomFieldValues', () => {
    beforeEach(() => {
        mockStore.clearActions()
        jest.resetAllMocks()
    })

    const params = {
        object_type: OBJECT_TYPES.TICKET,
        holderId: 420,
    } as const

    it('should call useGetCustomFieldValues with proper id', () => {
        renderHook(() => useCustomFieldValues(params), {
            wrapper: ({children}) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(useGetCustomFieldValuesMock.mock.calls[0][0]).toBe(params)
    })

    it('should provide a stale time param', () => {
        renderHook(() => useCustomFieldValues(params), {
            wrapper: ({children}) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(useGetCustomFieldValuesMock.mock.calls[0][1]?.staleTime).toBe(
            STALE_TIME_MS
        )
    })

    it('should provide a select param that picks the correct subset of data', () => {
        renderHook(() => useCustomFieldValues(params), {
            wrapper: ({children}) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        const data = [
            {
                field: ticketDropdownFieldDefinition,
                value: 'value',
            },
        ]

        expect(
            useGetCustomFieldValuesMock.mock.calls[0][1]?.select!(
                axiosSuccessResponse(apiListCursorPaginationResponse(data))
            )
        ).toStrictEqual(apiListCursorPaginationResponse(data))
    })

    it('should provide a onError param that calls the notify action', () => {
        renderHook(() => useCustomFieldValues(params), {
            wrapper: ({children}) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        useGetCustomFieldValuesMock.mock.calls[0][1]?.onError!(undefined)

        expect(mockStore.getActions()).toMatchObject([
            {
                payload: {
                    status: NotificationStatus.Error,
                },
            },
        ])
    })
})
