import { act, renderHook, waitFor } from '@testing-library/react'

import {
    PostStoreInstallationStepStatus,
    PostStoreInstallationStepType,
} from 'models/aiAgentPostStoreInstallationSteps/types'
import { mockPostStoreInstallationStep } from 'pages/aiAgent/fixtures/post-store-installation-steps.fixture'

import { DEFAULT_POST_ONBOARDING_STEPS } from '../../components/PostOnboardingTasksSection/utils'
import { useInitializePostOnboardingSteps } from '../useInitializePostOnboardingSteps'

jest.mock('hooks/useAppSelector')
jest.mock('models/aiAgent/queries')
jest.mock('models/aiAgentPostStoreInstallationSteps/queries')
jest.mock('pages/aiAgent/utils/store-configuration.utils')

const mockUseAppSelector = jest.fn()
const mockUseGetStoreConfigurationPure = jest.fn()
const mockUseGetPostStoreInstallationStepsPure = jest.fn()
const mockUseCreatePostStoreInstallationStepPure = jest.fn()
const mockUseUpdatePostStoreInstallationStepPure = jest.fn()
const mockIsAiAgentEnabledForStore = jest.fn()

jest.requireMock('hooks/useAppSelector').default = mockUseAppSelector
jest.requireMock('models/aiAgent/queries').useGetStoreConfigurationPure =
    mockUseGetStoreConfigurationPure
jest.requireMock(
    'models/aiAgentPostStoreInstallationSteps/queries',
).useGetPostStoreInstallationStepsPure =
    mockUseGetPostStoreInstallationStepsPure
jest.requireMock(
    'models/aiAgentPostStoreInstallationSteps/queries',
).useCreatePostStoreInstallationStepPure =
    mockUseCreatePostStoreInstallationStepPure
jest.requireMock(
    'models/aiAgentPostStoreInstallationSteps/queries',
).useUpdatePostStoreInstallationStepPure =
    mockUseUpdatePostStoreInstallationStepPure
jest.requireMock(
    'pages/aiAgent/utils/store-configuration.utils',
).isAiAgentEnabledForStore = mockIsAiAgentEnabledForStore

const mockAccountId = mockPostStoreInstallationStep.accountId
const mockShopName = mockPostStoreInstallationStep.shopName
const mockShopType = mockPostStoreInstallationStep.shopType
const mockAccountDomain = 'test-domain.myshopify.com'

const mockStoreConfiguration = {
    data: {
        storeConfiguration: {
            id: 1,
            status: 'active',
        },
    },
}

const mockPostOnboardingStep = {
    ...mockPostStoreInstallationStep,
    type: PostStoreInstallationStepType.POST_ONBOARDING,
    status: PostStoreInstallationStepStatus.NOT_STARTED,
}

const mockCreatePostOnboardingStep = jest.fn()
const mockUpdatePostOnboardingStep = jest.fn()
const mockRefetch = jest.fn()

const mockAccountState = {
    get: jest.fn((key: string) => {
        if (key === 'domain') return mockAccountDomain
        if (key === 'id') return mockAccountId
        return undefined
    }),
}

describe('useInitializePostOnboardingSteps', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAppSelector.mockReturnValue(mockAccountState)

        mockUseGetStoreConfigurationPure.mockReturnValue({
            data: mockStoreConfiguration,
            isLoading: false,
        })

        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: null,
            isLoading: false,
            refetch: mockRefetch,
        })

        mockUseCreatePostStoreInstallationStepPure.mockReturnValue({
            mutateAsync: mockCreatePostOnboardingStep,
        })

        mockUseUpdatePostStoreInstallationStepPure.mockReturnValue({
            mutateAsync: mockUpdatePostOnboardingStep,
        })

        mockIsAiAgentEnabledForStore.mockReturnValue(false)
    })

    describe('Loading states', () => {
        it('should return isLoading true when steps are loading', () => {
            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: null,
                isLoading: true,
                refetch: mockRefetch,
            })

            const { result } = renderHook(() =>
                useInitializePostOnboardingSteps(mockShopName, mockShopType),
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('should return isLoading true when step does not exist yet', () => {
            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: null,
                isLoading: false,
                refetch: mockRefetch,
            })

            const { result } = renderHook(() =>
                useInitializePostOnboardingSteps(mockShopName, mockShopType),
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('should return isLoading false when step exists', () => {
            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [mockPostOnboardingStep],
                },
                isLoading: false,
                refetch: mockRefetch,
            })

            const { result } = renderHook(() =>
                useInitializePostOnboardingSteps(mockShopName, mockShopType),
            )

            expect(result.current.isLoading).toBe(false)
        })

        it('should return isLoading false when disabled', () => {
            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: null,
                isLoading: false,
                refetch: mockRefetch,
            })

            const { result } = renderHook(() =>
                useInitializePostOnboardingSteps(
                    mockShopName,
                    mockShopType,
                    false,
                ),
            )

            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('Step initialization', () => {
        it('should not create step if it already exists', async () => {
            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [mockPostOnboardingStep],
                },
                isLoading: false,
                refetch: mockRefetch,
            })

            renderHook(() =>
                useInitializePostOnboardingSteps(mockShopName, mockShopType),
            )

            await waitFor(() => {
                expect(mockCreatePostOnboardingStep).not.toHaveBeenCalled()
            })
        })

        it('should create step with COMPLETED status when AI agent is enabled', async () => {
            mockIsAiAgentEnabledForStore.mockReturnValue(true)
            mockCreatePostOnboardingStep.mockResolvedValue({})

            renderHook(() =>
                useInitializePostOnboardingSteps(mockShopName, mockShopType),
            )

            await waitFor(() => {
                expect(mockCreatePostOnboardingStep).toHaveBeenCalledWith([
                    expect.objectContaining({
                        ...DEFAULT_POST_ONBOARDING_STEPS,
                        accountId: mockAccountId,
                        shopName: mockShopName,
                        shopType: mockShopType,
                        status: PostStoreInstallationStepStatus.COMPLETED,
                        completedDatetime: expect.any(String),
                    }),
                ])
            })
        })

        it('should create step with NOT_STARTED status when AI agent is disabled', async () => {
            mockIsAiAgentEnabledForStore.mockReturnValue(false)
            mockCreatePostOnboardingStep.mockResolvedValue({})

            renderHook(() =>
                useInitializePostOnboardingSteps(mockShopName, mockShopType),
            )

            await waitFor(() => {
                expect(mockCreatePostOnboardingStep).toHaveBeenCalledWith([
                    expect.objectContaining({
                        ...DEFAULT_POST_ONBOARDING_STEPS,
                        accountId: mockAccountId,
                        shopName: mockShopName,
                        shopType: mockShopType,
                        status: PostStoreInstallationStepStatus.NOT_STARTED,
                        completedDatetime: null,
                    }),
                ])
            })
        })

        it('should refetch after creating step', async () => {
            mockCreatePostOnboardingStep.mockResolvedValue({})

            renderHook(() =>
                useInitializePostOnboardingSteps(mockShopName, mockShopType),
            )

            await waitFor(() => {
                expect(mockCreatePostOnboardingStep).toHaveBeenCalled()
            })

            await waitFor(() => {
                expect(mockRefetch).toHaveBeenCalled()
            })
        })

        it('should handle case when store configuration is not available', async () => {
            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: null,
                isLoading: false,
            })
            mockCreatePostOnboardingStep.mockResolvedValue({})

            renderHook(() =>
                useInitializePostOnboardingSteps(mockShopName, mockShopType),
            )

            await waitFor(() => {
                expect(mockCreatePostOnboardingStep).toHaveBeenCalledWith([
                    expect.objectContaining({
                        status: PostStoreInstallationStepStatus.NOT_STARTED,
                        completedDatetime: null,
                    }),
                ])
            })
        })
    })

    describe('Enabled flag', () => {
        it('should not initialize when enabled is false', async () => {
            renderHook(() =>
                useInitializePostOnboardingSteps(
                    mockShopName,
                    mockShopType,
                    false,
                ),
            )

            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 100))
            })

            expect(mockCreatePostOnboardingStep).not.toHaveBeenCalled()
        })

        it('should initialize when enabled is true', async () => {
            mockCreatePostOnboardingStep.mockResolvedValue({})

            renderHook(() =>
                useInitializePostOnboardingSteps(
                    mockShopName,
                    mockShopType,
                    true,
                ),
            )

            await waitFor(() => {
                expect(mockCreatePostOnboardingStep).toHaveBeenCalled()
            })
        })

        it('should default enabled to true when not provided', async () => {
            mockCreatePostOnboardingStep.mockResolvedValue({})

            renderHook(() =>
                useInitializePostOnboardingSteps(mockShopName, mockShopType),
            )

            await waitFor(() => {
                expect(mockCreatePostOnboardingStep).toHaveBeenCalled()
            })
        })
    })

    describe('Effect dependencies', () => {
        it('should not run when store is loading', async () => {
            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: null,
                isLoading: true,
            })

            renderHook(() =>
                useInitializePostOnboardingSteps(mockShopName, mockShopType),
            )

            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 100))
            })

            expect(mockCreatePostOnboardingStep).not.toHaveBeenCalled()
        })

        it('should not run when steps are loading', async () => {
            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: null,
                isLoading: true,
                refetch: mockRefetch,
            })

            renderHook(() =>
                useInitializePostOnboardingSteps(mockShopName, mockShopType),
            )

            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 100))
            })

            expect(mockCreatePostOnboardingStep).not.toHaveBeenCalled()
        })

        it('should run when loading completes', async () => {
            const { rerender } = renderHook(() =>
                useInitializePostOnboardingSteps(mockShopName, mockShopType),
            )

            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: mockStoreConfiguration,
                isLoading: false,
            })

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: { postStoreInstallationSteps: [] },
                isLoading: false,
                refetch: mockRefetch,
            })

            mockCreatePostOnboardingStep.mockResolvedValue({})

            rerender()

            await waitFor(() => {
                expect(mockCreatePostOnboardingStep).toHaveBeenCalled()
            })
        })
    })

    describe('Mark step as completed', () => {
        it('should mark step as completed when AI agent is enabled and step exists', async () => {
            const notStartedStep = {
                ...mockPostOnboardingStep,
                status: PostStoreInstallationStepStatus.NOT_STARTED,
            }

            mockIsAiAgentEnabledForStore.mockReturnValue(true)
            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [notStartedStep],
                },
                isLoading: false,
                refetch: mockRefetch,
            })
            mockUpdatePostOnboardingStep.mockResolvedValue({})

            renderHook(() =>
                useInitializePostOnboardingSteps(mockShopName, mockShopType),
            )

            await waitFor(() => {
                expect(mockUpdatePostOnboardingStep).toHaveBeenCalledWith([
                    notStartedStep.id,
                    expect.objectContaining({
                        status: PostStoreInstallationStepStatus.COMPLETED,
                        completedDatetime: expect.any(String),
                    }),
                ])
            })
        })

        it('should not mark step as completed when AI agent is disabled', async () => {
            mockIsAiAgentEnabledForStore.mockReturnValue(false)
            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [mockPostOnboardingStep],
                },
                isLoading: false,
                refetch: mockRefetch,
            })

            renderHook(() =>
                useInitializePostOnboardingSteps(mockShopName, mockShopType),
            )

            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 100))
            })

            expect(mockUpdatePostOnboardingStep).not.toHaveBeenCalled()
        })

        it('should not mark step as completed when already completed', async () => {
            const completedStep = {
                ...mockPostOnboardingStep,
                status: PostStoreInstallationStepStatus.COMPLETED,
                completedDatetime: '2023-01-01T00:00:00Z',
            }

            mockIsAiAgentEnabledForStore.mockReturnValue(true)
            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [completedStep],
                },
                isLoading: false,
                refetch: mockRefetch,
            })

            renderHook(() =>
                useInitializePostOnboardingSteps(mockShopName, mockShopType),
            )

            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 100))
            })

            expect(mockUpdatePostOnboardingStep).not.toHaveBeenCalled()
        })
    })
})
