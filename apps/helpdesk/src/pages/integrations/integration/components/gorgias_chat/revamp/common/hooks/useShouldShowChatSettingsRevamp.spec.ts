import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'

import type { StoreIntegration } from 'models/integration/types'

import { useIsAiAgentEnabled } from './useIsAiAgentEnabled'
import { useShouldShowChatSettingsRevamp } from './useShouldShowChatSettingsRevamp'

jest.mock('@repo/feature-flags')
jest.mock('./useIsAiAgentEnabled')

const mockUseFlagWithLoading = useFlagWithLoading as jest.MockedFunction<
    typeof useFlagWithLoading
>
const mockUseIsAiAgentEnabled = useIsAiAgentEnabled as jest.MockedFunction<
    typeof useIsAiAgentEnabled
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
