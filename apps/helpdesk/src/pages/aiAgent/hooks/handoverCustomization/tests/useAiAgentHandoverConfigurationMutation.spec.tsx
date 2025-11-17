import type { ReactNode } from 'react'
import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'

import {
    handoverConfigurationKeys,
    useUpsertStoreHandoverConfiguration,
} from 'models/aiAgent/queries'
import type { HandoverConfigurationData } from 'models/aiAgent/types'
import { AiAgentChannel } from 'pages/aiAgent/constants'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useAiAgentHandoverConfigurationMutation } from '../useAiAgentHandoverConfigurationMutation'

const queryClient = mockQueryClient()

jest.mock('models/aiAgent/queries')

const useUpsertStoreHandoverConfigurationMock = assumeMock(
    useUpsertStoreHandoverConfiguration,
)

describe('useAiAgentHandoverConfigurationMutation', () => {
    const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children?: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    const mockParams = {
        accountDomain: 'test-domain',
        storeName: 'test-store',
        integrationId: 123,
    }

    const mockHandoverConfig: HandoverConfigurationData = {
        accountId: 1,
        storeName: 'Test Store',
        shopType: 'Test Shop Type',
        integrationId: 123,
        channel: AiAgentChannel.Chat,
        onlineInstructions: 'Test Online Instructions',
        offlineInstructions: 'Test Offline Instructions',
        shareBusinessHours: true,
    }

    beforeEach(() => {
        jest.resetAllMocks()
        queryClient.clear()
    })

    it('should call upsertHandoverConfigurationAsync with correct parameters', async () => {
        const mockMutateAsync = jest.fn().mockResolvedValue({
            data: mockHandoverConfig,
        })

        ;(useUpsertStoreHandoverConfiguration as jest.Mock).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isLoading: false,
            error: null,
        })

        const { result } = renderHook(
            () => useAiAgentHandoverConfigurationMutation(mockParams),
            { wrapper },
        )

        await act(async () => {
            await result.current.upsertHandoverConfiguration(mockHandoverConfig)
        })

        expect(mockMutateAsync).toHaveBeenCalledWith([
            mockParams.accountDomain,
            mockParams.storeName,
            mockParams.integrationId,
            mockHandoverConfig,
        ])

        expect(result.current.isUpsertError).toBe(null)
    })

    it('should invalidate the query correctly', async () => {
        const mockMutateAsync = jest.fn().mockResolvedValue({
            data: mockHandoverConfig,
        })

        ;(useUpsertStoreHandoverConfiguration as jest.Mock).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isLoading: false,
            error: null,
        })

        // Render the hook
        const { result } = renderHook(
            () => useAiAgentHandoverConfigurationMutation(mockParams),
            { wrapper },
        )

        useUpsertStoreHandoverConfigurationMock.mock.calls[0][0]?.onSuccess!(
            mockHandoverConfig,
            [
                mockParams.accountDomain,
                mockParams.storeName,
                mockParams.integrationId,
                mockHandoverConfig,
            ],
            undefined,
        )

        await act(async () => {
            await result.current.upsertHandoverConfiguration(mockHandoverConfig)
        })

        expect(invalidateQueryMock).toHaveBeenCalledWith({
            queryKey: handoverConfigurationKeys.detail({
                accountDomain: mockParams.accountDomain,
                storeName: mockParams.storeName,
                channel: mockHandoverConfig.channel,
            }),
        })
    })

    it('should return error state correctly', () => {
        const mockError = new Error('Test error')

        ;(useUpsertStoreHandoverConfiguration as jest.Mock).mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
            error: mockError,
        })

        const { result } = renderHook(
            () => useAiAgentHandoverConfigurationMutation(mockParams),
            { wrapper },
        )

        expect(result.current.isUpsertError).toBe(mockError)
        expect(result.current.isUpsertLoading).toBe(false)
        expect(invalidateQueryMock).not.toHaveBeenCalled()
    })
})
