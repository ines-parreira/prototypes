import { renderHook } from '@repo/testing'

import useAppSelector from 'hooks/useAppSelector'
import {
    useGetPostStoreInstallationStepsPure,
    useUpdateStepNotificationsPure,
} from 'models/aiAgentPostStoreInstallationSteps/queries'
import {
    PostStoreInstallationStepStatus,
    PostStoreInstallationStepType,
    StepName,
} from 'models/aiAgentPostStoreInstallationSteps/types'

import { usePostOnboardingNudges } from '../usePostOnboardingNudges'

jest.mock('models/aiAgentPostStoreInstallationSteps/queries')
jest.mock('hooks/useAppSelector')

const mockUseGetPostStoreInstallationStepsPure =
    useGetPostStoreInstallationStepsPure as jest.Mock
const mockUseUpdateStepNotificationsPure =
    useUpdateStepNotificationsPure as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock

const mockAccountId = 123
const mockShopName = 'test-shop'
const mockShopType = 'shopify'

const createMockPostOnboardingStep = (overrides = {}) => {
    const now = new Date()
    const eightDaysAgo = new Date(now)
    eightDaysAgo.setDate(now.getDate() - 8)

    return {
        id: 'step-123',
        type: PostStoreInstallationStepType.POST_ONBOARDING,
        status: PostStoreInstallationStepStatus.IN_PROGRESS,
        updatedDatetime: eightDaysAgo.toISOString(),
        stepsConfiguration: [
            {
                stepName: StepName.TRAIN,
                stepStartedDatetime: eightDaysAgo.toISOString(),
                stepCompletedDatetime: null,
                stepDismissedDatetime: null,
            },
        ],
        notificationsConfiguration: {
            guidanceInactivityAcknowledgedAt: null,
            deployInactivityAcknowledgedAt: null,
        },
        ...overrides,
    }
}

interface SetupMockOptions {
    postOnboardingStep?: any
    isFetching?: boolean
    refetch?: jest.Mock
}

const setupMockGetPostStoreInstallationSteps = (
    options: SetupMockOptions = {},
) => {
    const {
        postOnboardingStep = null,
        isFetching = false,
        refetch = jest.fn(),
    } = options

    const postStoreInstallationSteps = postOnboardingStep
        ? [postOnboardingStep]
        : []

    mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
        data:
            postStoreInstallationSteps.length > 0
                ? { postStoreInstallationSteps }
                : null,
        isFetching,
        refetch,
    })
}

describe('usePostOnboardingNudges', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseAppSelector.mockImplementation(() => mockAccountId)

        setupMockGetPostStoreInstallationSteps()

        mockUseUpdateStepNotificationsPure.mockReturnValue({
            mutateAsync: jest.fn(),
        })
    })

    it('should return false for both nudges when loading', () => {
        setupMockGetPostStoreInstallationSteps({ isFetching: true })

        const { result } = renderHook(() =>
            usePostOnboardingNudges(mockShopName, mockShopType),
        )

        expect(result.current).toMatchObject({
            shouldDisplayTrainNudge: false,
            shouldDisplayDeployNudge: false,
            isLoading: true,
        })
    })

    it('should return false for both nudges when no post-onboarding step exists', () => {
        const wrongTypeStep = {
            type: PostStoreInstallationStepType.POST_GO_LIVE,
            stepsConfiguration: [],
            notificationsConfiguration: null,
        }

        setupMockGetPostStoreInstallationSteps({
            postOnboardingStep: wrongTypeStep,
        })

        const { result } = renderHook(() =>
            usePostOnboardingNudges(mockShopName, mockShopType),
        )

        expect(result.current).toMatchObject({
            shouldDisplayTrainNudge: false,
            shouldDisplayDeployNudge: false,
            isLoading: false,
        })
    })

    it('should display train nudge when train started more than threshold days ago and not completed', () => {
        const postOnboardingStep = createMockPostOnboardingStep()
        setupMockGetPostStoreInstallationSteps({ postOnboardingStep })

        const { result } = renderHook(() =>
            usePostOnboardingNudges(mockShopName, mockShopType),
        )

        expect(result.current).toMatchObject({
            shouldDisplayTrainNudge: true,
            shouldDisplayDeployNudge: false,
            isLoading: false,
        })
    })

    it('should not display train nudge when train started less than threshold days ago', () => {
        const now = new Date()
        const twoDaysAgo = new Date(now)
        twoDaysAgo.setDate(now.getDate() - 2)

        const postOnboardingStep = createMockPostOnboardingStep({
            updatedDatetime: twoDaysAgo.toISOString(),
            stepsConfiguration: [
                {
                    stepName: StepName.TRAIN,
                    stepStartedDatetime: twoDaysAgo.toISOString(),
                    stepCompletedDatetime: null,
                    stepDismissedDatetime: null,
                },
            ],
        })

        setupMockGetPostStoreInstallationSteps({ postOnboardingStep })

        const { result } = renderHook(() =>
            usePostOnboardingNudges(mockShopName, mockShopType),
        )

        expect(result.current).toMatchObject({
            shouldDisplayTrainNudge: false,
            shouldDisplayDeployNudge: false,
            isLoading: false,
        })
    })

    it('should not display train nudge when guidance inactivity was acknowledged', () => {
        const postOnboardingStep = createMockPostOnboardingStep({
            notificationsConfiguration: {
                guidanceInactivityAcknowledgedAt: new Date().toISOString(),
                deployInactivityAcknowledgedAt: null,
            },
        })

        setupMockGetPostStoreInstallationSteps({ postOnboardingStep })

        const { result } = renderHook(() =>
            usePostOnboardingNudges(mockShopName, mockShopType),
        )

        expect(result.current).toMatchObject({
            shouldDisplayTrainNudge: false,
            shouldDisplayDeployNudge: false,
            isLoading: false,
        })
    })

    it('should display deploy nudge when both train and test are completed and threshold days passed', () => {
        const now = new Date()
        const tenDaysAgo = new Date(now)
        tenDaysAgo.setDate(now.getDate() - 10)
        const eightDaysAgo = new Date(now)
        eightDaysAgo.setDate(now.getDate() - 8)

        const postOnboardingStep = createMockPostOnboardingStep({
            stepsConfiguration: [
                {
                    stepName: StepName.TRAIN,
                    stepStartedDatetime: tenDaysAgo.toISOString(),
                    stepCompletedDatetime: eightDaysAgo.toISOString(),
                    stepDismissedDatetime: null,
                },
                {
                    stepName: StepName.TEST,
                    stepStartedDatetime: eightDaysAgo.toISOString(),
                    stepCompletedDatetime: eightDaysAgo.toISOString(),
                    stepDismissedDatetime: null,
                },
            ],
        })

        setupMockGetPostStoreInstallationSteps({ postOnboardingStep })

        const { result } = renderHook(() =>
            usePostOnboardingNudges(mockShopName, mockShopType),
        )

        expect(result.current).toMatchObject({
            shouldDisplayTrainNudge: false,
            shouldDisplayDeployNudge: true,
            isLoading: false,
        })
    })

    it('should not display deploy nudge when deploy inactivity was acknowledged', () => {
        const now = new Date()
        const tenDaysAgo = new Date(now)
        tenDaysAgo.setDate(now.getDate() - 10)
        const eightDaysAgo = new Date(now)
        eightDaysAgo.setDate(now.getDate() - 8)

        const postOnboardingStep = createMockPostOnboardingStep({
            stepsConfiguration: [
                {
                    stepName: StepName.TRAIN,
                    stepStartedDatetime: tenDaysAgo.toISOString(),
                    stepCompletedDatetime: eightDaysAgo.toISOString(),
                    stepDismissedDatetime: null,
                },
                {
                    stepName: StepName.TEST,
                    stepStartedDatetime: eightDaysAgo.toISOString(),
                    stepCompletedDatetime: eightDaysAgo.toISOString(),
                    stepDismissedDatetime: null,
                },
            ],
            notificationsConfiguration: {
                guidanceInactivityAcknowledgedAt: null,
                deployInactivityAcknowledgedAt: new Date().toISOString(),
            },
        })

        setupMockGetPostStoreInstallationSteps({ postOnboardingStep })

        const { result } = renderHook(() =>
            usePostOnboardingNudges(mockShopName, mockShopType),
        )

        expect(result.current).toMatchObject({
            shouldDisplayTrainNudge: false,
            shouldDisplayDeployNudge: false,
            isLoading: false,
        })
    })

    it('should call updateNotifications with guidanceInactivityAcknowledgedAt when dismissTrainNudge is called', async () => {
        const mockPostOnboardingStepId = 'step-123'
        const mockMutateAsync = jest.fn().mockResolvedValue({})
        const mockRefetch = jest.fn()

        const postOnboardingStep = createMockPostOnboardingStep({
            id: mockPostOnboardingStepId,
        })

        setupMockGetPostStoreInstallationSteps({
            postOnboardingStep,
            refetch: mockRefetch,
        })

        mockUseUpdateStepNotificationsPure.mockReturnValue({
            mutateAsync: mockMutateAsync,
        })

        const { result } = renderHook(() =>
            usePostOnboardingNudges(mockShopName, mockShopType),
        )

        expect(result.current.shouldDisplayTrainNudge).toBe(true)

        await result.current.dismissTrainNudge()

        expect(mockMutateAsync).toHaveBeenCalledWith([
            mockPostOnboardingStepId,
            {
                guidanceInactivityAcknowledgedAt: expect.any(String),
            },
        ])

        expect(mockRefetch).toHaveBeenCalledTimes(1)
    })

    it('should call updateNotifications with deployInactivityAcknowledgedAt when dismissDeployNudge is called', async () => {
        const now = new Date()
        const tenDaysAgo = new Date(now)
        tenDaysAgo.setDate(now.getDate() - 10)
        const eightDaysAgo = new Date(now)
        eightDaysAgo.setDate(now.getDate() - 8)

        const mockPostOnboardingStepId = 'step-456'
        const mockMutateAsync = jest.fn().mockResolvedValue({})
        const mockRefetch = jest.fn()

        const postOnboardingStep = createMockPostOnboardingStep({
            id: mockPostOnboardingStepId,
            stepsConfiguration: [
                {
                    stepName: StepName.TRAIN,
                    stepStartedDatetime: tenDaysAgo.toISOString(),
                    stepCompletedDatetime: eightDaysAgo.toISOString(),
                    stepDismissedDatetime: null,
                },
                {
                    stepName: StepName.TEST,
                    stepStartedDatetime: eightDaysAgo.toISOString(),
                    stepCompletedDatetime: eightDaysAgo.toISOString(),
                    stepDismissedDatetime: null,
                },
            ],
        })

        setupMockGetPostStoreInstallationSteps({
            postOnboardingStep,
            refetch: mockRefetch,
        })

        mockUseUpdateStepNotificationsPure.mockReturnValue({
            mutateAsync: mockMutateAsync,
        })

        const { result } = renderHook(() =>
            usePostOnboardingNudges(mockShopName, mockShopType),
        )

        expect(result.current.shouldDisplayDeployNudge).toBe(true)

        await result.current.dismissDeployNudge()

        expect(mockMutateAsync).toHaveBeenCalledWith([
            mockPostOnboardingStepId,
            {
                deployInactivityAcknowledgedAt: expect.any(String),
            },
        ])

        expect(mockRefetch).toHaveBeenCalledTimes(1)
    })
})
