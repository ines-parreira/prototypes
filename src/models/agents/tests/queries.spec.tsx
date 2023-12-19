import {QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import {renderHook, act} from '@testing-library/react-hooks'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {agents} from 'fixtures/agents'
import {assumeMock} from 'utils/testing'

import {
    axiosSuccessResponse,
    apiListCursorPaginationResponse,
} from 'fixtures/axiosResponse'
import * as resources from '../resources'
import * as queries from '../queries'

jest.mock('../resources', () => ({
    fetchAgents: jest.fn(),
    fetchAgent: jest.fn(),
    createAgent: jest.fn(),
    updateAgent: jest.fn(),
    deleteAgent: jest.fn(),
    inviteAgent: jest.fn(),
}))

const mockedResources = {
    mockFetchAgents: assumeMock(resources.fetchAgents),
    mockFetchAgent: assumeMock(resources.fetchAgent),
    mockCreateAgent: assumeMock(resources.createAgent),
    mockUpdateAgent: assumeMock(resources.updateAgent),
    mockDeleteAgent: assumeMock(resources.deleteAgent),
    mockInviteAgent: assumeMock(resources.inviteAgent),
}

const queryClient = mockQueryClient()

const wrapper = ({children}: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('Agents queries', () => {
    beforeEach(() => {
        queryClient.clear()
    })

    describe('useListAgents', () => {
        it('should return correct data on success', async () => {
            mockedResources.mockFetchAgents.mockResolvedValueOnce(
                axiosSuccessResponse(apiListCursorPaginationResponse(agents))
            )
            const {result, waitFor} = renderHook(
                () => queries.useListAgents(),
                {
                    wrapper,
                }
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data?.data?.data).toStrictEqual(agents)
        })

        it('should return expected error on failure', async () => {
            mockedResources.mockFetchAgents.mockRejectedValueOnce(
                Error('test error')
            )
            const {result, waitFor} = renderHook(
                () => queries.useListAgents(),
                {
                    wrapper,
                }
            )
            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toStrictEqual(Error('test error'))
        })
    })

    describe('useGetAgent', () => {
        it('should return correct data on success', async () => {
            mockedResources.mockFetchAgent.mockResolvedValueOnce(agents[0])
            const {result, waitFor} = renderHook(() => queries.useGetAgent(1), {
                wrapper,
            })
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(agents[0])
        })

        it('should return expected error on failure', async () => {
            mockedResources.mockFetchAgent.mockRejectedValueOnce(
                Error('test error')
            )
            const {result, waitFor} = renderHook(() => queries.useGetAgent(1), {
                wrapper,
            })
            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toStrictEqual(Error('test error'))
        })
    })

    describe('agent mutations: ', () => {
        const agent = agents[0]
        const id = agent.id
        it.each([
            ['useCreateAgent', 'mockCreateAgent', agent, agent],
            ['useUpdateAgent', 'mockUpdateAgent', {id, agent}, agent],
            ['useDeleteAgent', 'mockDeleteAgent', id, undefined],
            ['useInviteAgent', 'mockInviteAgent', id, undefined],
        ] as const)(
            '%s return correct data on success',
            async (hook, mockedResource, param, returnedData) => {
                mockedResources[mockedResource].mockResolvedValueOnce(
                    axiosSuccessResponse(returnedData) as any
                )
                const {result, waitFor} = renderHook(() => queries[hook](), {
                    wrapper: ({children}) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                })

                act(() => {
                    result.current.mutate([param as any])
                })

                await waitFor(() => {
                    expect(result.current.isSuccess).toBe(true)
                })
                expect(result.current.data?.data).toEqual(returnedData)
            }
        )
    })
})
