import { StoreConfiguration } from 'models/aiAgent/types'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { ToneOfVoice } from 'pages/aiAgent/constants'
import { useIsTrialStarted } from 'pages/aiAgent/trial/hooks/useIsTrialStarted'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { atLeastOneStoreHasActiveTrial } from 'pages/aiAgent/trial/utils/utils'
import { renderHook } from 'utils/testing/renderHook'

// Mock dependencies
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone')
jest.mock('pages/aiAgent/trial/utils/utils')

const mockUseStoreActivations = jest.mocked(useStoreActivations)
const mockUseSalesTrialRevampMilestone = jest.mocked(
    useSalesTrialRevampMilestone,
)
const mockAtLeastOneStoreHasActiveTrial = jest.mocked(
    atLeastOneStoreHasActiveTrial,
)

describe('useIsTrialStarted', () => {
    const mockStoreConfiguration: StoreConfiguration = {
        storeName: 'test-store',
        sales: {
            trial: {
                startDatetime: '2024-01-01T00:00:00Z',
                endDatetime: '2024-01-08T00:00:00Z',
                account: {
                    plannedUpgradeDatetime: null,
                    optInDatetime: null,
                    optOutDatetime: null,
                    actualUpgradeDatetime: null,
                    actualTerminationDatetime: null,
                },
            },
        },
        // Add required properties with default values
        trialModeActivatedDatetime: null,
        previewModeActivatedDatetime: null,
        shopType: 'shopify',
        helpCenterId: null,
        snippetHelpCenterId: 1,
        guidanceHelpCenterId: 1,
        useEmailIntegrationSignature: false,
        toneOfVoice: ToneOfVoice.Professional,
        customToneOfVoiceGuidance: null,
        aiAgentLanguage: 'en',
        signature: '',
        excludedTopics: [],
        tags: [],
        conversationBot: {} as any,
        monitoredEmailIntegrations: [],
        monitoredChatIntegrations: [],
        silentHandover: false,
        ticketSampleRate: 1,
        dryRun: false,
        isDraft: false,
        wizardId: null,
        floatingChatInputConfigurationId: null,
        chatChannelDeactivatedDatetime: null,
        emailChannelDeactivatedDatetime: null,
        previewModeValidUntilDatetime: null,
        scopes: [],
        createdDatetime: '2024-01-01T00:00:00Z',
        salesDiscountMax: null,
        salesDiscountStrategyLevel: null,
        salesPersuasionLevel: null,
        salesDeactivatedDatetime: null,
        isConversationStartersEnabled: false,
        isSalesHelpOnSearchEnabled: null,
        customFieldIds: [],
        handoverMethod: null,
        handoverEmail: null,
        handoverEmailIntegrationId: null,
        handoverHttpIntegrationId: null,
    } as StoreConfiguration

    const mockStoreActivations = {
        'test-store': {
            name: 'test-store',
            configuration: mockStoreConfiguration,
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseStoreActivations.mockReturnValue({
            storeActivations: mockStoreActivations,
            isFetchLoading: false,
        } as any)

        mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
        mockAtLeastOneStoreHasActiveTrial.mockReturnValue(true)
    })

    describe('when storeConfiguration is not provided', () => {
        it('should return false', () => {
            const { result } = renderHook(() =>
                useIsTrialStarted({ storeConfiguration: undefined }),
            )

            expect(result.current).toBe(false)
        })
    })

    describe('when storeActivations is empty', () => {
        it('should return false', () => {
            mockUseStoreActivations.mockReturnValue({
                storeActivations: {},
                isFetchLoading: false,
            } as any)

            const { result } = renderHook(() =>
                useIsTrialStarted({
                    storeConfiguration: mockStoreConfiguration,
                }),
            )

            expect(result.current).toBe(false)
        })
    })

    describe('when valid storeConfiguration and storeActivations are provided', () => {
        it('should call atLeastOneStoreHasActiveTrial with correct parameters for milestone-0', () => {
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')

            renderHook(() =>
                useIsTrialStarted({
                    storeConfiguration: mockStoreConfiguration,
                }),
            )

            expect(mockAtLeastOneStoreHasActiveTrial).toHaveBeenCalledWith(
                [mockStoreConfiguration],
                false, // isRevampTrialMilestone1Enabled should be false for milestone-0
                {
                    'test-store': mockStoreActivations['test-store'],
                },
            )
        })

        it('should call atLeastOneStoreHasActiveTrial with correct parameters for milestone-1', () => {
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-1')

            renderHook(() =>
                useIsTrialStarted({
                    storeConfiguration: mockStoreConfiguration,
                }),
            )

            expect(mockAtLeastOneStoreHasActiveTrial).toHaveBeenCalledWith(
                [mockStoreConfiguration],
                true, // isRevampTrialMilestone1Enabled should be true for milestone-1
                {
                    'test-store': mockStoreActivations['test-store'],
                },
            )
        })

        it('should return true when atLeastOneStoreHasActiveTrial returns true', () => {
            mockAtLeastOneStoreHasActiveTrial.mockReturnValue(true)

            const { result } = renderHook(() =>
                useIsTrialStarted({
                    storeConfiguration: mockStoreConfiguration,
                }),
            )

            expect(result.current).toBe(true)
        })

        it('should return false when atLeastOneStoreHasActiveTrial returns false', () => {
            mockAtLeastOneStoreHasActiveTrial.mockReturnValue(false)

            const { result } = renderHook(() =>
                useIsTrialStarted({
                    storeConfiguration: mockStoreConfiguration,
                }),
            )

            expect(result.current).toBe(false)
        })
    })

    describe('when store configuration is not found in storeActivations', () => {
        it('should still call atLeastOneStoreHasActiveTrial with undefined selectedStoreActivation', () => {
            const differentStoreConfig = {
                ...mockStoreConfiguration,
                storeName: 'different-store',
            }

            renderHook(() =>
                useIsTrialStarted({ storeConfiguration: differentStoreConfig }),
            )

            expect(mockAtLeastOneStoreHasActiveTrial).toHaveBeenCalledWith(
                [differentStoreConfig],
                false,
                {
                    'different-store': undefined,
                },
            )
        })
    })

    describe('milestone detection', () => {
        it('should correctly identify milestone-0 as not revamp trial', () => {
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')

            renderHook(() =>
                useIsTrialStarted({
                    storeConfiguration: mockStoreConfiguration,
                }),
            )

            expect(mockAtLeastOneStoreHasActiveTrial).toHaveBeenCalledWith(
                expect.anything(),
                false,
                expect.anything(),
            )
        })

        it('should correctly identify milestone-1 as revamp trial', () => {
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-1')

            renderHook(() =>
                useIsTrialStarted({
                    storeConfiguration: mockStoreConfiguration,
                }),
            )

            expect(mockAtLeastOneStoreHasActiveTrial).toHaveBeenCalledWith(
                expect.anything(),
                true,
                expect.anything(),
            )
        })

        it('should handle other milestone values as not revamp trial', () => {
            mockUseSalesTrialRevampMilestone.mockReturnValue(
                'milestone-2' as any,
            )

            renderHook(() =>
                useIsTrialStarted({
                    storeConfiguration: mockStoreConfiguration,
                }),
            )

            expect(mockAtLeastOneStoreHasActiveTrial).toHaveBeenCalledWith(
                expect.anything(),
                false,
                expect.anything(),
            )
        })
    })

    describe('edge cases', () => {
        it('should handle storeConfiguration without storeName', () => {
            const configWithoutStoreName = {
                ...mockStoreConfiguration,
                storeName: '',
            }

            renderHook(() =>
                useIsTrialStarted({
                    storeConfiguration: configWithoutStoreName,
                }),
            )

            expect(mockAtLeastOneStoreHasActiveTrial).toHaveBeenCalledWith(
                [configWithoutStoreName],
                false,
                {
                    '': undefined,
                },
            )
        })

        it('should handle storeConfiguration without sales trial data', () => {
            const configWithoutSales = {
                ...mockStoreConfiguration,
                sales: undefined,
            }

            renderHook(() =>
                useIsTrialStarted({ storeConfiguration: configWithoutSales }),
            )

            expect(mockAtLeastOneStoreHasActiveTrial).toHaveBeenCalledWith(
                [configWithoutSales],
                false,
                {
                    'test-store': mockStoreActivations['test-store'],
                },
            )
        })

        it('should work when storeActivations is loading', () => {
            mockUseStoreActivations.mockReturnValue({
                storeActivations: mockStoreActivations,
                isFetchLoading: true,
            } as any)

            renderHook(() =>
                useIsTrialStarted({
                    storeConfiguration: mockStoreConfiguration,
                }),
            )

            expect(mockAtLeastOneStoreHasActiveTrial).toHaveBeenCalled()
        })
    })
})
