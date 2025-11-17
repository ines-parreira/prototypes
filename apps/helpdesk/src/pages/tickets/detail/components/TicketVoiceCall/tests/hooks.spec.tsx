import React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import type { User } from 'config/types/user'
import * as agentsQueries from 'models/agents/queries'
import * as customersQueries from 'models/customer/queries'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import { useAgentDetails, useCustomerDetails } from '../hooks'

const useGetAgentSpy = jest.spyOn(agentsQueries, 'useGetAgent')
const useGetCustomerSpy = jest.spyOn(customersQueries, 'useGetCustomer')

const queryClient = mockQueryClient()

const agentDetailsWrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const createCustomerDetailsWrapper =
    (storeCustomerData: Partial<User> = {}) =>
    ({ children }: any) => (
        <Provider
            store={mockStore({
                ticket: fromJS({
                    customer: storeCustomerData,
                }),
            } as any)}
        >
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Provider>
    )

describe('hooks', () => {
    describe('useCustomerDetails', () => {
        it('should return customer from store when it exists and call customer is same as ticket customer', () => {
            const { result } = renderHook(
                () => useCustomerDetails({ customerId: 1 }),
                {
                    wrapper: createCustomerDetailsWrapper({
                        id: 1,
                        name: 'Customer Name',
                    }),
                },
            )

            expect(result.current.customer).toEqual({
                id: 1,
                name: 'Customer Name',
            })
        })

        it('should return customer from api when call customer is not same as ticket customer', () => {
            useGetCustomerSpy.mockReturnValue({
                data: { data: { id: 2, name: 'Customer Name API' } },
            } as any)
            const { result } = renderHook(
                () => useCustomerDetails({ customerId: 2 }),
                {
                    wrapper: createCustomerDetailsWrapper({
                        id: 1,
                        name: 'Customer Name',
                    }),
                },
            )
            expect(result.current.customer).toEqual({
                id: 2,
                name: 'Customer Name API',
            })
        })

        it('should return error from api when it exists', () => {
            useGetCustomerSpy.mockReturnValue({
                error: { response: { status: 404 } },
            } as any)
            const { result } = renderHook(
                () => useCustomerDetails({ customerId: 1 }),
                {
                    wrapper: createCustomerDetailsWrapper({}),
                },
            )

            expect(result.current.error).toEqual({ response: { status: 404 } })
        })

        it('should not disable query when isEnabled is true', () => {
            renderHook(
                () => useCustomerDetails({ customerId: 1, isEnabled: true }),
                {
                    wrapper: createCustomerDetailsWrapper({}),
                },
            )

            expect(useGetCustomerSpy.mock.calls?.[0]?.[1]?.enabled).toBe(true)
        })

        it('should disable query when isEnabled is false', () => {
            renderHook(
                () => useCustomerDetails({ customerId: 1, isEnabled: false }),
                {
                    wrapper: createCustomerDetailsWrapper({}),
                },
            )

            expect(useGetCustomerSpy.mock.calls?.[0]?.[1]?.enabled).toBe(false)
        })
    })

    describe('useAgentDetails', () => {
        it('should return agent from initial state when it exists', () => {
            window.GORGIAS_STATE = {
                agents: {
                    all: [
                        {
                            id: 1,
                            name: 'Agent Name',
                        },
                    ],
                },
            } as any
            const { result } = renderHook(() => useAgentDetails(1), {
                wrapper: agentDetailsWrapper,
            })

            expect(result.current.data).toEqual({ id: 1, name: 'Agent Name' })
        })

        it(`should return agent from api when it doesn't exist in initial state`, () => {
            useGetAgentSpy.mockReturnValue({
                data: { id: 1, name: 'Agent Name API' },
            } as any)
            window.GORGIAS_STATE = {
                agents: {
                    all: [],
                },
            } as any
            const { result } = renderHook(() => useAgentDetails(1), {
                wrapper: agentDetailsWrapper,
            })

            expect(result.current.data).toEqual({
                id: 1,
                name: 'Agent Name API',
            })
        })

        it(`should return error from api when it doesn't exist in initial state or BE`, () => {
            useGetAgentSpy.mockReturnValue({
                error: { response: { status: 404 } },
            } as any)
            const { result } = renderHook(() => useAgentDetails(1), {
                wrapper: agentDetailsWrapper,
            })

            expect(result.current.error).toEqual({ response: { status: 404 } })
        })
    })
})
