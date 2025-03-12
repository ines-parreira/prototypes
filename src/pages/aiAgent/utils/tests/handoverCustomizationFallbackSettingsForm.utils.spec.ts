import { AxiosError } from 'axios'

import { Language, LanguageChat } from 'constants/languages'
import { GorgiasChatIntegration } from 'models/integration/types'
import { HandoverCustomizationFallbackSettingsFormMultiLanguageValues } from 'pages/aiAgent/types'
import { TextsMultiLanguage } from 'rest_api/gorgias_chat_protected_api/types'

import {
    getInitialFormValues,
    mapFromFormValuesToMultiLanguageText,
    mapFromMultiLanguageTextToFormValues,
    parseToFriendlyErrorMessage,
} from '../handoverCustomizationFallbackSettingsForm.utils'

describe('handoverCustomizationFallbackSettingsForm utils', () => {
    describe('mapFromMultiLanguageTextToFormValues', () => {
        const mockInitialFormValues = {
            fallbackMessage: '',
        }

        it('should extract form values from multi-language texts', () => {
            const mockIntegration = {
                meta: {
                    languages: [
                        { language: Language.EnglishUs },
                        { language: Language.FrenchFr },
                    ],
                },
            } as unknown as GorgiasChatIntegration

            const mockTexts: Partial<TextsMultiLanguage> = {
                [LanguageChat.EnglishUs]: {
                    texts: {
                        aiAgentHandoverFallbackMessage: 'English error message',
                    },
                    sspTexts: {},
                    meta: {},
                },
                [LanguageChat.FrenchFr]: {
                    texts: {
                        aiAgentHandoverFallbackMessage: 'French error message',
                    },
                    sspTexts: {},
                    meta: {},
                },
            }

            const result = mapFromMultiLanguageTextToFormValues(
                mockIntegration,
                mockTexts as TextsMultiLanguage,
            )

            expect(result).toEqual({
                [LanguageChat.EnglishUs]: {
                    fallbackMessage: 'English error message',
                },
                [LanguageChat.FrenchFr]: {
                    fallbackMessage: 'French error message',
                },
            })
        })

        it('should handle missing texts for a language', () => {
            const mockIntegration = {
                meta: {
                    languages: [
                        { language: Language.EnglishUs },
                        { language: Language.FrenchFr },
                    ],
                },
            } as unknown as GorgiasChatIntegration

            const mockTexts: Partial<TextsMultiLanguage> = {
                [LanguageChat.EnglishUs]: {
                    texts: {
                        aiAgentHandoverFallbackMessage: 'English error message',
                    },
                    sspTexts: {},
                    meta: {},
                },
                [LanguageChat.FrenchFr]: {
                    texts: {
                        aiAgentWelcomeMessage:
                            'Message de bienvenue en français',
                    },
                    sspTexts: {},
                    meta: {},
                },
            }

            const result = mapFromMultiLanguageTextToFormValues(
                mockIntegration,
                mockTexts as TextsMultiLanguage,
            )

            expect(result).toEqual({
                [LanguageChat.EnglishUs]: {
                    fallbackMessage: 'English error message',
                },
                [LanguageChat.FrenchFr]: mockInitialFormValues,
            })
        })

        it('should handle empty texts object', () => {
            const mockIntegration = {
                meta: {
                    languages: [{ language: Language.EnglishUs }],
                },
            } as unknown as GorgiasChatIntegration

            const mockTexts: Partial<TextsMultiLanguage> = {
                [LanguageChat.EnglishUs]: {
                    texts: {},
                    sspTexts: {},
                    meta: {},
                },
            }

            const result = mapFromMultiLanguageTextToFormValues(
                mockIntegration,
                mockTexts as TextsMultiLanguage,
            )

            expect(result).toEqual({
                [LanguageChat.EnglishUs]: mockInitialFormValues,
            })
        })

        it('should handle null or undefined values', () => {
            const mockIntegration = {
                meta: {
                    languages: [{ language: Language.EnglishUs }],
                },
            } as unknown as GorgiasChatIntegration

            const mockTexts: Partial<TextsMultiLanguage> = {
                [LanguageChat.EnglishUs]: {
                    texts: {
                        aiAgentHandoverFallbackMessage: null,
                        aiAgentWelcomeMessage: undefined,
                    },
                    sspTexts: {},
                    meta: {},
                },
            } as unknown as TextsMultiLanguage

            const result = mapFromMultiLanguageTextToFormValues(
                mockIntegration,
                mockTexts as TextsMultiLanguage,
            )

            expect(result).toEqual({
                [LanguageChat.EnglishUs]: mockInitialFormValues,
            })
        })

        it('should fill initial form values for every language that are missing in texts', () => {
            const mockIntegration = {
                meta: {
                    languages: [
                        { language: Language.EnglishUs },
                        { language: Language.FrenchFr },
                        { language: Language.Spanish },
                        { language: Language.German },
                    ],
                },
            } as unknown as GorgiasChatIntegration

            const mockTexts: Partial<TextsMultiLanguage> = {
                [LanguageChat.EnglishUs]: {
                    texts: {
                        aiAgentHandoverFallbackMessage: null,
                        aiAgentWelcomeMessage: undefined,
                    },
                    sspTexts: {},
                    meta: {},
                },
            } as unknown as TextsMultiLanguage

            const result = mapFromMultiLanguageTextToFormValues(
                mockIntegration,
                mockTexts as TextsMultiLanguage,
            )

            expect(result).toEqual({
                [LanguageChat.EnglishUs]: mockInitialFormValues,
                [LanguageChat.FrenchFr]: mockInitialFormValues,
                [LanguageChat.Spanish]: mockInitialFormValues,
                [LanguageChat.German]: mockInitialFormValues,
            })
        })
    })

    describe('mapFromFormValuesToMultiLanguageText', () => {
        it('should merge form values into existing texts only for expected fields', () => {
            const mockFormValues = {
                [LanguageChat.EnglishUs]: {
                    fallbackMessage: 'Updated error message',
                    welcomeMessage: 'Updated welcome message',
                },
            }

            const mockTexts: TextsMultiLanguage = {
                [LanguageChat.EnglishUs]: {
                    texts: {
                        aiAgentHandoverFallbackMessage:
                            'Original error message',
                        aiAgentWelcomeMessage: 'Original welcome message',
                    },
                    sspTexts: {},
                    meta: {},
                },
            } as unknown as TextsMultiLanguage

            const result = mapFromFormValuesToMultiLanguageText(
                mockFormValues,
                mockTexts,
            )

            expect(result).toEqual({
                [LanguageChat.EnglishUs]: {
                    texts: {
                        aiAgentHandoverFallbackMessage: 'Updated error message',
                        aiAgentWelcomeMessage: 'Original welcome message',
                    },
                    sspTexts: {},
                    meta: {},
                },
            })
        })

        it('should handle multiple languages', () => {
            const mockFormValues = {
                [LanguageChat.EnglishUs]: {
                    fallbackMessage: 'English error message',
                },
                [LanguageChat.FrenchFr]: {
                    fallbackMessage: 'French error message',
                },
            }

            const mockTexts: TextsMultiLanguage = {
                [LanguageChat.EnglishUs]: {
                    texts: {
                        aiAgentHandoverFallbackMessage:
                            'Original English message',
                    },
                    sspTexts: {},
                    meta: {},
                },
                [LanguageChat.FrenchFr]: {
                    texts: {
                        aiAgentHandoverFallbackMessage: 'French error message',
                    },
                    sspTexts: {},
                    meta: {},
                },
            } as unknown as TextsMultiLanguage

            const result = mapFromFormValuesToMultiLanguageText(
                mockFormValues,
                mockTexts,
            )

            expect(result).toEqual({
                [LanguageChat.EnglishUs]: {
                    texts: {
                        aiAgentHandoverFallbackMessage: 'English error message',
                    },
                    sspTexts: {},
                    meta: {},
                },
                [LanguageChat.FrenchFr]: {
                    texts: {
                        aiAgentHandoverFallbackMessage: 'French error message',
                    },
                    sspTexts: {},
                    meta: {},
                },
            })
        })

        it('should skip undefined or null values', () => {
            const mockFormValues = {
                [LanguageChat.EnglishUs]: {
                    fallbackMessage: undefined,
                    welcomeMessage: null,
                },
            }

            const mockTexts: TextsMultiLanguage = {
                [LanguageChat.EnglishUs]: {
                    texts: {
                        aiAgentHandoverFallbackMessage:
                            'Original error message',
                        aiAgentWelcomeMessage: 'Original welcome message',
                    },
                    sspTexts: {},
                    meta: {},
                },
            } as unknown as TextsMultiLanguage

            const result = mapFromFormValuesToMultiLanguageText(
                mockFormValues,
                mockTexts,
            )

            expect(result).toEqual({
                [LanguageChat.EnglishUs]: {
                    texts: {
                        aiAgentHandoverFallbackMessage:
                            'Original error message',
                        aiAgentWelcomeMessage: 'Original welcome message',
                    },
                    sspTexts: {},
                    meta: {},
                },
            })
        })

        it('should ignore missing field references', () => {
            const mockFormValues = {
                [LanguageChat.EnglishUs]: {
                    unknownField: 'Some value',
                },
            } as unknown as HandoverCustomizationFallbackSettingsFormMultiLanguageValues

            const mockTexts: TextsMultiLanguage = {
                [LanguageChat.EnglishUs]: {
                    texts: {
                        aiAgentHandoverFallbackMessage:
                            'Original error message',
                    },
                    sspTexts: {},
                    meta: {},
                },
            } as unknown as TextsMultiLanguage

            const result = mapFromFormValuesToMultiLanguageText(
                mockFormValues,
                mockTexts,
            )

            expect(result).toEqual({
                [LanguageChat.EnglishUs]: {
                    texts: {
                        aiAgentHandoverFallbackMessage:
                            'Original error message',
                    },
                    sspTexts: {},
                    meta: {},
                },
            })
        })

        it('should preserve non-updated fields', () => {
            const mockFormValues = {
                [LanguageChat.EnglishUs]: {
                    fallbackMessage: 'Updated error message',
                },
            }

            const mockTexts: TextsMultiLanguage = {
                [LanguageChat.EnglishUs]: {
                    texts: {
                        aiAgentHandoverFallbackMessage:
                            'Original error message',
                        aiAgentWelcomeMessage: 'Original welcome message',
                        otherField: 'Should be preserved',
                    },
                    sspTexts: {},
                    meta: {},
                },
            } as unknown as TextsMultiLanguage

            const result = mapFromFormValuesToMultiLanguageText(
                mockFormValues,
                mockTexts,
            )

            expect(result).toEqual({
                [LanguageChat.EnglishUs]: {
                    texts: {
                        aiAgentHandoverFallbackMessage: 'Updated error message',
                        aiAgentWelcomeMessage: 'Original welcome message',
                        otherField: 'Should be preserved',
                    },
                    sspTexts: {},
                    meta: {},
                },
            })
        })

        it('should handle empty form values deleting the current value and key', () => {
            const mockFormValues = {
                [LanguageChat.EnglishUs]: {
                    fallbackMessage: '',
                },
            } as HandoverCustomizationFallbackSettingsFormMultiLanguageValues

            const mockTexts: TextsMultiLanguage = {
                [LanguageChat.EnglishUs]: {
                    texts: {
                        aiAgentHandoverFallbackMessage:
                            'Original error message',
                    },
                    sspTexts: {},
                    meta: {},
                },
            } as unknown as TextsMultiLanguage

            const result = mapFromFormValuesToMultiLanguageText(
                mockFormValues,
                mockTexts,
            )

            expect(result).toEqual({
                [LanguageChat.EnglishUs]: {
                    texts: {},
                    sspTexts: {},
                    meta: {},
                },
            })
        })

        it('should handle empty field references replacing the current value', () => {
            const mockFormValues = {
                [LanguageChat.EnglishUs]: {
                    fallbackMessage: 'Some value',
                },
            }

            const mockTexts: TextsMultiLanguage = {
                [LanguageChat.EnglishUs]: {
                    texts: {
                        aiAgentHandoverFallbackMessage: '',
                    },
                    sspTexts: {},
                    meta: {},
                },
            } as unknown as TextsMultiLanguage

            const result = mapFromFormValuesToMultiLanguageText(
                mockFormValues,
                mockTexts,
            )

            expect(result).toEqual({
                [LanguageChat.EnglishUs]: {
                    texts: {
                        aiAgentHandoverFallbackMessage: 'Some value',
                    },
                    sspTexts: {},
                    meta: {},
                },
            })
        })
    })

    describe('getInitialFormValues', () => {
        const mockInitialFormValues = {
            fallbackMessage: '',
        }

        it('should create form values for all languages from chat config', () => {
            const mockIntegration = {
                meta: {
                    languages: [
                        { language: Language.EnglishUs },
                        { language: Language.FrenchFr },
                        { language: Language.Spanish },
                    ],
                },
            } as unknown as GorgiasChatIntegration

            const result = getInitialFormValues(mockIntegration)

            expect(result).toEqual({
                'en-US': mockInitialFormValues,
                'fr-FR': mockInitialFormValues,
                es: mockInitialFormValues,
            })
        })

        it('should handle single language configuration', () => {
            const mockIntegration = {
                meta: {
                    languages: [{ language: Language.EnglishUs }],
                },
            } as unknown as GorgiasChatIntegration

            const result = getInitialFormValues(mockIntegration)

            expect(result).toEqual({
                'en-US': mockInitialFormValues,
            })
        })
    })

    describe('parseToFriendlyErrorMessage', () => {
        it('should return default error message when no error data is present', () => {
            const mockError = {
                response: {
                    data: {
                        error: {
                            message:
                                'Failed to save handover customization fallback settings',
                        },
                    },
                },
            } as unknown as AxiosError

            const result = parseToFriendlyErrorMessage(mockError)

            expect(result).toBe(
                'Failed to save handover customization fallback settings',
            )
        })

        it('should return default error message when error message is missing', () => {
            const mockError = {
                response: {
                    data: {
                        error: {},
                    },
                },
            } as AxiosError

            const result = parseToFriendlyErrorMessage(mockError)

            expect(result).toBe(
                'Failed to save handover customization fallback settings',
            )
        })

        it('should replace field path with friendly name in error message', () => {
            const mockError = {
                response: {
                    data: {
                        error: {
                            message:
                                'Invalid value for aiAgentHandoverFallbackMessage',
                        },
                    },
                },
            } as AxiosError

            const result = parseToFriendlyErrorMessage(mockError)

            expect(result).toBe('Invalid value for Error message')
        })

        it('should handle error message with no field references', () => {
            const mockError = {
                response: {
                    data: {
                        error: {
                            message: 'General validation error occurred',
                        },
                    },
                },
            } as AxiosError

            const result = parseToFriendlyErrorMessage(mockError)

            expect(result).toBe('General validation error occurred')
        })

        it('should handle empty error message', () => {
            const mockError = {
                response: {
                    data: {
                        error: {
                            message: '',
                        },
                    },
                },
            } as AxiosError

            const result = parseToFriendlyErrorMessage(mockError)

            expect(result).toBe(
                'Failed to save handover customization fallback settings',
            )
        })
    })
})
