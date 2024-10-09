import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    customFieldDefinitionKeys,
    useUpdateCustomField,
} from 'custom-fields/hooks/queries/queries'
import {ticketDropdownFieldDefinition} from 'fixtures/customField'
import {NotificationStatus} from 'state/notifications/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import {OBJECT_TYPE_SETTINGS, OBJECT_TYPES} from 'custom-fields/constants'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {useUpdateCustomFieldDefinition} from '../useUpdateCustomFieldDefinition'

const queryClient = mockQueryClient()

jest.mock('custom-fields/hooks/queries/queries')
const useUpdateCustomFieldMock = assumeMock(useUpdateCustomField)

const mockStore = configureMockStore([thunk])()

describe('useUpdateCustomFieldDefinition', () => {
    beforeEach(() => {
        mockStore.clearActions()
        jest.resetAllMocks()
    })

    it.each(Object.values(OBJECT_TYPES))(
        'should dispatch success notification on success and invalidate proper query data',
        (objectType) => {
            const invalidateQueryMock = jest.spyOn(
                queryClient,
                'invalidateQueries'
            )
            const fieldDefinition = {
                ...ticketDropdownFieldDefinition,
                object_type: objectType,
            }

            renderHook(() => useUpdateCustomFieldDefinition(), {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            useUpdateCustomFieldMock.mock.calls[0][0]?.onSuccess!(
                axiosSuccessResponse(fieldDefinition),
                [fieldDefinition.id, fieldDefinition],
                undefined
            )
            expect(invalidateQueryMock).toHaveBeenLastCalledWith({
                queryKey: customFieldDefinitionKeys.all(),
            })

            expect(mockStore.getActions()).toMatchObject([
                {
                    payload: {
                        message: `${OBJECT_TYPE_SETTINGS[objectType].TITLE_LABEL} field updated successfully.`,
                        status: NotificationStatus.Success,
                    },
                },
            ])
        }
    )

    it('should dispatch failure notification on error', () => {
        renderHook(() => useUpdateCustomFieldDefinition(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        useUpdateCustomFieldMock.mock.calls[0][0]?.onError!(
            {},
            [ticketDropdownFieldDefinition.id, ticketDropdownFieldDefinition],
            undefined
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
