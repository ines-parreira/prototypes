import { assumeMock, renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'

import { Language } from 'constants/languages'
import { useNotify } from 'hooks/useNotify'
import { GorgiasChatIntegration } from 'models/integration/types'
import { CHANGES_SAVED_SUCCESS } from 'pages/aiAgent/constants'
import {
    getInitialFormValues,
    mapFromFormValuesToMultiLanguageText,
    mapFromMultiLanguageTextToFormValues,
} from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatFallbackSettingsForm.utils'

import { useHandoverCustomizationChatFallbackSettingsForm } from '../useHandoverCustomizationChatFallbackSettingsForm'
import { useHandoverCustomizationChatLanguageTextsConfiguration } from '../useHandoverCustomizationChatLanguageTextsConfiguration'

jest.mock('hooks/useNotify')

const useNotifyMock = assumeMock(useNotify)

jest.mock('../useHandoverCustomizationChatLanguageTextsConfiguration', () => ({
    useHandoverCustomizationChatLanguageTextsConfiguration: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatFallbackSettingsForm.utils',
    () => ({
        formFieldsConfiguration: {
            fallbackMessage: {
                maxLength: 30,
                friendlyName: 'Error message',
                required: false,
            },
        },
        getInitialFormValues: jest.fn(),
        mapFromMultiLanguageTextToFormValues: jest.fn(),
        mapFromFormValuesToMultiLanguageText: jest.fn(),
    }),
)

describe('useHandoverCustomizationChatFallbackSettingsForm', () => {
    const mockNotify = {
        success: jest.fn(),
        error: jest.fn(),
    }

    const mockInitialFormValues = {
        en: { fallbackMessage: undefined },
        fr: { fallbackMessage: undefined },
    }

    const mockUpdateMultiLanguageTexts = jest.fn()

    const mockMultiLanguageTexts = {
        en: {
            texts: {
                aiAgentHandoverFallbackMessage: 'Original error message',
            },
            sspTexts: {},
            meta: {},
        },
        fr: {
            texts: {
                aiAgentHandoverFallbackMessage: 'Original french error message',
            },
            sspTexts: {},
            meta: {},
        },
    }

    const updatedMockMultiLanguageTexts = {
        en: {
            texts: {
                aiAgentHandoverFallbackMessage: 'Updated English message',
            },
            sspTexts: {},
            meta: {},
        },
        fr: {
            texts: {
                aiAgentHandoverFallbackMessage: 'Updated french message',
            },
            sspTexts: {},
            meta: {},
        },
    }

    const mockIntegration = {
        meta: {
            app_id: 'test-app-id',
            languages: [
                { language: Language.EnglishUs },
                { language: Language.FrenchFr },
            ],
        },
    } as unknown as GorgiasChatIntegration

    beforeEach(() => {
        jest.clearAllMocks()
        useNotifyMock.mockReturnValue(mockNotify as any)
        ;(getInitialFormValues as jest.Mock).mockReturnValue(
            mockInitialFormValues,
        )
        ;(mapFromMultiLanguageTextToFormValues as jest.Mock).mockReturnValue({
            en: { fallbackMessage: 'Original error message' },
            fr: { fallbackMessage: 'Original french error message' },
        })
        ;(
            useHandoverCustomizationChatLanguageTextsConfiguration as jest.Mock
        ).mockReturnValue({
            multiLanguageTexts: mockMultiLanguageTexts,
            updateMultiLanguageTexts: mockUpdateMultiLanguageTexts,
        })
    })

    it('should initialize with correct form values', () => {
        const { result } = renderHook(() =>
            useHandoverCustomizationChatFallbackSettingsForm({
                integration: mockIntegration,
            }),
        )

        expect(result.current.formValues).toEqual({
            en: { fallbackMessage: 'Original error message' },
            fr: { fallbackMessage: 'Original french error message' },
        })
    })

    it('should update form values when context texts change', () => {
        const { result, rerender } = renderHook(
            (props) => useHandoverCustomizationChatFallbackSettingsForm(props),
            {
                initialProps: {
                    integration: mockIntegration,
                },
            },
        )

        // updating the mocks to test the rerender
        ;(mapFromMultiLanguageTextToFormValues as jest.Mock).mockReturnValue({
            en: { fallbackMessage: 'Updated English message' },
            fr: { fallbackMessage: 'Updated French message' },
        })

        //force the change
        ;(
            useHandoverCustomizationChatLanguageTextsConfiguration as jest.Mock
        ).mockReturnValue({
            multiLanguageTexts: updatedMockMultiLanguageTexts,
            updateMultiLanguageTexts: mockUpdateMultiLanguageTexts,
        })

        rerender({ integration: mockIntegration })

        expect(result.current.formValues).toEqual({
            en: { fallbackMessage: 'Updated English message' },
            fr: { fallbackMessage: 'Updated French message' },
        })

        // Verify hasChanges is false after context update
        expect(result.current.hasChanges).toBe(false)
    })

    it('should update value for specific language', () => {
        const { result } = renderHook(() =>
            useHandoverCustomizationChatFallbackSettingsForm({
                integration: mockIntegration,
            }),
        )

        act(() => {
            result.current.updateValue(
                'fallbackMessage',
                'en',
                'New error message',
            )
        })

        expect(result.current.formValues).toEqual({
            en: { fallbackMessage: 'New error message' },
            fr: { fallbackMessage: 'Original french error message' },
        })
    })

    it('should detect changes when form values differ from initial values', () => {
        const { result } = renderHook(() =>
            useHandoverCustomizationChatFallbackSettingsForm({
                integration: mockIntegration,
            }),
        )

        expect(result.current.hasChanges).toBe(false)

        act(() => {
            result.current.updateValue(
                'fallbackMessage',
                'en',
                'Modified message',
            )
        })

        expect(mockUpdateMultiLanguageTexts).not.toHaveBeenCalled()

        expect(result.current.hasChanges).toBe(true)

        expect(result.current.formValues).toEqual({
            en: { fallbackMessage: 'Modified message' },
            fr: { fallbackMessage: 'Original french error message' },
        })
    })

    it('should handle form errors when the field is bigger than the max length', async () => {
        const { result } = renderHook(() =>
            useHandoverCustomizationChatFallbackSettingsForm({
                integration: mockIntegration,
            }),
        )

        act(() => {
            result.current.updateValue(
                'fallbackMessage',
                'en',
                'Modified message with more than 30 characters',
            )
        })

        await act(async () => {
            await result.current.handleOnSave()
        })

        expect(result.current.hasError).toBe(true)

        expect(result.current.isSaving).toBe(false)

        expect(mockUpdateMultiLanguageTexts).not.toHaveBeenCalled()
    })

    it('should handle successful save operation', async () => {
        const expectedMergedMultiLanguageTexts = {
            en: {
                texts: {
                    aiAgentHandoverFallbackMessage: 'Updated English message',
                },
            },
        }

        ;(mapFromFormValuesToMultiLanguageText as jest.Mock).mockReturnValue(
            expectedMergedMultiLanguageTexts,
        )

        const { result } = renderHook(() =>
            useHandoverCustomizationChatFallbackSettingsForm({
                integration: mockIntegration,
            }),
        )

        act(() => {
            result.current.updateValue(
                'fallbackMessage',
                'en',
                'New error message',
            )
        })

        result.current.handleOnSave()

        await waitFor(() => {
            expect(result.current.isSaving).toBe(false)
            expect(mockUpdateMultiLanguageTexts).toHaveBeenCalledWith(
                expectedMergedMultiLanguageTexts,
            )

            expect(mockNotify.success).toHaveBeenCalledWith(
                CHANGES_SAVED_SUCCESS,
            )
        })
    })
    it('should handle error save operation', async () => {
        const expectedMergedMultiLanguageTexts = {
            en: {
                texts: {
                    aiAgentHandoverFallbackMessage: 'Updated English message',
                },
            },
        }

        ;(mapFromFormValuesToMultiLanguageText as jest.Mock).mockReturnValue(
            expectedMergedMultiLanguageTexts,
        )
        ;(mockUpdateMultiLanguageTexts as jest.Mock).mockRejectedValue(
            new Error('Failed to update multi-language texts'),
        )

        const { result } = renderHook(() =>
            useHandoverCustomizationChatFallbackSettingsForm({
                integration: mockIntegration,
            }),
        )

        act(() => {
            result.current.updateValue(
                'fallbackMessage',
                'en',
                'New error message',
            )
        })

        result.current.handleOnSave()

        await waitFor(() => {
            expect(result.current.isSaving).toBe(false)

            expect(mockUpdateMultiLanguageTexts).toHaveBeenCalledWith(
                expectedMergedMultiLanguageTexts,
            )
            expect(mockNotify.success).not.toHaveBeenCalled()
            expect(mockNotify.error).toHaveBeenCalledWith(
                'Failed to update multi-language texts',
            )
            expect(result.current.isSaving).toBe(false)
        })
    })
    it('should reset form values on cancel', () => {
        const { result } = renderHook(() =>
            useHandoverCustomizationChatFallbackSettingsForm({
                integration: mockIntegration,
            }),
        )

        act(() => {
            result.current.updateValue(
                'fallbackMessage',
                'en',
                'Modified message',
            )
        })

        act(() => {
            result.current.handleOnCancel()
        })

        expect(result.current.formValues).toEqual({
            en: { fallbackMessage: 'Original error message' },
            fr: { fallbackMessage: 'Original french error message' },
        })
    })
})
