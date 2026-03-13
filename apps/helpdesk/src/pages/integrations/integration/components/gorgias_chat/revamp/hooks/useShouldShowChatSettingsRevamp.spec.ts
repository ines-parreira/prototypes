import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { renderHook } from '@testing-library/react'

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

const onlyRevampFlagEnabled = (key: FeatureFlagKey) => ({
    value: key === FeatureFlagKey.ChatSettingsRevamp,
    isLoading: false,
})

const bothFlagsEnabled = (key: FeatureFlagKey) => ({
    value:
        key === FeatureFlagKey.ChatSettingsRevamp ||
        key === FeatureFlagKey.ChatSettingsScreensRevamp,
    isLoading: false,
})

beforeEach(() => {
    jest.clearAllMocks()
    mockUseFlagWithLoading.mockImplementation(bothFlagsEnabled)
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

        it('should be true when only ChatSettingsRevamp is enabled (screens flag disabled)', () => {
            mockUseFlagWithLoading.mockImplementation(onlyRevampFlagEnabled)

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

    describe('shouldShowScreensRevampWhenAiAgentEnabled (both flags required)', () => {
        it('should be true when both flags are enabled and AI agent is enabled', () => {
            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(
                result.current.shouldShowScreensRevampWhenAiAgentEnabled,
            ).toBe(true)
        })

        it('should be false when ChatSettingsScreensRevamp is disabled', () => {
            mockUseFlagWithLoading.mockImplementation(onlyRevampFlagEnabled)

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(
                result.current.shouldShowScreensRevampWhenAiAgentEnabled,
            ).toBe(false)
        })

        it('should be false when ChatSettingsRevamp is disabled', () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(
                result.current.shouldShowScreensRevampWhenAiAgentEnabled,
            ).toBe(false)
        })

        it('should be false when AI agent is disabled', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockStoreIntegration, 1),
            )

            expect(
                result.current.shouldShowScreensRevampWhenAiAgentEnabled,
            ).toBe(false)
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

        it('should be true when ChatSettingsScreensRevamp flag is loading', () => {
            mockUseFlagWithLoading.mockImplementation((key) => ({
                value: false,
                isLoading: key === FeatureFlagKey.ChatSettingsScreensRevamp,
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
