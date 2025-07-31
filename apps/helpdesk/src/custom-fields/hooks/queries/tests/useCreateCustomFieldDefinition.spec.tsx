import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    CreateCustomField,
    CustomField,
    HttpResponse,
    queryKeys,
    useCreateCustomField,
} from '@gorgias/helpdesk-queries'

import { OBJECT_TYPE_SETTINGS, OBJECT_TYPES } from 'custom-fields/constants'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useCreateCustomFieldDefinition } from '../useCreateCustomFieldDefinition'

const queryClient = mockQueryClient()

jest.mock('@gorgias/helpdesk-queries')
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
            } as CreateCustomField

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

            useCreateCustomFieldMock.mock.calls[0][0]?.mutation?.onSuccess!(
                axiosSuccessResponse(
                    fieldDefinition,
                ) as HttpResponse<CustomField>,
                { data: fieldDefinition },
                undefined,
            )
            expect(invalidateQueryMock).toHaveBeenLastCalledWith({
                queryKey: queryKeys.customFields.all(),
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

        useCreateCustomFieldMock.mock.calls[0][0]?.mutation?.onError!(
            {},
            { data: ticketDropdownFieldDefinition as CreateCustomField },
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
