import { act, renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'

import { Language } from 'constants/languages'
import useAppDispatch from 'hooks/useAppDispatch'
import { GorgiasChatLauncherType } from 'models/integration/types/gorgiasChat'

import { useLanguagesTable } from './useLanguagesTable'

jest.mock('@repo/hooks', () => ({
    useAsyncFn: (fn: (...args: any[]) => Promise<any>) => {
        const callback = jest.fn((...args: any[]) => fn(...args))
        return [{ loading: false }, callback]
    },
}))

jest.mock('hooks/useAppDispatch')
jest.mock('state/integrations/actions', () => ({
    updateOrCreateIntegration: jest.fn((form) => ({ type: 'UPDATE', form })),
}))

jest.mock('config/integrations/gorgias_chat', () => {
    const { fromJS: immutableFromJS } = jest.requireActual('immutable')
    return {
        GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS: immutableFromJS([
            { value: 'en-US', label: 'English (US)' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
        ]),
        GORGIAS_CHAT_WIDGET_TEXTS: {
            'en-US': {
                introductionText: 'How can we help?',
                offlineIntroductionText: 'Leave a message',
                chatWithUs: 'Chat with us',
            },
            fr: {
                introductionText: 'Comment pouvons-nous aider?',
                offlineIntroductionText: 'Laissez un message',
                chatWithUs: 'Discutez avec nous',
            },
        },
        mapLanguageOptionsToLanguageDropdown: jest.fn(() => [
            { value: 'de', label: 'German' },
        ]),
    }
})

const mockDispatch = jest.fn().mockResolvedValue({})
const mockUseAppDispatch = jest.mocked(useAppDispatch)

const makeIntegration = (overrides = {}) =>
    fromJS({
        id: 1,
        meta: {
            language: Language.EnglishUs,
            languages: null,
        },
        decoration: {
            introduction_text: 'Hello',
            offline_introduction_text: 'Offline',
            launcher: { type: GorgiasChatLauncherType.ICON },
        },
        ...overrides,
    })

const makeLoading = (integration = false) =>
    fromJS({ integration, updateIntegration: false })

describe('useLanguagesTable', () => {
    beforeEach(() => {
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockDispatch.mockClear()
    })

    describe('initial languages', () => {
        it('should initialize from meta.language when meta.languages is empty', () => {
            const integration = makeIntegration()
            const loading = makeLoading(false)
            const { result } = renderHook(() =>
                useLanguagesTable({ integration, loading }),
            )

            expect(result.current.languagesRows).toHaveLength(1)
            expect(result.current.languagesRows[0].label).toBe('English (US)')
            expect(result.current.languagesRows[0].primary).toBe(true)
        })

        it('should initialize from meta.languages when it exists', () => {
            const integration = makeIntegration({
                meta: {
                    language: Language.EnglishUs,
                    languages: [
                        { language: Language.EnglishUs, primary: true },
                        { language: Language.French, primary: false },
                    ],
                },
            })
            const loading = makeLoading(false)

            const { result } = renderHook(() =>
                useLanguagesTable({ integration, loading }),
            )

            expect(result.current.languagesRows).toHaveLength(2)
        })

        it('should return empty languagesRows while loading', () => {
            const integration = makeIntegration()
            const loading = makeLoading(true)
            const { result } = renderHook(() =>
                useLanguagesTable({ integration, loading }),
            )

            expect(result.current.languagesRows).toEqual([])
        })
    })

    describe('languagesRows', () => {
        it('should sort languages with primary first', () => {
            const integration = makeIntegration({
                meta: {
                    language: Language.EnglishUs,
                    languages: [
                        { language: Language.French, primary: false },
                        { language: Language.EnglishUs, primary: true },
                    ],
                },
            })
            const loading = makeLoading(false)

            const { result } = renderHook(() =>
                useLanguagesTable({ integration, loading }),
            )

            expect(result.current.languagesRows[0].label).toBe('English (US)')
            expect(result.current.languagesRows[1].label).toBe('French')
        })

        it('should sort non-primary languages alphabetically', () => {
            const integration = makeIntegration({
                meta: {
                    language: Language.EnglishUs,
                    languages: [
                        { language: Language.German, primary: false },
                        { language: Language.French, primary: false },
                        { language: Language.EnglishUs, primary: true },
                    ],
                },
            })
            const loading = makeLoading(false)

            const { result } = renderHook(() =>
                useLanguagesTable({ integration, loading }),
            )

            expect(result.current.languagesRows[0].label).toBe('English (US)')
            expect(result.current.languagesRows[1].label).toBe('French')
            expect(result.current.languagesRows[2].label).toBe('German')
        })

        it('should include the correct link for each language row', () => {
            const integration = makeIntegration()
            const loading = makeLoading(false)
            const { result } = renderHook(() =>
                useLanguagesTable({ integration, loading }),
            )

            expect(result.current.languagesRows[0].link).toBe(
                '/app/settings/channels/gorgias_chat/1/languages/en-US',
            )
        })

        it('should set showActions to false when there is only one language', () => {
            const integration = makeIntegration()
            const loading = makeLoading(false)
            const { result } = renderHook(() =>
                useLanguagesTable({ integration, loading }),
            )

            expect(result.current.languagesRows[0].showActions).toBe(false)
        })

        it('should set showActions to true when there are multiple languages', () => {
            const integration = makeIntegration({
                meta: {
                    language: Language.EnglishUs,
                    languages: [
                        { language: Language.EnglishUs, primary: true },
                        { language: Language.French, primary: false },
                    ],
                },
            })
            const loading = makeLoading(false)

            const { result } = renderHook(() =>
                useLanguagesTable({ integration, loading }),
            )

            expect(result.current.languagesRows[0].showActions).toBe(true)
            expect(result.current.languagesRows[1].showActions).toBe(true)
        })
    })

    describe('languagesAvailable', () => {
        it('should return the result of mapLanguageOptionsToLanguageDropdown', () => {
            const {
                mapLanguageOptionsToLanguageDropdown,
            } = require('config/integrations/gorgias_chat')
            const integration = makeIntegration()
            const loading = makeLoading(false)

            const { result } = renderHook(() =>
                useLanguagesTable({ integration, loading }),
            )

            expect(mapLanguageOptionsToLanguageDropdown).toHaveBeenCalledWith(
                integration,
                true,
            )
            expect(result.current.languagesAvailable).toEqual([
                { value: 'de', label: 'German' },
            ])
        })
    })

    describe('addLanguage', () => {
        it('should call dispatch with the new language appended', async () => {
            const integration = makeIntegration()
            const loading = makeLoading(false)
            const { result } = renderHook(() =>
                useLanguagesTable({ integration, loading }),
            )

            await act(async () => {
                await result.current.addLanguage({
                    language: Language.French,
                })
            })

            expect(mockDispatch).toHaveBeenCalledTimes(1)
            const dispatchedForm = mockDispatch.mock.calls[0][0].form.toJS()
            expect(dispatchedForm.meta.languages).toContainEqual(
                expect.objectContaining({ language: Language.French }),
            )
        })
    })

    describe('updateDefaultLanguage', () => {
        it('should set the new language as primary and remove primary from others', async () => {
            const integration = makeIntegration({
                meta: {
                    language: Language.EnglishUs,
                    languages: [
                        { language: Language.EnglishUs, primary: true },
                        { language: Language.French, primary: false },
                    ],
                },
            })
            const loading = makeLoading(false)

            const { result } = renderHook(() =>
                useLanguagesTable({ integration, loading }),
            )

            await act(async () => {
                await result.current.updateDefaultLanguage({
                    language: Language.French,
                })
            })

            expect(mockDispatch).toHaveBeenCalledTimes(1)
            const dispatchedForm = mockDispatch.mock.calls[0][0].form.toJS()
            const langs = dispatchedForm.meta.languages
            expect(
                langs.find(
                    (l: { language: string }) => l.language === Language.French,
                )?.primary,
            ).toBe(true)
            expect(
                langs.find(
                    (l: { language: string }) =>
                        l.language === Language.EnglishUs,
                )?.primary,
            ).toBeUndefined()
        })
    })

    describe('deleteLanguage', () => {
        it('should remove the deleted language from the list', async () => {
            const integration = makeIntegration({
                meta: {
                    language: Language.EnglishUs,
                    languages: [
                        { language: Language.EnglishUs, primary: true },
                        { language: Language.French, primary: false },
                    ],
                },
            })
            const loading = makeLoading(false)

            const { result } = renderHook(() =>
                useLanguagesTable({ integration, loading }),
            )

            await act(async () => {
                await result.current.deleteLanguage({
                    language: Language.French,
                })
            })

            expect(mockDispatch).toHaveBeenCalledTimes(1)
            const dispatchedForm = mockDispatch.mock.calls[0][0].form.toJS()
            const langs = dispatchedForm.meta.languages
            expect(langs).toHaveLength(1)
            expect(langs[0].language).toBe(Language.EnglishUs)
        })
    })

    describe('isUpdatePending', () => {
        it('should expose isUpdatePending from useAsyncFn', () => {
            const integration = makeIntegration()
            const loading = makeLoading(false)
            const { result } = renderHook(() =>
                useLanguagesTable({ integration, loading }),
            )

            expect(result.current.isUpdatePending).toBe(false)
        })
    })
})
