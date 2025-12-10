import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { account } from 'fixtures/account'
import { useGetPostStoreInstallationStepsPure } from 'models/aiAgentPostStoreInstallationSteps/queries'
import { PostStoreInstallationStepType } from 'models/aiAgentPostStoreInstallationSteps/types'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { isAiAgentEnabledForStore } from 'pages/aiAgent/utils/store-configuration.utils'
import type { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

import { useAiAgentOverviewModeEnabled } from '../useAiAgentOverviewModeEnabled'
import { useIsAiAgentDuringDeployment } from '../useIsAiAgentDuringDeployment'

jest.mock('models/aiAgentPostStoreInstallationSteps/queries')
jest.mock('pages/aiAgent/utils/store-configuration.utils')
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('../useIsAiAgentDuringDeployment')

const mockUseGetPostStoreInstallationStepsPure =
    useGetPostStoreInstallationStepsPure as jest.MockedFunction<
        typeof useGetPostStoreInstallationStepsPure
    >
const mockIsAiAgentEnabledForStore =
    isAiAgentEnabledForStore as jest.MockedFunction<
        typeof isAiAgentEnabledForStore
    >
const mockUseIsAiAgentDuringDeployment =
    useIsAiAgentDuringDeployment as jest.MockedFunction<
        typeof useIsAiAgentDuringDeployment
    >
const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.MockedFunction<
        typeof useAiAgentStoreConfigurationContext
    >

describe('useAiAgentOverviewModeEnabled', () => {
    const defaultState = {
        currentAccount: fromJS({
            ...account,
            domain: 'test-domain',
            id: 'test-account-id',
        }),
    } as RootState

    const defaultStoreConfig = {
        previewModeActivatedDatetime: null,
        storeName: 'test-store',
        shopType: 'shopify',
    } as any

    const defaultStoreConfigContext = {
        storeConfiguration: defaultStoreConfig,
        isLoading: false,
        updateStoreConfiguration: jest.fn(),
        createStoreConfiguration: jest.fn(),
        isPendingCreateOrUpdate: false,
    }

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })

    const renderUseAiAgentOverviewModeEnabled = (
        shopName = 'test-shop',
        shopType = 'shopify',
        enabled = true,
    ) => {
        return renderHook(
            () => useAiAgentOverviewModeEnabled(shopName, shopType, enabled),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    </QueryClientProvider>
                ),
            },
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as any)

        mockUseIsAiAgentDuringDeployment.mockReturnValue([
            false,
            jest.fn(),
            jest.fn(),
        ])

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...defaultStoreConfigContext,
        })
    })

    it('should return isAiAgentLiveModeEnabled as null and isLoading as true when store config is loading', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...defaultStoreConfigContext,
            storeConfiguration: undefined,
            isLoading: true,
        })

        const { result } = renderUseAiAgentOverviewModeEnabled()

        expect(result.current).toEqual({
            isAiAgentLiveModeEnabled: null,
            isLoading: true,
        })
    })

    it('should return isAiAgentLiveModeEnabled as null and isLoading as true when post installation steps are loading', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...defaultStoreConfigContext,
        })

        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any)

        const { result } = renderUseAiAgentOverviewModeEnabled()

        expect(result.current).toEqual({
            isAiAgentLiveModeEnabled: null,
            isLoading: true,
        })
    })

    it('should return isAiAgentLiveModeEnabled as null when storeData is undefined', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...defaultStoreConfigContext,
            storeConfiguration: undefined,
        })

        const { result } = renderUseAiAgentOverviewModeEnabled()

        expect(result.current).toEqual({
            isAiAgentLiveModeEnabled: null,
            isLoading: false,
        })
    })

    it('should return isAiAgentLiveModeEnabled as null when enabled is false', () => {
        const { result } = renderUseAiAgentOverviewModeEnabled(
            'test-shop',
            'shopify',
            false,
        )

        expect(result.current).toEqual({
            isAiAgentLiveModeEnabled: null,
            isLoading: false,
        })
    })

    it('should return isAiAgentLiveModeEnabled as true when AI agent is enabled', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...defaultStoreConfigContext,
        })

        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: { postStoreInstallationSteps: [] },
            isLoading: false,
        } as any)

        mockIsAiAgentEnabledForStore.mockReturnValue(true)

        const { result } = renderUseAiAgentOverviewModeEnabled()

        expect(result.current).toEqual({
            isAiAgentLiveModeEnabled: true,
            isLoading: false,
        })
    })

    it('should return isAiAgentLiveModeEnabled as true when post onboarding steps are completed', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...defaultStoreConfigContext,
        })

        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: {
                postStoreInstallationSteps: [
                    {
                        type: PostStoreInstallationStepType.POST_ONBOARDING,
                        completedDatetime: '2023-01-01T00:00:00Z',
                    },
                ],
            },
            isLoading: false,
        } as any)

        mockIsAiAgentEnabledForStore.mockReturnValue(false)

        const { result } = renderUseAiAgentOverviewModeEnabled()

        expect(result.current).toEqual({
            isAiAgentLiveModeEnabled: true,
            isLoading: false,
        })
    })

    it('should return isAiAgentLiveModeEnabled as false when AI agent is not enabled and post onboarding steps are not completed', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...defaultStoreConfigContext,
        })

        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: {
                postStoreInstallationSteps: [
                    {
                        type: PostStoreInstallationStepType.POST_ONBOARDING,
                        completedDatetime: null,
                    },
                ],
            },
            isLoading: false,
        } as any)

        mockIsAiAgentEnabledForStore.mockReturnValue(false)

        const { result } = renderUseAiAgentOverviewModeEnabled()

        expect(result.current).toEqual({
            isAiAgentLiveModeEnabled: false,
            isLoading: false,
        })
    })

    it('should return isAiAgentLiveModeEnabled as false when agent is during deployment', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...defaultStoreConfigContext,
        })

        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: {
                postStoreInstallationSteps: [
                    {
                        type: PostStoreInstallationStepType.POST_ONBOARDING,
                        completedDatetime: '2023-01-01T00:00:00Z',
                    },
                ],
            },
            isLoading: false,
        } as any)

        mockIsAiAgentEnabledForStore.mockReturnValue(true)
        mockUseIsAiAgentDuringDeployment.mockReturnValue([
            true,
            jest.fn(),
            jest.fn(),
        ])

        const { result } = renderUseAiAgentOverviewModeEnabled()

        expect(result.current).toEqual({
            isAiAgentLiveModeEnabled: false,
            isLoading: false,
        })
    })
})
