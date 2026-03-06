import { renderHook } from '@repo/testing'
import moment from 'moment'

import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'

// Mock dependencies
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone')

const mockUseStoreActivations = jest.mocked(useStoreActivations)
const mockUseSalesTrialRevampMilestone = jest.mocked(
    useSalesTrialRevampMilestone,
)

// Helper to create mock store activation
const createMockStoreActivation = (
    remainingDays: number,
    trialType: TrialType = TrialType.ShoppingAssistant,
    extendedTrial = false,
) => {
    const now = moment().startOf('hour')
    const trialEndDatetime = now
        .clone()
        .add(remainingDays, 'days')
        .toISOString()
    // For extended trials, set start date beyond the standard 14-day duration
    const trialStartDatetime = extendedTrial
        ? now.clone().subtract(20, 'days').toISOString()
        : now.clone().subtract(14, 'days').toISOString()

    const trialConfig = {
        startDatetime: trialStartDatetime,
        endDatetime: trialEndDatetime,
        account: {
            actualTerminationDatetime:
                remainingDays <= 0
                    ? now.clone().subtract(1, 'day').toISOString()
                    : null,
            optOutDatetime: null,
        },
    }

    return {
        name: 'test-store',
        title: 'Test Store',
        alerts: [],
        configuration: {
            storeName: 'test-store',
            ...(trialType === TrialType.AiAgent
                ? { trial: trialConfig }
                : { sales: { trial: trialConfig } }),
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
    allStoreActivations: {
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

        // Default mock with 5 days remaining for ShoppingAssistant
        mockUseStoreActivations.mockReturnValue(
            createMockUseStoreActivationsReturn(
                createMockStoreActivation(5, TrialType.ShoppingAssistant),
            ),
        )
    })

    describe('basic functionality - ShoppingAssistant', () => {
        it('should return remainingDays, trialEndDatetime, trialTerminationDatetime, and isTrialExtended', () => {
            const { result } = renderHook(() =>
                useTrialEnding('test-store', TrialType.ShoppingAssistant),
            )

            expect(result.current).toHaveProperty('remainingDays')
            expect(result.current).toHaveProperty('trialEndDatetime')
            expect(result.current).toHaveProperty('trialTerminationDatetime')
            expect(result.current).toHaveProperty('isTrialExtended')
        })

        it('should calculate remainingDays correctly and isTrialExtended should be false for active trial', () => {
            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(
                    createMockStoreActivation(3, TrialType.ShoppingAssistant),
                ),
            )

            const { result } = renderHook(() =>
                useTrialEnding('test-store', TrialType.ShoppingAssistant),
            )

            expect(result.current.remainingDays).toBe(3)
            expect(result.current.isTrialExtended).toBe(false)
        })

        it('should return trialEndDatetime as ISO string', () => {
            const { result } = renderHook(() =>
                useTrialEnding('test-store', TrialType.ShoppingAssistant),
            )

            expect(typeof result.current.trialEndDatetime).toBe('string')
            expect(moment(result.current.trialEndDatetime).isValid()).toBe(true)
        })

        it('should return trialTerminationDatetime when trial has ended', () => {
            const storeActivation = createMockStoreActivation(
                0,
                TrialType.ShoppingAssistant,
            )
            const terminationDate = moment().subtract(1, 'hour').toISOString()
            storeActivation.configuration.sales.trial.account.actualTerminationDatetime =
                terminationDate

            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(storeActivation),
            )

            const { result } = renderHook(() =>
                useTrialEnding('test-store', TrialType.ShoppingAssistant),
            )

            expect(result.current.trialTerminationDatetime).toBe(
                terminationDate,
            )
        })
    })

    describe('basic functionality - aiAgent', () => {
        it('should return remainingDays, trialEndDatetime, trialTerminationDatetime, and isTrialExtended', () => {
            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(
                    createMockStoreActivation(5, TrialType.AiAgent),
                ),
            )

            const { result } = renderHook(() =>
                useTrialEnding('test-store', TrialType.AiAgent),
            )

            expect(result.current).toHaveProperty('remainingDays')
            expect(result.current).toHaveProperty('trialEndDatetime')
            expect(result.current).toHaveProperty('trialTerminationDatetime')
            expect(result.current).toHaveProperty('isTrialExtended')
        })

        it('should calculate remainingDays correctly and isTrialExtended should be false for active trial', () => {
            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(
                    createMockStoreActivation(3, TrialType.AiAgent),
                ),
            )

            const { result } = renderHook(() =>
                useTrialEnding('test-store', TrialType.AiAgent),
            )

            expect(result.current.remainingDays).toBe(3)
            expect(result.current.isTrialExtended).toBe(false)
        })

        it('should return trialTerminationDatetime when trial has ended', () => {
            const storeActivation = createMockStoreActivation(
                0,
                TrialType.AiAgent,
            )
            const terminationDate = moment().subtract(1, 'hour').toISOString()
            storeActivation.configuration.trial.account.actualTerminationDatetime =
                terminationDate

            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(storeActivation),
            )

            const { result } = renderHook(() =>
                useTrialEnding('test-store', TrialType.AiAgent),
            )

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
                useTrialEnding(
                    'nonexistent-store',
                    TrialType.ShoppingAssistant,
                ),
            )

            expect(result.current.remainingDays).toBe(0)
            expect(result.current.trialEndDatetime).toBeNull()
            expect(result.current.trialTerminationDatetime).toBeNull()
            expect(result.current.isTrialExtended).toBe(false)
        })

        it('should return empty trial ending when trial dates are missing - ShoppingAssistant', () => {
            const storeActivation = createMockStoreActivation(
                5,
                TrialType.ShoppingAssistant,
            )
            storeActivation.configuration.sales.trial.startDatetime = null

            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(storeActivation),
            )

            const { result } = renderHook(() =>
                useTrialEnding('test-store', TrialType.ShoppingAssistant),
            )

            expect(result.current.remainingDays).toBe(0)
            expect(result.current.trialEndDatetime).toBeNull()
            expect(result.current.trialTerminationDatetime).toBeNull()
            expect(result.current.isTrialExtended).toBe(false)
        })

        it('should return empty trial ending when trial dates are missing - aiAgent', () => {
            const storeActivation = createMockStoreActivation(
                5,
                TrialType.AiAgent,
            )
            storeActivation.configuration.trial.startDatetime = null

            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(storeActivation),
            )

            const { result } = renderHook(() =>
                useTrialEnding('test-store', TrialType.AiAgent),
            )

            expect(result.current.remainingDays).toBe(0)
            expect(result.current.trialEndDatetime).toBeNull()
            expect(result.current.trialTerminationDatetime).toBeNull()
            expect(result.current.isTrialExtended).toBe(false)
        })

        it('should handle negative remaining days (trial ended) - ShoppingAssistant', () => {
            const storeActivation = createMockStoreActivation(
                -2,
                TrialType.ShoppingAssistant,
            )

            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(storeActivation),
            )

            const { result } = renderHook(() =>
                useTrialEnding('test-store', TrialType.ShoppingAssistant),
            )

            expect(result.current.remainingDays).toBe(0) // Math.max(0, negative) = 0
        })

        it('should handle negative remaining days (trial ended) - aiAgent', () => {
            const storeActivation = createMockStoreActivation(
                -2,
                TrialType.AiAgent,
            )

            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(storeActivation),
            )

            const { result } = renderHook(() =>
                useTrialEnding('test-store', TrialType.AiAgent),
            )

            expect(result.current.remainingDays).toBe(0) // Math.max(0, negative) = 0
        })

        it('should handle trial ending today (remainingDays = 0)', () => {
            const storeActivation = createMockStoreActivation(
                0,
                TrialType.ShoppingAssistant,
            )

            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(storeActivation),
            )

            const { result } = renderHook(() =>
                useTrialEnding('test-store', TrialType.ShoppingAssistant),
            )

            expect(result.current.remainingDays).toBe(0)
        })

        it('should handle trial ending tomorrow (remainingDays = 1)', () => {
            const storeActivation = createMockStoreActivation(
                1,
                TrialType.ShoppingAssistant,
            )

            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(storeActivation),
            )

            const { result } = renderHook(() =>
                useTrialEnding('test-store', TrialType.ShoppingAssistant),
            )

            expect(result.current.remainingDays).toBe(1)
        })
    })

    describe('store name parameter', () => {
        it('should use the provided store name to fetch activation', () => {
            renderHook(() =>
                useTrialEnding('custom-store', TrialType.ShoppingAssistant),
            )

            expect(mockUseStoreActivations).toHaveBeenCalledWith({
                storeName: 'custom-store',
            })
        })

        it('should handle empty store name', () => {
            const { result } = renderHook(() =>
                useTrialEnding('', TrialType.ShoppingAssistant),
            )

            expect(result.current.remainingDays).toBe(0)
            expect(result.current.trialEndDatetime).toBeNull()
            expect(result.current.trialTerminationDatetime).toBeNull()
            expect(result.current.isTrialExtended).toBe(false)
        })
    })

    describe('isTrialExtended logic', () => {
        it('should return isTrialExtended=true when trial exceeds standard duration - ShoppingAssistant', () => {
            const storeActivation = createMockStoreActivation(
                5,
                TrialType.ShoppingAssistant,
                true, // Extended trial
            )

            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(storeActivation),
            )

            const { result } = renderHook(() =>
                useTrialEnding('test-store', TrialType.ShoppingAssistant),
            )

            expect(result.current.isTrialExtended).toBe(true)
            expect(result.current.remainingDays).toBe(5)
        })

        it('should return isTrialExtended=true when trial exceeds standard duration - AiAgent', () => {
            const storeActivation = createMockStoreActivation(
                3,
                TrialType.AiAgent,
                true, // Extended trial
            )

            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(storeActivation),
            )

            const { result } = renderHook(() =>
                useTrialEnding('test-store', TrialType.AiAgent),
            )

            expect(result.current.isTrialExtended).toBe(true)
            expect(result.current.remainingDays).toBe(3)
        })

        it('should return isTrialExtended=false for standard duration trial', () => {
            const storeActivation = createMockStoreActivation(
                1,
                TrialType.ShoppingAssistant,
                false, // Standard trial
            )

            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(storeActivation),
            )

            const { result } = renderHook(() =>
                useTrialEnding('test-store', TrialType.ShoppingAssistant),
            )

            expect(result.current.isTrialExtended).toBe(false)
            expect(result.current.remainingDays).toBe(1)
        })
    })

    describe('trial type switching', () => {
        it('should handle switching between trial types', () => {
            // Setup initial state with ShoppingAssistant trial
            const shoppingAssistantActivation = createMockStoreActivation(
                5,
                TrialType.ShoppingAssistant,
            )
            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(
                    shoppingAssistantActivation,
                ),
            )

            const { result, rerender } = renderHook(
                ({
                    storeName,
                    trialType,
                }: {
                    storeName: string
                    trialType: TrialType
                }) => useTrialEnding(storeName, trialType),
                {
                    initialProps: {
                        storeName: 'test-store',
                        trialType: TrialType.ShoppingAssistant,
                    },
                },
            )

            // Verify ShoppingAssistant trial data
            expect(result.current.remainingDays).toBe(5)

            // Switch to aiAgent trial
            const aiAgentActivation = createMockStoreActivation(
                3,
                TrialType.AiAgent,
            )
            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(aiAgentActivation),
            )

            rerender({ storeName: 'test-store', trialType: TrialType.AiAgent })

            // Verify aiAgent trial data
            expect(result.current.remainingDays).toBe(3)
        })

        it('should handle missing trial configuration for different trial types', () => {
            // Create activation with only ShoppingAssistant trial
            const activation = createMockStoreActivation(
                5,
                TrialType.ShoppingAssistant,
            )
            delete activation.configuration.trial // Remove aiAgent trial config

            mockUseStoreActivations.mockReturnValue(
                createMockUseStoreActivationsReturn(activation),
            )

            // Try to access aiAgent trial
            const { result } = renderHook(() =>
                useTrialEnding('test-store', TrialType.AiAgent),
            )

            // Should return empty trial ending
            expect(result.current.remainingDays).toBe(0)
            expect(result.current.trialEndDatetime).toBeNull()
            expect(result.current.trialTerminationDatetime).toBeNull()
            expect(result.current.isTrialExtended).toBe(false)
        })
    })
})
