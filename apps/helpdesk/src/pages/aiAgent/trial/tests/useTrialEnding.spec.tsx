import moment from 'moment'

import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { renderHook } from 'utils/testing/renderHook'

// Mock dependencies
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone')

const mockUseStoreActivations = jest.mocked(useStoreActivations)
const mockUseSalesTrialRevampMilestone = jest.mocked(
    useSalesTrialRevampMilestone,
)

// Helper to create mock store activation
const createMockStoreActivation = (remainingDays: number) => {
    const now = moment().startOf('hour')
    const trialEndDatetime = now
        .clone()
        .add(remainingDays, 'days')
        .toISOString()
    const trialStartDatetime = now.clone().subtract(14, 'days').toISOString()

    return {
        name: 'test-store',
        title: 'Test Store',
        alerts: [],
        configuration: {
            storeName: 'test-store',
            sales: {
                trial: {
                    startDatetime: trialStartDatetime,
                    endDatetime: trialEndDatetime,
                    account: {
                        actualTerminationDatetime:
                            remainingDays <= 0
                                ? now.clone().subtract(1, 'day').toISOString()
                                : null,
                    },
                },
            },
        },
        enabled: true,
        processing: false,
        lastCreatedOrder: null,
        lastImportedOrder: null,
    } as any // Use 'as any' to avoid complex type matching in tests
}

// Helper to create mock useStoreActivations return value
const createMockUseStoreActivationsReturn = (storeActivation: any) => ({
    storeActivations: {
        'test-store': storeActivation,
    },
    progressPercentage: 0,
    isFetchLoading: false,
    isSaveLoading: false,
    changeSales: jest.fn(),
    changeSupport: jest.fn(),
    changeSupportChat: jest.fn(),
    changeSupportEmail: jest.fn(),
    changeGorgias: jest.fn(),
    changeActiveAssistantFeatures: jest.fn(),
    changeActiveVoiceFeatures: jest.fn(),
    changeGorgiasFeatures: jest.fn(),
    saveStoreConfigurations: jest.fn(),
    migrateToNewPricing: jest.fn(),
    endTrial: jest.fn(),
    activation: jest.fn(),
})

describe('useTrialEnding', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        // Enable the milestone-1 feature for tests
        mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-1')

        // Default mock with 5 days remaining
        mockUseStoreActivations.mockReturnValue(
            createMockUseStoreActivationsReturn(createMockStoreActivation(5)),
        )
    })

    describe('basic functionality', () => {
        it('should return remainingDays, trialEndDatetime, and trialTerminationDatetime', () => {
            const { result } = renderHook(() => useTrialEnding('test-store'))

            expect(result.current).toHaveProperty('remainingDays')
            expect(result.current).toHaveProperty('trialEndDatetime')
            expect(result.current).toHaveProperty('trialTerminationDatetime')
        })

        it('should calculate remainingDays correctly', () => {
            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(
                    createMockStoreActivation(3),
                ),
            )

            const { result } = renderHook(() => useTrialEnding('test-store'))

            expect(result.current.remainingDays).toBe(3)
        })

        it('should return trialEndDatetime as ISO string', () => {
            const { result } = renderHook(() => useTrialEnding('test-store'))

            expect(typeof result.current.trialEndDatetime).toBe('string')
            expect(moment(result.current.trialEndDatetime).isValid()).toBe(true)
        })

        it('should return trialTerminationDatetime when trial has ended', () => {
            const storeActivation = createMockStoreActivation(0)
            const terminationDate = moment().subtract(1, 'hour').toISOString()
            storeActivation.configuration.sales.trial.account.actualTerminationDatetime =
                terminationDate

            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(storeActivation),
            )

            const { result } = renderHook(() => useTrialEnding('test-store'))

            expect(result.current.trialTerminationDatetime).toBe(
                terminationDate,
            )
        })
    })

    describe('edge cases', () => {
        it('should return empty trial ending when store activation is not found', () => {
            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(null),
            )

            const { result } = renderHook(() =>
                useTrialEnding('nonexistent-store'),
            )

            expect(result.current.remainingDays).toBe(0)
            expect(result.current.trialEndDatetime).toBeUndefined()
            expect(result.current.trialTerminationDatetime).toBeUndefined()
        })

        it('should return empty trial ending when trial dates are missing', () => {
            const storeActivation = createMockStoreActivation(5)
            storeActivation.configuration.sales.trial.startDatetime = null

            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(storeActivation),
            )

            const { result } = renderHook(() => useTrialEnding('test-store'))

            expect(result.current.remainingDays).toBe(0)
            expect(result.current.trialEndDatetime).toBeUndefined()
            expect(result.current.trialTerminationDatetime).toBeUndefined()
        })

        it('should handle negative remaining days (trial ended)', () => {
            const storeActivation = createMockStoreActivation(-2)

            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(storeActivation),
            )

            const { result } = renderHook(() => useTrialEnding('test-store'))

            expect(result.current.remainingDays).toBe(0) // Math.max(0, negative) = 0
        })

        it('should handle trial ending today (remainingDays = 0)', () => {
            const storeActivation = createMockStoreActivation(0)

            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(storeActivation),
            )

            const { result } = renderHook(() => useTrialEnding('test-store'))

            expect(result.current.remainingDays).toBe(0)
        })

        it('should handle trial ending tomorrow (remainingDays = 1)', () => {
            const storeActivation = createMockStoreActivation(1)

            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(storeActivation),
            )

            const { result } = renderHook(() => useTrialEnding('test-store'))

            expect(result.current.remainingDays).toBe(1)
        })
    })

    describe('store name parameter', () => {
        it('should use the provided store name to fetch activation', () => {
            renderHook(() => useTrialEnding('custom-store'))

            expect(mockUseStoreActivations).toHaveBeenCalledWith({
                storeName: 'custom-store',
            })
        })

        it('should handle empty store name', () => {
            const { result } = renderHook(() => useTrialEnding(''))

            expect(result.current.remainingDays).toBe(0)
            expect(result.current.trialEndDatetime).toBeUndefined()
            expect(result.current.trialTerminationDatetime).toBeUndefined()
        })
    })
})
