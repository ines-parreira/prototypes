import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { OBJECT_TYPE_SETTINGS, OBJECT_TYPES } from 'custom-fields/constants'
import {
    customFieldDefinitionKeys,
    useCreateCustomField,
} from 'custom-fields/hooks/queries/queries'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { useCreateCustomFieldDefinition } from '../useCreateCustomFieldDefinition'

const queryClient = mockQueryClient()

jest.mock('custom-fields/hooks/queries/queries')
const useCreateCustomFieldMock = assumeMock(useCreateCustomField)

const mockStore = configureMockStore([thunk])()

describe('useCreateCustomFieldDefinition', () => {
    beforeEach(() => {
        mockStore.clearActions()
        jest.resetAllMocks()
    })

    it.each(Object.values(OBJECT_TYPES))(
        'should dispatch success notification on success and invalidate proper query data',
        (objectType) => {
            const fieldDefinition = {
                ...ticketDropdownFieldDefinition,
                object_type: objectType,
            }

            const invalidateQueryMock = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )
            renderHook(() => useCreateCustomFieldDefinition(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            useCreateCustomFieldMock.mock.calls[0][0]?.onSuccess!(
                axiosSuccessResponse(fieldDefinition),
                [fieldDefinition],
                undefined,
            )
            expect(invalidateQueryMock).toHaveBeenLastCalledWith({
                queryKey: customFieldDefinitionKeys.all(),
            })

            expect(mockStore.getActions()).toMatchObject([
                {
                    payload: {
                        message: `${OBJECT_TYPE_SETTINGS[objectType].TITLE_LABEL} field created successfully.`,
                        status: NotificationStatus.Success,
                    },
                },
            ])
        },
    )

    it('should dispatch failure notification on error', () => {
        renderHook(() => useCreateCustomFieldDefinition(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        useCreateCustomFieldMock.mock.calls[0][0]?.onError!(
            {},
            [ticketDropdownFieldDefinition],
            undefined,
        )

        expect(mockStore.getActions()).toMatchObject([
            {
                payload: {
                    status: NotificationStatus.Error,
                },
            },
        ])
    })
})
