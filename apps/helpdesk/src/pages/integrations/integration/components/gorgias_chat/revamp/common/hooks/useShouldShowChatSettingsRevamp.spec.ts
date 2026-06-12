import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'

import type { StoreIntegration } from 'models/integration/types'

import { useChatRedesignCutoffDate } from './useChatRedesignCutoffDate'
import { useChatRedesignOptIn } from './useChatRedesignOptIn'
import { useIsAiAgentEnabled } from './useIsAiAgentEnabled'
import { useShouldShowChatSettingsRevamp } from './useShouldShowChatSettingsRevamp'

jest.mock('@repo/feature-flags')
jest.mock('./useIsAiAgentEnabled')
jest.mock('./useChatRedesignOptIn')
jest.mock('./useChatRedesignCutoffDate')

const mockUseFlagWithLoading = useFlagWithLoading as jest.MockedFunction<
    typeof useFlagWithLoading
>
const mockUseIsAiAgentEnabled = useIsAiAgentEnabled as jest.MockedFunction<
    typeof useIsAiAgentEnabled
>
const mockUseChatRedesignOptIn = useChatRedesignOptIn as jest.MockedFunction<
    typeof useChatRedesignOptIn
>
const mockUseChatRedesignCutoffDate =
    useChatRedesignCutoffDate as jest.MockedFunction<
        typeof useChatRedesignCutoffDate
    >

const mockStoreIntegration = {} as StoreIntegration

const revampFlagEnabled = (key: FeatureFlagKey) => ({
    value: key === FeatureFlagKey.ChatSettingsRevamp,
    isLoading: false,
})

beforeEach(() => {
    jest.clearAllMocks()
    mockUseFlagWithLoading.mockImplementation(revampFlagEnabled)
    mockUseIsAiAgentEnabled.mockReturnValue({
        isAiAgentEnabled: true,
        isLoading: false,
    })
    mockUseChatRedesignOptIn.mockReturnValue({
        isOptedIn: false,
        optInDatetime: undefined,
    })
    mockUseChatRedesignCutoffDate.mockReturnValue({
        cutoffDateLabel: 'August 1st',
        isPastCutoff: false,
    })
})

describe('useShouldShowChatSettingsRevamp', () => {
    describe('shouldShowNonAiAgentChatSettingsRevamp', () => {
        it('is true when NonAiAgentChat2Revamp is enabled and AI agent is disabled', () => {
            mockUseFlagWithLoading.mockImplementation((key) => ({
                value: key === FeatureFlagKey.NonAiAgentChat2Revamp,
                isLoading: false,
            }))
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowNonAiAgentChatSettingsRevamp).toBe(
                true,
            )
        })

        it('is false when AI agent is enabled even if NonAiAgentChat2Revamp is enabled', () => {
            mockUseFlagWithLoading.mockImplementation((key) => ({
                value: key === FeatureFlagKey.NonAiAgentChat2Revamp,
                isLoading: false,
            }))

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowNonAiAgentChatSettingsRevamp).toBe(
                false,
            )
        })

        it('is false when AI agent is disabled and NonAiAgentChat2Revamp is disabled', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowNonAiAgentChatSettingsRevamp).toBe(
                false,
            )
        })
    })

    describe('shouldShowChatSettingsRevamp', () => {
        it('is true when ChatSettingsRevamp is enabled and AI agent is enabled', () => {
            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowChatSettingsRevamp).toBe(true)
        })

        it('is true when ChatSettingsRevamp and NonAiAgentChat2Revamp are enabled and AI agent is disabled', () => {
            mockUseFlagWithLoading.mockImplementation((key) => ({
                value:
                    key === FeatureFlagKey.ChatSettingsRevamp ||
                    key === FeatureFlagKey.NonAiAgentChat2Revamp,
                isLoading: false,
            }))
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowChatSettingsRevamp).toBe(true)
        })

        it('is false when ChatSettingsRevamp is disabled', () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowChatSettingsRevamp).toBe(false)
        })

        it('is false when AI agent is disabled and NonAiAgentChat2Revamp is disabled', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowChatSettingsRevamp).toBe(false)
        })
    })

    describe('shouldShowNonAiAgentRevamp', () => {
        it('is true when ChatSettingsRevamp and NonAiAgentChat2Revamp are enabled and AI agent is disabled', () => {
            mockUseFlagWithLoading.mockImplementation((key) => ({
                value:
                    key === FeatureFlagKey.ChatSettingsRevamp ||
                    key === FeatureFlagKey.NonAiAgentChat2Revamp,
                isLoading: false,
            }))
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowNonAiAgentRevamp).toBe(true)
        })

        it('is false when ChatSettingsRevamp is disabled', () => {
            mockUseFlagWithLoading.mockImplementation((key) => ({
                value: key === FeatureFlagKey.NonAiAgentChat2Revamp,
                isLoading: false,
            }))
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowNonAiAgentRevamp).toBe(false)
        })

        it('is false when NonAiAgentChat2Revamp is disabled', () => {
            mockUseFlagWithLoading.mockImplementation((key) => ({
                value: key === FeatureFlagKey.ChatSettingsRevamp,
                isLoading: false,
            }))
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowNonAiAgentRevamp).toBe(false)
        })

        it('is false when AI agent is enabled even if both flags are on', () => {
            mockUseFlagWithLoading.mockImplementation((key) => ({
                value:
                    key === FeatureFlagKey.ChatSettingsRevamp ||
                    key === FeatureFlagKey.NonAiAgentChat2Revamp,
                isLoading: false,
            }))
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: true,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowNonAiAgentRevamp).toBe(false)
        })
    })

    describe('shouldShowLegacyChatCustomization', () => {
        it('is true when AI agent is disabled and the customer has not opted in', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })
            mockUseChatRedesignOptIn.mockReturnValue({
                isOptedIn: false,
                optInDatetime: undefined,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowLegacyChatCustomization).toBe(true)
        })

        it('is false when AI agent is disabled but the customer has opted in', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })
            mockUseChatRedesignOptIn.mockReturnValue({
                isOptedIn: true,
                optInDatetime: '2026-05-01T00:00:00Z',
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowLegacyChatCustomization).toBe(false)
        })

        it('is false when AI agent is enabled', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: true,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowLegacyChatCustomization).toBe(false)
        })

        it('is false while the AI agent config is loading', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowLegacyChatCustomization).toBe(false)
        })

        it('is false when the chat redesign cutoff date has passed', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })
            mockUseChatRedesignCutoffDate.mockReturnValue({
                cutoffDateLabel: 'August 1st',
                isPastCutoff: true,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowLegacyChatCustomization).toBe(false)
        })

        it('is false when the EnforceChatRedesignWithoutAiAgent flag is on', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })
            mockUseFlagWithLoading.mockImplementation((key) => ({
                value: key === FeatureFlagKey.EnforceChatRedesignWithoutAiAgent,
                isLoading: false,
            }))

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowLegacyChatCustomization).toBe(false)
        })
    })

    describe('isLoading', () => {
        it('should be true when ChatSettingsRevamp flag is loading', () => {
            mockUseFlagWithLoading.mockImplementation((key) => ({
                value: false,
                isLoading: key === FeatureFlagKey.ChatSettingsRevamp,
            }))

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('should be true when NonAiAgentChat2Revamp flag is loading', () => {
            mockUseFlagWithLoading.mockImplementation((key) => ({
                value: false,
                isLoading: key === FeatureFlagKey.NonAiAgentChat2Revamp,
            }))

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('should be true when EnforceChat2WithoutAiAgent flag is loading', () => {
            mockUseFlagWithLoading.mockImplementation((key) => ({
                value: false,
                isLoading:
                    key === FeatureFlagKey.EnforceChatRedesignWithoutAiAgent,
            }))

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('should be true when AI agent check is loading', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('should be false when nothing is loading', () => {
            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.isLoading).toBe(false)
        })
    })
})
