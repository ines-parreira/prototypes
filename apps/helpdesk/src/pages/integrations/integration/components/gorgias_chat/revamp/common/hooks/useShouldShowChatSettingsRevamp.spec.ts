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
    describe('shouldShowRevampWhenAiAgentEnabled (ChatSettingsRevamp flag only)', () => {
        it('should be true when ChatSettingsRevamp is enabled and AI agent is enabled', () => {
            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowRevampWhenAiAgentEnabled).toBe(true)
        })

        it('should be false when ChatSettingsRevamp is disabled', () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowRevampWhenAiAgentEnabled).toBe(
                false,
            )
        })

        it('should be false when AI agent is disabled', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowRevampWhenAiAgentEnabled).toBe(
                false,
            )
        })
    })

    describe('shouldShowRevampForNonAiAgent (NonAiAgentChat2Revamp flag)', () => {
        it('should be true when both flags are enabled and AI agent is disabled', () => {
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

            expect(result.current.shouldShowRevampForNonAiAgent).toBe(true)
        })

        it('should be false when ChatSettingsRevamp is disabled', () => {
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

            expect(result.current.shouldShowRevampForNonAiAgent).toBe(false)
        })

        it('should be false when NonAiAgentChat2Revamp is disabled', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowRevampForNonAiAgent).toBe(false)
        })

        it('should be false when AI agent is enabled (handled by the AI agent path instead)', () => {
            mockUseFlagWithLoading.mockImplementation((key) => ({
                value:
                    key === FeatureFlagKey.ChatSettingsRevamp ||
                    key === FeatureFlagKey.NonAiAgentChat2Revamp,
                isLoading: false,
            }))

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(result.current.shouldShowRevampForNonAiAgent).toBe(false)
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
