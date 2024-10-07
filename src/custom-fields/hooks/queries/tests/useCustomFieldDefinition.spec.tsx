import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {ticketDropdownFieldDefinition} from 'fixtures/customField'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {NotificationStatus} from 'state/notifications/types'
import {useGetCustomFieldDefinition} from 'custom-fields/hooks/queries/queries'
import {assumeMock} from 'utils/testing'

import {useCustomFieldDefinition} from '../useCustomFieldDefinition'

jest.mock('custom-fields/hooks/queries/queries')
const useGetCustomFieldDefinitionMock = assumeMock(useGetCustomFieldDefinition)

const mockStore = configureMockStore([thunk])()

describe('useCustomFieldDefinition', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    const customFieldId = 123

    it('should call useGetCustomFieldDefinition with proper id', () => {
        renderHook(() => useCustomFieldDefinition(customFieldId), {
            wrapper: ({children}) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(useGetCustomFieldDefinitionMock.mock.calls[0][0]).toBe(
            customFieldId
        )
    })

    it('should provide a select param that picks the correct subset of data', () => {
        renderHook(() => useCustomFieldDefinition(customFieldId), {
            wrapper: ({children}) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(
            useGetCustomFieldDefinitionMock.mock.calls[0][1]?.select!(
                axiosSuccessResponse(ticketDropdownFieldDefinition)
            )
        ).toBe(ticketDropdownFieldDefinition)
    })

    it('should provide a onError param that calls the notify action', () => {
        renderHook(() => useCustomFieldDefinition(customFieldId), {
            wrapper: ({children}) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        useGetCustomFieldDefinitionMock.mock.calls[0][1]?.onError!(undefined)

        expect(mockStore.getActions()).toMatchObject([
            {
                payload: {
                    status: NotificationStatus.Error,
                },
            },
        ])
    })
})
