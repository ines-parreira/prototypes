import React from 'react'
import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import * as agentsQueries from 'models/agents/queries'
import {useAgentDetails} from '../hooks'

const useGetAgentSpy = jest.spyOn(agentsQueries, 'useGetAgent')

const queryClient = mockQueryClient()

const wrapper = ({children}: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('hooks', () => {
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
            const {result} = renderHook(() => useAgentDetails(1), {
                wrapper,
            })

            expect(result.current.data).toEqual({id: 1, name: 'Agent Name'})
        })

        it(`should return agent from api when it doesn't exist in initial state`, () => {
            useGetAgentSpy.mockReturnValue({
                data: {id: 1, name: 'Agent Name API'},
            } as any)
            window.GORGIAS_STATE = {
                agents: {
                    all: [],
                },
            } as any
            const {result} = renderHook(() => useAgentDetails(1), {
                wrapper,
            })

            expect(result.current.data).toEqual({
                id: 1,
                name: 'Agent Name API',
            })
        })

        it(`should return error from api when it doesn't exist in initial state or BE`, () => {
            useGetAgentSpy.mockReturnValue({
                error: {response: {status: 404}},
            } as any)
            const {result} = renderHook(() => useAgentDetails(1), {
                wrapper,
            })

            expect(result.current.error).toEqual({response: {status: 404}})
        })
    })
})
