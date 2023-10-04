import {QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import * as resources from '../resources'
import {useGetAgent, useListAgents} from '../queries'

const fetchAgentsSpy = jest.spyOn(resources, 'fetchAgents')
const getAgentSpy = jest.spyOn(resources, 'fetchAgent')

const queryClient = mockQueryClient()
const mockAgents = ['agent1', 'agent2']

const wrapper = ({children}: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('Agents queries', () => {
    beforeEach(() => {
        queryClient.clear()
    })

    describe('useListAgents', () => {
        it('should return correct data on success', async () => {
            fetchAgentsSpy.mockImplementation(((id: number) =>
                Promise.resolve(
                    id === 1 ? [mockAgents[0]] : mockAgents
                )) as any)
            const {result, waitFor} = renderHook(
                () => useListAgents(1 as any),
                {
                    wrapper,
                }
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual([mockAgents[0]])
        })

        it('should return expected error on failure', async () => {
            fetchAgentsSpy.mockRejectedValueOnce(Error('test error'))
            const {result, waitFor} = renderHook(() => useListAgents(), {
                wrapper,
            })
            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toStrictEqual(Error('test error'))
        })
    })

    describe('useGetAgent', () => {
        it('should return correct data on success', async () => {
            getAgentSpy.mockResolvedValue(mockAgents[0] as any)
            const {result, waitFor} = renderHook(() => useGetAgent(1), {
                wrapper,
            })
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(mockAgents[0])
        })

        it('should return expected error on failure', async () => {
            getAgentSpy.mockRejectedValueOnce(Error('test error'))
            const {result, waitFor} = renderHook(() => useGetAgent(1), {
                wrapper,
            })
            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toStrictEqual(Error('test error'))
        })
    })
})
