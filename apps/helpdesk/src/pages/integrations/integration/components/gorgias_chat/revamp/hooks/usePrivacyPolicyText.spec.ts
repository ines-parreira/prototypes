import { act, renderHook, waitFor } from '@testing-library/react'

import { Language, LanguageChat } from 'constants/languages'
import { GorgiasChatEmailCaptureType } from 'models/integration/types'
import {
    getApplicationTexts,
    updateApplicationTexts,
} from 'state/integrations/actions'

import { usePrivacyPolicyText } from './usePrivacyPolicyText'

jest.mock('state/integrations/actions', () => ({
    getApplicationTexts: jest.fn(),
    updateApplicationTexts: jest.fn(),
}))

const mockGetApplicationTexts = getApplicationTexts as jest.MockedFunction<
    typeof getApplicationTexts
>
const mockUpdateApplicationTexts =
    updateApplicationTexts as jest.MockedFunction<typeof updateApplicationTexts>

const mockIntegrationMeta = {
    app_id: 'app-123',
    languages: [{ language: Language.EnglishUs, primary: true }],
    self_service: {},
    preferences: {
        email_capture_enforcement: GorgiasChatEmailCaptureType.Optional,
    },
}

describe('usePrivacyPolicyText', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUpdateApplicationTexts.mockResolvedValue(undefined)
    })

    it('should not fetch texts when chatApplicationId is undefined', () => {
        renderHook(() =>
            usePrivacyPolicyText({
                chatApplicationId: undefined,
                integrationMeta: mockIntegrationMeta,
            }),
        )

        expect(mockGetApplicationTexts).not.toHaveBeenCalled()
    })

    it('should initialize privacyPolicyText as undefined before fetch completes', () => {
        mockGetApplicationTexts.mockReturnValue(new Promise(() => {}))

        const { result } = renderHook(() =>
            usePrivacyPolicyText({
                chatApplicationId: 'app-123',
                integrationMeta: mockIntegrationMeta,
            }),
        )

        expect(result.current.privacyPolicyText).toBeUndefined()
    })

    it('should set privacyPolicyText from multi-language response', async () => {
        mockGetApplicationTexts.mockResolvedValue({
            [LanguageChat.EnglishUs]: {
                texts: { privacyPolicyDisclaimer: 'Privacy disclaimer text' },
                sspTexts: {},
                meta: {},
            },
        } as any)

        const { result } = renderHook(() =>
            usePrivacyPolicyText({
                chatApplicationId: 'app-123',
                integrationMeta: mockIntegrationMeta,
            }),
        )

        await waitFor(() => {
            expect(result.current.privacyPolicyText).toBe(
                'Privacy disclaimer text',
            )
        })
    })

    it('should set privacyPolicyText to empty string when privacyPolicyDisclaimer is missing', async () => {
        mockGetApplicationTexts.mockResolvedValue({
            [LanguageChat.EnglishUs]: {
                texts: {},
                sspTexts: {},
                meta: {},
            },
        } as any)

        const { result } = renderHook(() =>
            usePrivacyPolicyText({
                chatApplicationId: 'app-123',
                integrationMeta: mockIntegrationMeta,
            }),
        )

        await waitFor(() => {
            expect(result.current.privacyPolicyText).toBe('')
        })
    })

    it('should allow updating privacyPolicyText via setPrivacyPolicyText', async () => {
        mockGetApplicationTexts.mockResolvedValue({
            [LanguageChat.EnglishUs]: {
                texts: { privacyPolicyDisclaimer: 'Original text' },
                sspTexts: {},
                meta: {},
            },
        } as any)

        const { result } = renderHook(() =>
            usePrivacyPolicyText({
                chatApplicationId: 'app-123',
                integrationMeta: mockIntegrationMeta,
            }),
        )

        await waitFor(() => {
            expect(result.current.privacyPolicyText).toBe('Original text')
        })

        act(() => {
            result.current.setPrivacyPolicyText('Updated text')
        })

        expect(result.current.privacyPolicyText).toBe('Updated text')
    })

    describe('savePrivacyPolicyText', () => {
        it('should not call updateApplicationTexts when chatApplicationId is undefined', async () => {
            const { result } = renderHook(() =>
                usePrivacyPolicyText({
                    chatApplicationId: undefined,
                    integrationMeta: mockIntegrationMeta,
                }),
            )

            act(() => {
                result.current.savePrivacyPolicyText('some text')
            })

            expect(mockUpdateApplicationTexts).not.toHaveBeenCalled()
        })

        it('should not call updateApplicationTexts when text is undefined', async () => {
            mockGetApplicationTexts.mockResolvedValue({
                [LanguageChat.EnglishUs]: {
                    texts: {},
                    sspTexts: {},
                    meta: {},
                },
            } as any)

            const { result } = renderHook(() =>
                usePrivacyPolicyText({
                    chatApplicationId: 'app-123',
                    integrationMeta: mockIntegrationMeta,
                }),
            )

            act(() => {
                result.current.savePrivacyPolicyText(undefined)
            })

            expect(mockUpdateApplicationTexts).not.toHaveBeenCalled()
        })

        it('should call updateApplicationTexts with updated texts', async () => {
            mockGetApplicationTexts.mockResolvedValue({
                [LanguageChat.EnglishUs]: {
                    texts: { privacyPolicyDisclaimer: 'Original' },
                    sspTexts: {},
                    meta: {},
                },
            } as any)

            const { result } = renderHook(() =>
                usePrivacyPolicyText({
                    chatApplicationId: 'app-123',
                    integrationMeta: mockIntegrationMeta,
                }),
            )

            await waitFor(() => {
                expect(result.current.privacyPolicyText).toBe('Original')
            })

            act(() => {
                result.current.savePrivacyPolicyText('New disclaimer')
            })

            await waitFor(() => {
                expect(mockUpdateApplicationTexts).toHaveBeenCalledWith(
                    'app-123',
                    expect.objectContaining({
                        [LanguageChat.EnglishUs]: expect.objectContaining({
                            texts: expect.objectContaining({
                                privacyPolicyDisclaimer: 'New disclaimer',
                            }),
                        }),
                    }),
                )
            })
        })
    })
})
