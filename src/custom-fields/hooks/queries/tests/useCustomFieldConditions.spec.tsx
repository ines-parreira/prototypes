import {useListCustomFieldConditions, queryKeys} from '@gorgias/api-queries'
import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {OBJECT_TYPES} from 'custom-fields/constants'
import {
    MAX_CONDITIONS,
    STALE_TIME_MS,
    useCustomFieldConditions,
} from 'custom-fields/hooks/queries/useCustomFieldConditions'
import {customFieldCondition} from 'fixtures/customFieldCondition'
import {NotificationStatus} from 'state/notifications/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])()

jest.mock('@gorgias/api-queries')
const useListCustomFieldConditionsMock = assumeMock(
    useListCustomFieldConditions
)

describe('useCustomFieldConditions', () => {
    beforeEach(() => {
        mockStore.clearActions()
        jest.resetAllMocks()
    })

    it('should return loading state initially', () => {
        useListCustomFieldConditionsMock.mockReturnValue({
            isLoading: true,
        } as any)

        const {result} = renderHook(
            () => useCustomFieldConditions({objectType: OBJECT_TYPES.TICKET}),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            }
        )
        expect(useListCustomFieldConditions).toHaveBeenCalledWith({
            http: {
                params: {
                    object_type: OBJECT_TYPES.TICKET,
                    order_by: 'sort_order:asc',
                    limit: MAX_CONDITIONS,
                    include_deactivated: true,
                },
            },
            query: {
                staleTime: STALE_TIME_MS,
                queryKey:
                    queryKeys.customFieldConditions.listCustomFieldConditions({
                        object_type: OBJECT_TYPES.TICKET,
                        include_deactivated: true,
                    }),
                enabled: true,
            },
        })
        expect(result.current.isLoading).toBe(true)
        expect(result.current.customFieldConditions).toEqual([])
    })

    it('should return custom field conditions on success', () => {
        useListCustomFieldConditionsMock.mockReturnValue({
            data: {data: {data: [customFieldCondition]}},
            isLoading: false,
        } as any)

        const {result} = renderHook(
            () => useCustomFieldConditions({objectType: OBJECT_TYPES.TICKET}),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            }
        )
        expect(useListCustomFieldConditions).toHaveBeenCalledWith({
            http: {
                params: {
                    object_type: OBJECT_TYPES.TICKET,
                    order_by: 'sort_order:asc',
                    limit: MAX_CONDITIONS,
                    include_deactivated: true,
                },
            },
            query: {
                staleTime: STALE_TIME_MS,
                queryKey:
                    queryKeys.customFieldConditions.listCustomFieldConditions({
                        object_type: OBJECT_TYPES.TICKET,
                        include_deactivated: true,
                    }),
                enabled: true,
            },
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.customFieldConditions).toEqual([
            customFieldCondition,
        ])
    })

    it('should dispatch error notification on error', () => {
        useListCustomFieldConditionsMock.mockReturnValue({isError: true} as any)

        const {result} = renderHook(
            () =>
                useCustomFieldConditions({
                    objectType: OBJECT_TYPES.TICKET,
                    includeDeactivated: false,
                    enabled: true,
                    invalidate: true,
                }),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            }
        )

        expect(useListCustomFieldConditions).toHaveBeenCalledWith({
            http: {
                params: {
                    object_type: OBJECT_TYPES.TICKET,
                    order_by: 'sort_order:asc',
                    limit: MAX_CONDITIONS,
                    include_deactivated: false,
                },
            },
            query: {
                staleTime: 0,
                queryKey:
                    queryKeys.customFieldConditions.listCustomFieldConditions({
                        object_type: OBJECT_TYPES.TICKET,
                        include_deactivated: false,
                    }),
                enabled: true,
            },
        })

        expect(mockStore.getActions()).toMatchObject([
            {
                payload: {
                    status: NotificationStatus.Error,
                    message: 'Failed to fetch ticket custom fields conditions',
                },
            },
        ])

        expect(result.current.isError).toBe(true)
    })
})
