import { act, renderHook } from '@repo/testing'

import {
    PostStoreInstallationStepStatus,
    StepName,
} from 'models/aiAgentPostStoreInstallationSteps/types'
import { mockPostStoreInstallationStep } from 'pages/aiAgent/fixtures/post-store-installation-steps.fixture'

import { usePostOnboardingTasksSection } from '../usePostOnboardingTasksSection'

jest.mock('hooks/useAppSelector')
jest.mock('models/aiAgentPostStoreInstallationSteps/queries')
jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQueryClient: jest.fn(),
}))

const mockUseAppSelector = jest.fn()
const mockUseGetPostStoreInstallationStepsPure = jest.fn()
const mockUseUpdatePostStoreInstallationStepPure = jest.fn()
const mockUseUpdateStepConfigurationPure = jest.fn()
const mockInvalidateQueries = jest.fn()
const mockUseQueryClient = jest.fn()

jest.requireMock('hooks/useAppSelector').default = mockUseAppSelector
jest.requireMock(
    'models/aiAgentPostStoreInstallationSteps/queries',
).useGetPostStoreInstallationStepsPure =
    mockUseGetPostStoreInstallationStepsPure
jest.requireMock(
    'models/aiAgentPostStoreInstallationSteps/queries',
).useUpdatePostStoreInstallationStepPure =
    mockUseUpdatePostStoreInstallationStepPure
jest.requireMock(
    'models/aiAgentPostStoreInstallationSteps/queries',
).useUpdateStepConfigurationPure = mockUseUpdateStepConfigurationPure
jest.requireMock('@tanstack/react-query').useQueryClient = mockUseQueryClient

const mockAccountId = mockPostStoreInstallationStep.accountId
const mockShopName = mockPostStoreInstallationStep.shopName
const mockShopType = mockPostStoreInstallationStep.shopType

const mockPostOnboardingSteps = {
    ...mockPostStoreInstallationStep,
    stepsConfiguration: [
        {
            stepName: StepName.TRAIN,
            stepStartedDatetime: null,
            stepCompletedDatetime: null,
            stepDismissedDatetime: null,
        },
        {
            stepName: StepName.TEST,
            stepStartedDatetime: '2023-01-01T00:00:00Z',
            stepCompletedDatetime: null,
            stepDismissedDatetime: null,
        },
        {
            stepName: StepName.DEPLOY,
            stepStartedDatetime: null,
            stepCompletedDatetime: '2023-01-02T00:00:00Z',
            stepDismissedDatetime: null,
        },
    ],
}

const mockUpdatePostStoreInstallationStep = jest.fn()
const mockUpdateStepConfig = jest.fn()

describe('usePostOnboardingTasksSection', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        mockUseAppSelector.mockReturnValue(mockAccountId)

        mockUseQueryClient.mockReturnValue({
            invalidateQueries: mockInvalidateQueries,
        })

        mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })

        mockUseUpdatePostStoreInstallationStepPure.mockReturnValue({
            mutateAsync: mockUpdatePostStoreInstallationStep,
        })

        mockUseUpdateStepConfigurationPure.mockReturnValue({
            mutateAsync: mockUpdateStepConfig,
        })
    })

    describe('API operations', () => {
        it('should handle GET operation states', () => {
            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: null,
                isLoading: true,
                isError: false,
            })

            const { result: loadingResult } = renderHook(() =>
                usePostOnboardingTasksSection({
                    shopName: mockShopName,
                    shopType: mockShopType,
                }),
            )

            expect(loadingResult.current.isLoading).toBe(true)
            expect(loadingResult.current.postOnboardingSteps).toBeNull()

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: null,
                isLoading: false,
                isError: true,
            })

            const { result: errorResult } = renderHook(() =>
                usePostOnboardingTasksSection({
                    shopName: mockShopName,
                    shopType: mockShopType,
                }),
            )

            expect(errorResult.current.isError).toBe(true)

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [mockPostOnboardingSteps],
                },
                isLoading: false,
                isError: false,
            })

            const { result: successResult, rerender } = renderHook(() =>
                usePostOnboardingTasksSection({
                    shopName: mockShopName,
                    shopType: mockShopType,
                }),
            )

            rerender()

            expect(successResult.current.postOnboardingSteps).toEqual(
                mockPostOnboardingSteps,
            )
        })

        it('should handle UPDATE step configuration', async () => {
            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [mockPostOnboardingSteps],
                },
                isLoading: false,
                isError: false,
            })

            const { result, rerender } = renderHook(() =>
                usePostOnboardingTasksSection({
                    shopName: mockShopName,
                    shopType: mockShopType,
                }),
            )

            rerender()

            const stepData = {
                stepName: StepName.TRAIN,
                stepCompletedDatetime: '2023-01-01T00:00:00Z',
            }

            await act(async () => {
                await result.current.updateStep(stepData)
            })

            expect(mockUpdateStepConfig).toHaveBeenCalledWith([
                mockPostOnboardingSteps.id,
                stepData,
            ])
        })

        it('should handle UPDATE post store installation', async () => {
            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [mockPostOnboardingSteps],
                },
                isLoading: false,
                isError: false,
            })

            const { result, rerender } = renderHook(() =>
                usePostOnboardingTasksSection({
                    shopName: mockShopName,
                    shopType: mockShopType,
                }),
            )

            rerender()

            const updatedPostOnboardingSteps = {
                ...mockPostOnboardingSteps,
                status: PostStoreInstallationStepStatus.COMPLETED,
            }

            await act(async () => {
                await result.current.updatePostStoreInstallation(
                    updatedPostOnboardingSteps,
                )
            })

            expect(mockUpdatePostStoreInstallationStep).toHaveBeenCalledWith([
                mockPostOnboardingSteps.id,
                updatedPostOnboardingSteps,
            ])
        })

        it('should update step status when not started', async () => {
            const notStartedSteps = {
                ...mockPostOnboardingSteps,
                status: PostStoreInstallationStepStatus.NOT_STARTED,
            }

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [notStartedSteps],
                },
                isLoading: false,
                isError: false,
            })

            const { result, rerender } = renderHook(() =>
                usePostOnboardingTasksSection({
                    shopName: mockShopName,
                    shopType: mockShopType,
                }),
            )

            rerender()

            const stepData = {
                stepName: StepName.TRAIN,
                stepStartedDatetime: '2023-01-01T00:00:00Z',
            }

            await act(async () => {
                await result.current.updateStep(stepData)
            })

            expect(mockUpdatePostStoreInstallationStep).toHaveBeenCalledWith([
                notStartedSteps.id,
                {
                    ...notStartedSteps,
                    status: PostStoreInstallationStepStatus.IN_PROGRESS,
                },
            ])
        })
    })

    describe('Internal state management', () => {
        it('should determine if steps are completed', () => {
            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [mockPostOnboardingSteps],
                },
                isLoading: false,
                isError: false,
            })

            const { result, rerender } = renderHook(() =>
                usePostOnboardingTasksSection({
                    shopName: mockShopName,
                    shopType: mockShopType,
                }),
            )

            rerender()

            expect(result.current.isStepCompleted(StepName.TRAIN)).toBe(false)
            expect(result.current.isStepCompleted(StepName.TEST)).toBe(false)
            expect(result.current.isStepCompleted(StepName.DEPLOY)).toBe(true)
        })

        it('should provide step configuration', () => {
            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [mockPostOnboardingSteps],
                },
                isLoading: false,
                isError: false,
            })

            const { result, rerender } = renderHook(() =>
                usePostOnboardingTasksSection({
                    shopName: mockShopName,
                    shopType: mockShopType,
                }),
            )

            rerender()

            const trainStep = result.current.step(StepName.TRAIN)

            expect(trainStep).toEqual(
                mockPostOnboardingSteps.stepsConfiguration[0],
            )
        })

        it('should calculate completed steps count', () => {
            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [mockPostOnboardingSteps],
                },
                isLoading: false,
                isError: false,
            })

            const { result, rerender } = renderHook(() =>
                usePostOnboardingTasksSection({
                    shopName: mockShopName,
                    shopType: mockShopType,
                }),
            )

            rerender()

            expect(result.current.completedStepsCount).toBe(1)
        })

        it('should return first uncompleted step name', () => {
            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [mockPostOnboardingSteps],
                },
                isLoading: false,
                isError: false,
            })

            const { result, rerender } = renderHook(() =>
                usePostOnboardingTasksSection({
                    shopName: mockShopName,
                    shopType: mockShopType,
                }),
            )

            rerender()

            expect(result.current.firstUncompletedStepName).toBe(StepName.TRAIN)
        })

        it('should return null when all steps are completed', () => {
            const allCompletedSteps = {
                ...mockPostOnboardingSteps,
                stepsConfiguration: [
                    {
                        stepName: StepName.TRAIN,
                        stepStartedDatetime: '2023-01-01T00:00:00Z',
                        stepCompletedDatetime: '2023-01-01T00:00:00Z',
                        stepDismissedDatetime: null,
                    },
                    {
                        stepName: StepName.TEST,
                        stepStartedDatetime: '2023-01-01T00:00:00Z',
                        stepCompletedDatetime: '2023-01-02T00:00:00Z',
                        stepDismissedDatetime: null,
                    },
                    {
                        stepName: StepName.DEPLOY,
                        stepStartedDatetime: '2023-01-01T00:00:00Z',
                        stepCompletedDatetime: '2023-01-03T00:00:00Z',
                        stepDismissedDatetime: null,
                    },
                ],
            }

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: {
                    postStoreInstallationSteps: [allCompletedSteps],
                },
                isLoading: false,
                isError: false,
            })

            const { result, rerender } = renderHook(() =>
                usePostOnboardingTasksSection({
                    shopName: mockShopName,
                    shopType: mockShopType,
                }),
            )

            rerender()

            expect(result.current.firstUncompletedStepName).toBeNull()
        })

        it('should return null when postOnboardingSteps is null', () => {
            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: null,
                isLoading: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                usePostOnboardingTasksSection({
                    shopName: mockShopName,
                    shopType: mockShopType,
                }),
            )

            expect(result.current.firstUncompletedStepName).toBeNull()
        })
    })
})
