import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'

import {
    getPrimaryLanguageFromChatConfig,
    isTextsMultiLanguage,
} from 'config/integrations/gorgias_chat'
import { LanguageChat } from 'constants/languages'
import type { GorgiasChatIntegration } from 'models/integration/types'
import { parseToFriendlyErrorMessage } from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatFallbackSettingsForm.utils'
import { multiLanguageInitialTextsEmptyData } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/GorgiasTranslateText/GorgiasTranslateText'
import type {
    TextsMultiLanguage,
    TextsPerLanguage,
} from 'rest_api/gorgias_chat_protected_api/types'
import * as integrationsActions from 'state/integrations/actions'

import { useHandoverCustomizationChatLanguageTextsConfiguration } from '../useHandoverCustomizationChatLanguageTextsConfiguration'

// Mock external dependencies
jest.mock('config/integrations/gorgias_chat', () => ({
    getPrimaryLanguageFromChatConfig: jest.fn(),
    isTextsMultiLanguage: jest.fn(),
}))

jest.mock('state/integrations/actions', () => ({
    getApplicationTexts: jest.fn(),
    updateApplicationTexts: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatFallbackSettingsForm.utils',
    () => ({
        parseToFriendlyErrorMessage: jest.fn(),
    }),
)

const createMockTextsPerLanguage = (type: string): TextsPerLanguage => ({
    texts: {
        offlineMessage: `Test offline message ${type}`,
    },
    sspTexts: {},
    meta: {},
})

const createMockTextsMultiLanguage = (): TextsMultiLanguage => ({
    ...multiLanguageInitialTextsEmptyData,
    [LanguageChat.EnglishUs]: createMockTextsPerLanguage('english'),
    [LanguageChat.FrenchFr]: createMockTextsPerLanguage('french'),
})

describe('useHandoverCustomizationChatLanguageConfiguration', () => {
    const mockGetPrimaryLanguageFromChatConfig =
        getPrimaryLanguageFromChatConfig as jest.MockedFunction<
            typeof getPrimaryLanguageFromChatConfig
        >
    const mockIsTextsMultiLanguage =
        isTextsMultiLanguage as jest.MockedFunction<typeof isTextsMultiLanguage>
    const mockGetApplicationTexts =
        integrationsActions.getApplicationTexts as jest.MockedFunction<
            typeof integrationsActions.getApplicationTexts
        >
    const mockUpdateApplicationTexts =
        integrationsActions.updateApplicationTexts as jest.MockedFunction<
            typeof integrationsActions.updateApplicationTexts
        >

    const mockIntegration = {
        meta: {
            app_id: 'test-app-id',
        },
    } as GorgiasChatIntegration

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetPrimaryLanguageFromChatConfig.mockReturnValue('en-US')
        mockIsTextsMultiLanguage.mockReturnValue(false)
        mockGetApplicationTexts.mockResolvedValue(
            createMockTextsPerLanguage('english'),
        )
        mockUpdateApplicationTexts.mockResolvedValue(undefined)
    })

    it('should initialize with no loading state and empty data when app_id is null', async () => {
        const { result } = renderHook(() =>
            useHandoverCustomizationChatLanguageTextsConfiguration({
                ...mockIntegration,
                meta: { ...mockIntegration.meta, app_id: undefined },
            }),
        )

        expect(result.current.isLoading).toBe(false)

        expect(result.current.multiLanguageTexts).toEqual(
            multiLanguageInitialTextsEmptyData,
        )

        expect(result.current.hasLoadingError).toBe(false)

        expect(mockGetApplicationTexts).not.toHaveBeenCalled()
    })

    describe('texts fetching', () => {
        it('should fetch application texts on mount', async () => {
            renderHook(() =>
                useHandoverCustomizationChatLanguageTextsConfiguration(
                    mockIntegration,
                ),
            )

            await waitFor(() => {
                expect(mockGetApplicationTexts).toHaveBeenCalledWith(
                    'test-app-id',
                )
            })
        })

        it('should control the loading state during the fetching process', async () => {
            const { result } = renderHook(() =>
                useHandoverCustomizationChatLanguageTextsConfiguration(
                    mockIntegration,
                ),
            )

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })
        })

        it('should fetch new texts when integration changes', async () => {
            const { rerender } = renderHook(
                ({ integration }) =>
                    useHandoverCustomizationChatLanguageTextsConfiguration(
                        integration,
                    ),
                { initialProps: { integration: mockIntegration } },
            )

            await waitFor(() => {
                expect(mockGetApplicationTexts).toHaveBeenCalledTimes(1)
            })

            const newIntegration = {
                ...mockIntegration,
                id: 'new-integration-id',
                meta: { ...mockIntegration.meta, app_id: 'new-app-id' },
            }

            rerender({ integration: newIntegration as any })

            await waitFor(() => {
                expect(mockGetApplicationTexts).toHaveBeenCalledTimes(2)
                expect(mockGetApplicationTexts).toHaveBeenCalledWith(
                    'new-app-id',
                )
            })
        })

        it('should handle loading error when fetching texts', async () => {
            mockGetApplicationTexts.mockRejectedValue(new Error('Test error'))

            const { result } = renderHook(() =>
                useHandoverCustomizationChatLanguageTextsConfiguration(
                    mockIntegration,
                ),
            )

            await waitFor(() => {
                expect(result.current.hasLoadingError).toBe(true)
                expect(result.current.isLoading).toBe(false)
                expect(result.current.multiLanguageTexts).toEqual(
                    multiLanguageInitialTextsEmptyData,
                )
            })
        })

        it('should handle single language texts response when the response is single language', async () => {
            const singleLanguageTexts = createMockTextsPerLanguage('english')
            mockGetApplicationTexts.mockResolvedValue(singleLanguageTexts)
            mockIsTextsMultiLanguage.mockReturnValue(false)

            const { result } = renderHook(() =>
                useHandoverCustomizationChatLanguageTextsConfiguration(
                    mockIntegration,
                ),
            )

            await waitFor(() => {
                expect(mockIsTextsMultiLanguage).toHaveBeenCalledWith(
                    singleLanguageTexts,
                )
                expect(result.current.multiLanguageTexts).toHaveProperty(
                    LanguageChat.EnglishUs,
                )
                expect(
                    result.current.multiLanguageTexts[LanguageChat.EnglishUs]
                        .texts,
                ).toEqual(singleLanguageTexts.texts)
            })

            // validate that the other languages are created and are empty
            for (const language of Object.keys(
                multiLanguageInitialTextsEmptyData,
            ).filter((language) => language !== LanguageChat.EnglishUs)) {
                expect(
                    result.current.multiLanguageTexts[language as LanguageChat],
                ).toEqual({
                    texts: {},
                    sspTexts: {},
                    meta: {},
                })
            }
        })

        it('should handle multi-language texts response when the response is multi-language', async () => {
            const multiLanguageTexts = createMockTextsMultiLanguage()

            mockGetApplicationTexts.mockResolvedValue(multiLanguageTexts)
            mockIsTextsMultiLanguage.mockReturnValue(true)

            const { result } = renderHook(() =>
                useHandoverCustomizationChatLanguageTextsConfiguration(
                    mockIntegration,
                ),
            )

            await waitFor(() => {
                expect(result.current.multiLanguageTexts).toEqual(
                    multiLanguageTexts,
                )
                expect(
                    result.current.multiLanguageTexts[LanguageChat.EnglishUs]
                        .texts.offlineMessage,
                ).toBe('Test offline message english')
                expect(
                    result.current.multiLanguageTexts[LanguageChat.FrenchFr]
                        .texts.offlineMessage,
                ).toBe('Test offline message french')
            })

            // languages with no texts should be empty
            for (const language of [
                LanguageChat.Spanish,
                LanguageChat.German,
                LanguageChat.Italian,
            ]) {
                expect(
                    result.current.multiLanguageTexts[language as LanguageChat],
                ).toEqual({
                    texts: {},
                    sspTexts: {},
                    meta: {},
                })
            }
        })
    })

    describe('Update texts', () => {
        it('should call integrationsActions.updateApplicationTexts with correct parameters when updateMultiLanguageTexts is called', async () => {
            const { result } = renderHook(() =>
                useHandoverCustomizationChatLanguageTextsConfiguration(
                    mockIntegration,
                ),
            )

            await waitFor(() => {
                const updatedTexts = createMockTextsMultiLanguage()
                updatedTexts[LanguageChat.EnglishUs].texts.offlineMessage =
                    'Updated offline message english'
                updatedTexts[LanguageChat.FrenchFr].texts.offlineMessage =
                    'Updated offline message french'

                act(() => {
                    result.current.updateMultiLanguageTexts(updatedTexts)
                })

                expect(mockUpdateApplicationTexts).toHaveBeenCalledWith(
                    'test-app-id',
                    updatedTexts,
                )
            })
        })

        it('should update multiLanguageTexts state after successful update', async () => {
            const { result } = renderHook(() =>
                useHandoverCustomizationChatLanguageTextsConfiguration(
                    mockIntegration,
                ),
            )

            await waitFor(() => {
                const updatedTexts = createMockTextsMultiLanguage()
                updatedTexts[LanguageChat.EnglishUs].texts.offlineMessage =
                    'Updated offline message english'
                updatedTexts[LanguageChat.FrenchFr].texts.offlineMessage =
                    'Updated offline message french'

                // Mock the update to return the updated texts
                mockUpdateApplicationTexts.mockResolvedValue()

                act(() => {
                    result.current.updateMultiLanguageTexts(updatedTexts)
                })

                expect(result.current.multiLanguageTexts).toEqual(updatedTexts)
                expect(
                    result.current.multiLanguageTexts[LanguageChat.EnglishUs]
                        .texts.offlineMessage,
                ).toBe('Updated offline message english')
                expect(
                    result.current.multiLanguageTexts[LanguageChat.FrenchFr]
                        .texts.offlineMessage,
                ).toBe('Updated offline message french')
            })

            // languages with no texts should be empty
            for (const language of [
                LanguageChat.Spanish,
                LanguageChat.German,
                LanguageChat.Italian,
            ]) {
                expect(
                    result.current.multiLanguageTexts[language as LanguageChat],
                ).toEqual({
                    texts: {},
                    sspTexts: {},
                    meta: {},
                })
            }
        })

        it('should handle axios error when updating application texts', async () => {
            const { result } = renderHook(() =>
                useHandoverCustomizationChatLanguageTextsConfiguration(
                    mockIntegration,
                ),
            )

            await waitFor(() => {
                expect(result.current).toBeDefined()
            })

            const expectedAxiosError = new AxiosError('Failed to update')

            mockUpdateApplicationTexts.mockRejectedValue(expectedAxiosError)
            ;(parseToFriendlyErrorMessage as jest.Mock).mockReturnValue(
                'Failed to update with friendly message',
            )

            let caughtError: unknown

            await act(async () => {
                try {
                    await result.current.updateMultiLanguageTexts(
                        createMockTextsMultiLanguage(),
                    )
                } catch (error) {
                    caughtError = error
                }
            })

            expect(caughtError).toBeInstanceOf(Error)

            const err = caughtError as AxiosError

            expect(parseToFriendlyErrorMessage).toHaveBeenCalledWith(
                expectedAxiosError,
            )
            expect(err.message).toBe('Failed to update with friendly message')
        })

        it('should handle generic error when updating application texts', async () => {
            const { result } = renderHook(() =>
                useHandoverCustomizationChatLanguageTextsConfiguration(
                    mockIntegration,
                ),
            )

            await waitFor(() => {
                expect(result.current).toBeDefined()
            })

            const expectedGenericError = new Error('Failed to update')

            mockUpdateApplicationTexts.mockRejectedValue(expectedGenericError)
            ;(parseToFriendlyErrorMessage as jest.Mock).mockReturnValue(
                'Failed to update with friendly message',
            )

            await act(async () => {
                try {
                    await result.current.updateMultiLanguageTexts(
                        createMockTextsMultiLanguage(),
                    )
                } catch (error) {
                    expect(error).toBeInstanceOf(Error)
                    const err = error as AxiosError

                    expect(parseToFriendlyErrorMessage).not.toHaveBeenCalled()

                    expect(err.message).toBe(
                        'An unknown error occurred. Please try again',
                    )
                }
            })
        })

        it('should not change the multiLanguageTexts state when updating application texts fails', async () => {
            // Set up initial state with known values
            const initialTexts = createMockTextsMultiLanguage()
            initialTexts[LanguageChat.EnglishUs].texts.offlineMessage =
                'Initial offline message english'
            initialTexts[LanguageChat.FrenchFr].texts.offlineMessage =
                'Initial offline message french'

            // Mock getApplicationTexts to return our initial state
            mockGetApplicationTexts.mockResolvedValue(initialTexts)
            mockIsTextsMultiLanguage.mockReturnValue(true)

            mockUpdateApplicationTexts.mockRejectedValue(
                new Error('Update failed'),
            )

            // Render the hook with initial state
            const { result } = renderHook(() =>
                useHandoverCustomizationChatLanguageTextsConfiguration(
                    mockIntegration,
                ),
            )

            await waitFor(() => {
                expect(result.current).toBeDefined()
            })

            //initial state
            expect(result.current.isLoading).toBe(false)
            expect(result.current.multiLanguageTexts).toEqual(initialTexts)
            expect(
                result.current.multiLanguageTexts[LanguageChat.EnglishUs].texts
                    .offlineMessage,
            ).toBe('Initial offline message english')
            expect(
                result.current.multiLanguageTexts[LanguageChat.FrenchFr].texts
                    .offlineMessage,
            ).toBe('Initial offline message french')

            const updatedTexts = {
                ...initialTexts,
                [LanguageChat.EnglishUs]: {
                    ...initialTexts[LanguageChat.EnglishUs],
                    texts: {
                        offlineMessage: 'Updated offline message english',
                    },
                },
                [LanguageChat.FrenchFr]: {
                    ...initialTexts[LanguageChat.FrenchFr],
                    texts: {
                        offlineMessage: 'Updated offline message french',
                    },
                },
            }

            // Attempt to update texts
            await act(async () => {
                try {
                    await result.current.updateMultiLanguageTexts(updatedTexts)
                } catch {
                    // do nothing
                }
            })

            await waitFor(() => {
                expect(result.current.multiLanguageTexts).toEqual(initialTexts)
                expect(
                    result.current.multiLanguageTexts[LanguageChat.EnglishUs]
                        .texts.offlineMessage,
                ).toBe('Initial offline message english')
                expect(
                    result.current.multiLanguageTexts[LanguageChat.FrenchFr]
                        .texts.offlineMessage,
                ).toBe('Initial offline message french')

                // languages with no texts should be empty
                for (const language of [
                    LanguageChat.Spanish,
                    LanguageChat.German,
                    LanguageChat.Italian,
                ]) {
                    expect(
                        result.current.multiLanguageTexts[
                            language as LanguageChat
                        ],
                    ).toEqual({
                        texts: {},
                        sspTexts: {},
                        meta: {},
                    })
                }

                expect(result.current.isLoading).toBe(false)
            })
        })
    })
})
