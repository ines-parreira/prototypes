import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {ticketDropdownFieldDefinition} from 'fixtures/customField'
import {
    apiListCursorPaginationResponse,
    axiosSuccessResponse,
} from 'fixtures/axiosResponse'
import {NotificationStatus} from 'state/notifications/types'
import {useGetCustomFieldDefinitions} from 'models/customField/queries'
import {assumeMock} from 'utils/testing'

import {
    useCustomFieldDefinitions,
    STALE_TIME_MS,
} from '../useCustomFieldDefinitions'

jest.mock('models/customField/queries')
const useGetCustomFieldDefinitionsMock = assumeMock(
    useGetCustomFieldDefinitions
)

const mockStore = configureMockStore([thunk])()

describe('useCustomFieldDefinitions', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    const listParams = {archived: false, object_type: 'Ticket'} as const

    it('should call useGetCustomFieldDefinitions with proper id', () => {
        renderHook(() => useCustomFieldDefinitions(listParams), {
            wrapper: ({children}) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(useGetCustomFieldDefinitionsMock.mock.calls[0][0]).toBe(
            listParams
        )
    })

    it('should provide a stale time param', () => {
        renderHook(() => useCustomFieldDefinitions(listParams), {
            wrapper: ({children}) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(
            useGetCustomFieldDefinitionsMock.mock.calls[0][1]?.staleTime
        ).toBe(STALE_TIME_MS)
    })

    it('should provide a select param that picks the correct subset of data', () => {
        renderHook(() => useCustomFieldDefinitions(listParams), {
            wrapper: ({children}) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        const ticketDropdownFieldDefinitions = apiListCursorPaginationResponse([
            ticketDropdownFieldDefinition,
        ])

        expect(
            useGetCustomFieldDefinitionsMock.mock.calls[0][1]?.select!(
                axiosSuccessResponse(ticketDropdownFieldDefinitions)
            )
        ).toBe(ticketDropdownFieldDefinitions)
    })

    it('should provide a onError param calls the notify action', () => {
        renderHook(() => useCustomFieldDefinitions(listParams), {
            wrapper: ({children}) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        useGetCustomFieldDefinitionsMock.mock.calls[0][1]?.onError!(undefined)

        expect(mockStore.getActions()).toMatchObject([
            {
                payload: {
                    status: NotificationStatus.Error,
                },
            },
        ])
    })
})
