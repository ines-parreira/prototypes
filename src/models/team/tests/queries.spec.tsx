import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

import { useListTeams } from '../queries'
import * as resources from '../resources'

const fetchTeamsSpy = jest.spyOn(resources, 'fetchTeams')

const queryClient = mockQueryClient()
const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('teams queries', () => {
    beforeEach(() => {
        queryClient.clear()
    })

    describe('useListTeams', () => {
        const teams = ['testTeams']

        it('should return correct data on success', async () => {
            fetchTeamsSpy.mockResolvedValueOnce(
                axiosSuccessResponse(teams) as any,
            )
            const { result } = renderHook(() => useListTeams(), {
                wrapper,
            })
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data?.data).toStrictEqual(teams)
        })

        it('should return expected error on failure', async () => {
            fetchTeamsSpy.mockRejectedValueOnce(Error('test error'))
            const { result } = renderHook(() => useListTeams(), {
                wrapper,
            })
            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toStrictEqual(Error('test error'))
        })
    })
})
