import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import * as customerHooks from '@repo/customer/hooks'

import * as agentsQueries from 'models/agents/queries'

import { useAgentDetails, useCustomerDetails } from '../hooks'

const useGetAgentSpy = jest.spyOn(agentsQueries, 'useGetAgent')
const useGetCustomerSpy = jest.spyOn(customerHooks, 'useGetCustomer')

describe('hooks', () => {
    describe('useCustomerDetails', () => {
        it('should return customer from store when it exists and call customer is same as ticket customer', () => {
            const { result } = renderHook(
                () => useCustomerDetails({ customerId: 1 }),
                {
                    storeState: {
                        ticket: fromJS({
                            customer: {
                                id: 1,
                                name: 'Customer Name',
                            },
                        }),
                    },
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
                    storeState: {
                        ticket: fromJS({
                            customer: {
                                id: 1,
                                name: 'Customer Name',
                            },
                        }),
                    },
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
            const { result } = renderHook(() =>
                useCustomerDetails({ customerId: 1 }),
            )

            expect(result.current.error).toEqual({ response: { status: 404 } })
        })

        it('should not disable query when isEnabled is true', () => {
            renderHook(() =>
                useCustomerDetails({ customerId: 1, isEnabled: true }),
            )

            expect(useGetCustomerSpy.mock.calls?.[0]?.[2]?.query?.enabled).toBe(
                true,
            )
        })

        it('should disable query when isEnabled is false', () => {
            renderHook(() =>
                useCustomerDetails({ customerId: 1, isEnabled: false }),
            )

            expect(useGetCustomerSpy.mock.calls?.[0]?.[2]?.query?.enabled).toBe(
                false,
            )
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
            const { result } = renderHook(() => useAgentDetails(1))

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
            const { result } = renderHook(() => useAgentDetails(1))

            expect(result.current.data).toEqual({
                id: 1,
                name: 'Agent Name API',
            })
        })

        it(`should return error from api when it doesn't exist in initial state or BE`, () => {
            useGetAgentSpy.mockReturnValue({
                error: { response: { status: 404 } },
            } as any)
            const { result } = renderHook(() => useAgentDetails(1))

            expect(result.current.error).toEqual({ response: { status: 404 } })
        })
    })
})
