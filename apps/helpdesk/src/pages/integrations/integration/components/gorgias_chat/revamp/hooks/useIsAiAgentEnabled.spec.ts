import { renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import type { StoreConfiguration } from 'models/aiAgent/types'
import type { StoreIntegration } from 'models/integration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'

import { useIsAiAgentEnabled } from './useIsAiAgentEnabled'

jest.mock('hooks/useAppSelector')
jest.mock('models/selfServiceConfiguration/utils')
jest.mock('pages/aiAgent/hooks/useStoreConfiguration')
jest.mock('state/currentAccount/selectors', () => ({
    getCurrentAccountState: jest.fn(),
}))

const mockUseAppSelector = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>
const mockGetShopNameFromStoreIntegration =
    getShopNameFromStoreIntegration as jest.MockedFunction<
        typeof getShopNameFromStoreIntegration
    >
const mockUseStoreConfiguration = useStoreConfiguration as jest.MockedFunction<
    typeof useStoreConfiguration
>

const mockStoreIntegration = {} as StoreIntegration

const mockStoreConfiguration = {
    monitoredChatIntegrations: [1, 2],
    chatChannelDeactivatedDatetime: null,
} as unknown as StoreConfiguration

const makeStoreConfigResult = (
    overrides: Partial<ReturnType<typeof useStoreConfiguration>>,
): ReturnType<typeof useStoreConfiguration> => ({
    storeConfiguration: mockStoreConfiguration,
    isLoading: false,
    error: null,
    isFetched: true,
    ...overrides,
})

beforeEach(() => {
    jest.clearAllMocks()
    mockUseAppSelector.mockReturnValue(fromJS({ domain: 'test.gorgias.com' }))
    mockGetShopNameFromStoreIntegration.mockReturnValue('test-shop')
    mockUseStoreConfiguration.mockReturnValue(makeStoreConfigResult({}))
})

describe('useIsAiAgentEnabled', () => {
    describe('when storeIntegration is undefined', () => {
        it('should return isAiAgentEnabled false', () => {
            mockGetShopNameFromStoreIntegration.mockReturnValue(
                undefined as unknown as string,
            )

            const { result } = renderHook(() =>
                useIsAiAgentEnabled(undefined, 1),
            )

            expect(result.current.isAiAgentEnabled).toBe(false)
        })
    })

    describe('when chatId is undefined', () => {
        it('should return isAiAgentEnabled false', () => {
            const { result } = renderHook(() =>
                useIsAiAgentEnabled(mockStoreIntegration, undefined),
            )

            expect(result.current.isAiAgentEnabled).toBe(false)
        })
    })

    describe('when storeConfiguration is undefined', () => {
        it('should return isAiAgentEnabled false', () => {
            mockUseStoreConfiguration.mockReturnValue(
                makeStoreConfigResult({ storeConfiguration: undefined }),
            )

            const { result } = renderHook(() =>
                useIsAiAgentEnabled(mockStoreIntegration, 1),
            )

            expect(result.current.isAiAgentEnabled).toBe(false)
        })
    })

    describe('when chatId is in monitoredChatIntegrations and chat is active', () => {
        it('should return isAiAgentEnabled true', () => {
            const { result } = renderHook(() =>
                useIsAiAgentEnabled(mockStoreIntegration, 1),
            )

            expect(result.current.isAiAgentEnabled).toBe(true)
        })
    })

    describe('when chatId is not in monitoredChatIntegrations', () => {
        it('should return isAiAgentEnabled false', () => {
            const { result } = renderHook(() =>
                useIsAiAgentEnabled(mockStoreIntegration, 99),
            )

            expect(result.current.isAiAgentEnabled).toBe(false)
        })
    })

    describe('when chatChannelDeactivatedDatetime is set', () => {
        it('should return isAiAgentEnabled false', () => {
            mockUseStoreConfiguration.mockReturnValue(
                makeStoreConfigResult({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        chatChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
                    },
                }),
            )

            const { result } = renderHook(() =>
                useIsAiAgentEnabled(mockStoreIntegration, 1),
            )

            expect(result.current.isAiAgentEnabled).toBe(false)
        })
    })

    describe('isLoading', () => {
        it('should forward isLoading from useStoreConfiguration', () => {
            mockUseStoreConfiguration.mockReturnValue(
                makeStoreConfigResult({
                    storeConfiguration: undefined,
                    isLoading: true,
                }),
            )

            const { result } = renderHook(() =>
                useIsAiAgentEnabled(mockStoreIntegration, 1),
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('should return isLoading false when store configuration is loaded', () => {
            const { result } = renderHook(() =>
                useIsAiAgentEnabled(mockStoreIntegration, 1),
            )

            expect(result.current.isLoading).toBe(false)
        })
    })
})
