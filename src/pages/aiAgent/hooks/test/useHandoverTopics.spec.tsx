import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react-hooks'

import useAppDispatch from 'hooks/useAppDispatch'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { INITIAL_FORM_VALUES } from '../../constants'
import { useHandoverTopics } from '../useHandoverTopics'
import { useStoreConfiguration } from '../useStoreConfiguration'
import { useStoreConfigurationMutation } from '../useStoreConfigurationMutation'

jest.mock('../useStoreConfigurationMutation')
jest.mock('../useStoreConfiguration')
jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')

const mockUseStoreConfigurationMutation = assumeMock(
    useStoreConfigurationMutation,
)
const mockUseStoreConfiguration = assumeMock(useStoreConfiguration)
const useAppDispatchMock = assumeMock(useAppDispatch)
const notifyMock = assumeMock(notify)

const queryClient = mockQueryClient()
const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useHandoverTopics', () => {
    const mockProps = {
        accountDomain: 'test-domain',
        shopName: 'test-store',
        onClose: jest.fn(),
    }

    const mockStoreConfiguration = getStoreConfigurationFixture()
    const mockUpsertStoreConfiguration = jest.fn()
    const mockCreateStoreConfiguration = jest.fn()
    const mockDispatch = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        useAppDispatchMock.mockReturnValue(mockDispatch)
        mockUseStoreConfigurationMutation.mockReturnValue({
            upsertStoreConfiguration: mockUpsertStoreConfiguration,
            createStoreConfiguration: mockCreateStoreConfiguration,
            isLoading: false,
            error: null,
        })
        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: {
                ...mockStoreConfiguration,
                excludedTopics: ['topic1', 'topic2'],
            },
            isLoading: false,
        })
    })

    it('should initialize with excluded topics from store configuration', () => {
        const { result } = renderHook(() => useHandoverTopics(mockProps), {
            wrapper,
        })

        expect(result.current.excludedTopics).toEqual(['topic1', 'topic2'])
        expect(result.current.isLoading).toBe(false)
    })

    it('should initialize with initial values when store configuration is undefined', () => {
        mockUseStoreConfiguration.mockReturnValueOnce({
            storeConfiguration: undefined,
            isLoading: false,
        })

        const { result } = renderHook(() => useHandoverTopics(mockProps), {
            wrapper,
        })

        expect(result.current.excludedTopics).toEqual(
            INITIAL_FORM_VALUES.excludedTopics,
        )
    })

    it('should handle cancel correctly', () => {
        const { result } = renderHook(() => useHandoverTopics(mockProps), {
            wrapper,
        })

        act(() => {
            result.current.handleCancel()
        })

        expect(mockProps.onClose).toHaveBeenCalled()
    })

    describe('handleSave', () => {
        it('should update existing configuration successfully and clean topics', async () => {
            mockUpsertStoreConfiguration.mockResolvedValue({})

            const { result } = renderHook(() => useHandoverTopics(mockProps), {
                wrapper,
            })

            act(() => {
                result.current.setExcludedTopics([
                    'valid-topic',
                    '',
                    '  trimmed-topic  ',
                ])
            })

            await act(async () => {
                await result.current.handleSave()
            })

            expect(mockUpsertStoreConfiguration).toHaveBeenCalledWith({
                ...mockStoreConfiguration,
                excludedTopics: ['valid-topic', 'trimmed-topic'],
            })

            expect(notifyMock).toHaveBeenCalledWith({
                message: 'Handover topics updated successfully!',
                status: NotificationStatus.Success,
            })
            expect(mockProps.onClose).toHaveBeenCalled()
        })

        it('should create new configuration when storeConfiguration is undefined', async () => {
            mockUseStoreConfiguration.mockReturnValue({
                storeConfiguration: undefined,
                isLoading: false,
            })

            mockCreateStoreConfiguration.mockResolvedValueOnce({})

            const { result } = renderHook(() => useHandoverTopics(mockProps), {
                wrapper,
            })

            act(() => {
                result.current.setExcludedTopics(['new-topic'])
            })

            await act(async () => {
                await result.current.handleSave()
            })

            expect(mockCreateStoreConfiguration).toHaveBeenCalledWith({
                ...INITIAL_FORM_VALUES,
                excludedTopics: ['new-topic'],
                storeName: mockProps.shopName,
                helpCenterId: null,
            })
        })

        it('should handle save error correctly', async () => {
            mockUpsertStoreConfiguration.mockRejectedValueOnce(
                new Error('Update failed'),
            )

            const { result } = renderHook(() => useHandoverTopics(mockProps), {
                wrapper,
            })

            await act(async () => {
                await result.current.handleSave()
            })

            expect(notifyMock).toHaveBeenCalledWith({
                message: 'Failed to update handover topics',
                status: NotificationStatus.Error,
            })
            expect(result.current.isLoading).toBe(false)
        })
    })

    it('should update excludedTopics when setExcludedTopics is called', () => {
        const { result } = renderHook(() => useHandoverTopics(mockProps), {
            wrapper,
        })

        act(() => {
            result.current.setExcludedTopics(['new-topic'])
        })

        expect(result.current.excludedTopics).toEqual(['new-topic'])
    })

    it('should reset to initial excluded topics when onClose is triggered', () => {
        const initialExcludedTopics = ['topic1', 'topic2']
        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: {
                ...mockStoreConfiguration,
                excludedTopics: initialExcludedTopics,
            },
            isLoading: false,
        })

        const { result } = renderHook(() => useHandoverTopics(mockProps), {
            wrapper,
        })

        expect(result.current.excludedTopics).toEqual(initialExcludedTopics)

        act(() => {
            result.current.setExcludedTopics(['modified-topic'])
        })

        expect(result.current.excludedTopics).toEqual(['modified-topic'])

        act(() => {
            result.current.handleCancel()
        })

        const { result: newResult } = renderHook(
            () => useHandoverTopics(mockProps),
            {
                wrapper,
            },
        )

        expect(newResult.current.excludedTopics).toEqual(initialExcludedTopics)
    })
})
