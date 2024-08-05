import {renderHook} from '@testing-library/react-hooks'

import {QueryClientProvider} from '@tanstack/react-query'

import React from 'react'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {fetchChatsApplicationAutomationSettings} from 'models/chatApplicationAutomationSettings/resources'
import {useGetChatsApplicationAutomationSettings} from '../queries'

const queryClient = mockQueryClient()

jest.mock('models/chatApplicationAutomationSettings/resources')

describe('queries.spec.tsx', () => {
    describe('useGetChatsApplicationAutomationSettings', () => {
        it('should return settings for provided application IDs', async () => {
            const mockSettings = [
                {
                    // mock settings data here
                },
            ]

            ;(
                fetchChatsApplicationAutomationSettings as jest.Mock
            ).mockResolvedValue(mockSettings)

            const wrapper = ({children}: {children: React.ReactNode}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            )

            const {result, waitFor} = renderHook(
                () => useGetChatsApplicationAutomationSettings(['appId1']),
                {wrapper}
            )

            await waitFor(() => result.current.isSuccess)

            expect(result.current.data).toEqual(mockSettings)
            expect(
                fetchChatsApplicationAutomationSettings
            ).toHaveBeenCalledWith(['appId1'])
        })

        it('should return an empty array if no application IDs are provided', async () => {
            const wrapper = ({children}: {children: React.ReactNode}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            )

            const {result, waitFor} = renderHook(
                () => useGetChatsApplicationAutomationSettings([]),
                {wrapper}
            )

            await waitFor(() => result.current.isSuccess)

            expect(result.current.data).toEqual([])
        })
    })
})
