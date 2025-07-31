import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    CustomField,
    queryKeys,
    UpdateCustomField,
    useUpdateCustomField,
} from '@gorgias/helpdesk-queries'

import { OBJECT_TYPE_SETTINGS, OBJECT_TYPES } from 'custom-fields/constants'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useUpdateCustomFieldDefinition } from '../useUpdateCustomFieldDefinition'

const queryClient = mockQueryClient()

jest.mock('@gorgias/helpdesk-queries')
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
                'invalidateQueries',
            )
            const fieldDefinition = {
                ...ticketDropdownFieldDefinition,
                object_type: objectType,
            }

            renderHook(() => useUpdateCustomFieldDefinition(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            })

            useUpdateCustomFieldMock.mock.calls[0][0]?.mutation?.onSuccess!(
                axiosSuccessResponse(fieldDefinition as CustomField),
                {
                    id: fieldDefinition.id,
                    data: fieldDefinition as UpdateCustomField,
                },
                undefined,
            )
            expect(invalidateQueryMock).toHaveBeenLastCalledWith({
                queryKey: queryKeys.customFields.all(),
            })

            expect(mockStore.getActions()).toMatchObject([
                {
                    payload: {
                        message: `${OBJECT_TYPE_SETTINGS[objectType].TITLE_LABEL} field updated successfully.`,
                        status: NotificationStatus.Success,
                    },
                },
            ])
        },
    )

    it('should dispatch failure notification on error', () => {
        renderHook(() => useUpdateCustomFieldDefinition(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        useUpdateCustomFieldMock.mock.calls[0][0]?.mutation?.onError!(
            {},
            {
                id: ticketDropdownFieldDefinition.id,
                data: ticketDropdownFieldDefinition as UpdateCustomField,
            },
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
