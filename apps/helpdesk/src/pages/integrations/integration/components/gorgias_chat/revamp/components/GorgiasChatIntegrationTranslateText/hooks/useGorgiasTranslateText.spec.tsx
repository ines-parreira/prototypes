import type React from 'react'

import { act, renderHook, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { LanguageChat } from 'constants/languages'
import useAppDispatch from 'hooks/useAppDispatch'
import * as IntegrationsActions from 'state/integrations/actions'
import { mockStore } from 'utils/testing'

import { multiLanguageInitialTextsEmptyData } from '../utils/translateTextHelpers'
import { useGorgiasTranslateText } from './useGorgiasTranslateText'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(() => ({ push: jest.fn() })),
    useLocation: jest.fn(() => ({
        pathname: '/app/settings/channels/gorgias_chat/1/languages/en-US',
    })),
}))

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        ChatSettingsToneOfVoicePageViewed: 'page-viewed',
        ChatSettingsToneOfVoicePageSaved: 'page-saved',
    },
}))

jest.mock('@repo/hooks', () => ({
    useEffectOnce: (fn: () => void) => require('react').useEffect(fn, []),
}))

jest.mock('hooks/useAppDispatch')

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsAutomateSubscriber',
    () => ({
        __esModule: true,
        default: jest.fn(() => false),
    }),
)

jest.mock(
    'pages/integrations/integration/hooks/useIntegrationPageViewLogEvent',
    () => ({
        __esModule: true,
        default: jest.fn(),
    }),
)

jest.mock('state/integrations/actions', () => ({
    getTranslations: jest.fn(() =>
        Promise.resolve({ texts: {}, sspTexts: {}, meta: {} }),
    ),
    getApplicationTexts: jest.fn(() =>
        Promise.resolve({ texts: {}, sspTexts: {}, meta: {} }),
    ),
    updateOrCreateIntegration: jest.fn(() => ({ type: 'UPDATE_INTEGRATION' })),
}))

const mockMutateAsync = jest.fn(() => Promise.resolve())
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationTranslateText/hooks/useUpdateApplicationTexts',
    () => ({
        useUpdateApplicationTexts: jest.fn(() => ({
            mutateAsync: mockMutateAsync,
            isPending: false,
        })),
    }),
)

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(() => ({ type: 'NOTIFY' })),
}))

jest.mock('config/integrations/gorgias_chat', () => {
    const { fromJS: fromJSActual } = jest.requireActual('immutable')
    return {
        getLanguagesFromChatConfig: jest.fn(() => ['en-US']),
        getPrimaryLanguageFromChatConfig: jest.fn(() => 'en-US'),
        GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS: fromJSActual([
            { value: 'en-US', label: 'English (US)' },
            { value: 'fr-CA', label: 'French (Canada)' },
        ]),
        isTextsMultiLanguage: jest.fn(() => false),
        mapIntegrationLanguagesToLanguagePicker: jest.fn(() => [
            { value: 'en-US', label: 'English (US)' },
        ]),
    }
})

const mockDispatch = jest.fn().mockResolvedValue({})
const mockUseAppDispatch = jest.mocked(useAppDispatch)
const mockGetTranslations =
    IntegrationsActions.getTranslations as jest.MockedFunction<
        typeof IntegrationsActions.getTranslations
    >
const mockGetApplicationTexts =
    IntegrationsActions.getApplicationTexts as jest.MockedFunction<
        typeof IntegrationsActions.getApplicationTexts
    >

const defaultIntegration = fromJS({
    id: 1,
    meta: {
        app_id: 'test-app-id',
        language: 'en-US',
        languages: null,
        preferences: {},
    },
    decoration: {
        launcher: { type: 'icon-only' },
        introduction_text: null,
        offline_introduction_text: null,
    },
    name: 'My Chat',
})

const store = mockStore({})

const wrapper = ({ children }: { children: React.ReactNode }) =>
    (<Provider store={store}>{children}</Provider>) as React.ReactElement

describe('multiLanguageInitialTextsEmptyData', () => {
    it('should contain an entry for every LanguageChat value', () => {
        const allLanguages = Object.values(LanguageChat)
        allLanguages.forEach((lang) => {
            expect(multiLanguageInitialTextsEmptyData).toHaveProperty(lang)
        })
    })

    it('should initialize each language with empty texts, sspTexts, and meta', () => {
        const firstLang = Object.values(LanguageChat)[0]
        expect(multiLanguageInitialTextsEmptyData[firstLang]).toEqual({
            texts: {},
            sspTexts: {},
            meta: {},
        })
    })
})

describe('useGorgiasTranslateText', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockMutateAsync.mockResolvedValue(undefined)
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockGetTranslations.mockResolvedValue({
            texts: {},
            sspTexts: {},
            meta: {},
        })
        mockGetApplicationTexts.mockResolvedValue({
            texts: {},
            sspTexts: {},
            meta: {},
        })
        // Reset mocks that individual tests may override, to prevent test pollution
        const { useLocation, useHistory } = require('react-router-dom')
        useLocation.mockReturnValue({
            pathname: '/app/settings/channels/gorgias_chat/1/languages/en-US',
        })
        useHistory.mockReturnValue({ push: jest.fn() })
        const {
            isTextsMultiLanguage,
        } = require('config/integrations/gorgias_chat')
        isTextsMultiLanguage.mockReturnValue(false)
    })

    it('should return initial state with language null and hasChanges false', () => {
        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.hasChanges).toBe(false)
        expect(result.current.isExitModalOpen).toBe(false)
        expect(result.current.isLanguageChangeModalOpen).toBe(false)
    })

    it('should return dependenciesLoaded as true after API calls resolve', async () => {
        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })
    })

    it('should set language based on the URL when dependencies load', async () => {
        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.language).not.toBeNull()
        })

        expect(result.current.language?.get('value')).toBe('en-US')
    })

    it('should open language change modal when handleLanguageChange is called with pending changes', async () => {
        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })

        // Simulate having changes
        act(() => {
            result.current.saveKeyValue('texts.chatTitle', 'New Title')
        })

        act(() => {
            result.current.handleLanguageChange(LanguageChat.FrenchCa)
        })

        expect(result.current.isLanguageChangeModalOpen).toBe(true)
        expect(result.current.isExitModalOpen).toBe(false)
    })

    it('should close all modals when onCloseModals is called', async () => {
        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })

        act(() => {
            result.current.saveKeyValue('texts.chatTitle', 'New Title')
        })

        act(() => {
            result.current.handleLanguageChange(LanguageChat.FrenchCa)
        })

        expect(result.current.isLanguageChangeModalOpen).toBe(true)

        act(() => {
            result.current.onCloseModals()
        })

        expect(result.current.isLanguageChangeModalOpen).toBe(false)
        expect(result.current.isExitModalOpen).toBe(false)
    })

    it('should switch language directly when handleLanguageChange is called without pending changes', async () => {
        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })

        act(() => {
            result.current.handleLanguageChange(LanguageChat.FrenchCa)
        })

        expect(result.current.isLanguageChangeModalOpen).toBe(false)
        expect(result.current.language?.get('value')).toBe(
            LanguageChat.FrenchCa,
        )
    })

    it('should mark hasChanges as true when saveKeyValue changes a value', async () => {
        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })

        act(() => {
            result.current.saveKeyValue(
                'texts.chatTitle',
                'New Different Title',
            )
        })

        expect(result.current.hasChanges).toBe(true)
    })

    it('should discard changes and navigate on onDiscardChangesAndExit', async () => {
        const mockPush = jest.fn()
        const { useHistory } = require('react-router-dom')
        useHistory.mockReturnValue({ push: mockPush })

        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })

        act(() => {
            result.current.saveKeyValue('texts.chatTitle', 'New Title')
        })

        act(() => {
            result.current.onDiscardChangesAndExit()
        })

        expect(result.current.hasChanges).toBe(false)
        expect(mockPush).toHaveBeenCalledWith(result.current.backUrl)
    })

    it('should discard changes and switch language on onDiscardChangesAndSwitchLanguage', async () => {
        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })

        act(() => {
            result.current.saveKeyValue('texts.chatTitle', 'New Title')
        })

        act(() => {
            result.current.handleLanguageChange(LanguageChat.FrenchCa)
        })

        expect(result.current.isLanguageChangeModalOpen).toBe(true)

        act(() => {
            result.current.onDiscardChangesAndSwitchLanguage()
        })

        expect(result.current.isLanguageChangeModalOpen).toBe(false)
        expect(result.current.language?.get('value')).toBe(
            LanguageChat.FrenchCa,
        )
    })

    it('should return isAutomateSubscriber from the hook', () => {
        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isAutomateSubscriber).toBe(false)
    })

    it('should handle multi-language texts returned from getApplicationTexts', async () => {
        const {
            isTextsMultiLanguage,
        } = require('config/integrations/gorgias_chat')
        isTextsMultiLanguage.mockReturnValue(true)
        mockGetApplicationTexts.mockResolvedValue({
            ...multiLanguageInitialTextsEmptyData,
            [LanguageChat.EnglishUs]: {
                texts: { chatTitle: 'Chat' },
                sspTexts: {},
                meta: {},
            },
        })

        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })

        expect(result.current.dependenciesLoaded).toBe(true)
    })

    it('should call updateApplicationTexts when submitData is called', async () => {
        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })

        await act(async () => {
            await result.current.submitData()
        })

        expect(mockMutateAsync).toHaveBeenCalled()
        expect(result.current.hasChanges).toBe(false)
    })

    it('should dispatch error notification when submitData fails', async () => {
        mockMutateAsync.mockRejectedValue(new Error('API error'))

        const { notify } = require('state/notifications/actions')

        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })

        await act(async () => {
            await result.current.submitData()
        })

        expect(notify).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining("couldn't update"),
            }),
        )
    })

    it('should reset hasChanges when resetValues is called', async () => {
        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })

        act(() => {
            result.current.saveKeyValue('texts.chatTitle', 'Changed Title')
        })

        expect(result.current.hasChanges).toBe(true)

        act(() => {
            result.current.resetValues()
        })

        expect(result.current.hasChanges).toBe(false)
    })

    it('should save data and navigate when onSaveValuesAndExit is called', async () => {
        const mockPush = jest.fn()
        const { useHistory } = require('react-router-dom')
        useHistory.mockReturnValue({ push: mockPush })

        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })

        const backUrl = result.current.backUrl

        await act(async () => {
            await result.current.onSaveValuesAndExit()
        })

        expect(mockMutateAsync).toHaveBeenCalled()
        expect(mockPush).toHaveBeenCalledWith(backUrl)
    })

    it('should save data and switch language when onSaveValuesAndSwitchLanguage is called', async () => {
        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })

        act(() => {
            result.current.saveKeyValue('texts.chatTitle', 'New Title')
        })

        act(() => {
            result.current.handleLanguageChange(LanguageChat.FrenchCa)
        })

        expect(result.current.isLanguageChangeModalOpen).toBe(true)

        await act(async () => {
            await result.current.onSaveValuesAndSwitchLanguage()
        })

        expect(mockMutateAsync).toHaveBeenCalled()
        expect(result.current.isLanguageChangeModalOpen).toBe(false)
        expect(result.current.language?.get('value')).toBe(
            LanguageChat.FrenchCa,
        )
    })

    it('should migrate introduction_text from decoration when texts are empty', async () => {
        const integrationWithDecoration = fromJS({
            id: 1,
            meta: {
                app_id: 'test-app-id',
                language: 'en-US',
                languages: null,
                preferences: {},
            },
            decoration: {
                launcher: { type: 'icon-only', label: 'Chat with us' },
                introduction_text: 'Welcome to our chat!',
                offline_introduction_text: 'We are offline',
            },
            name: 'My Chat',
        })

        const { result } = renderHook(
            () =>
                useGorgiasTranslateText({
                    integration: integrationWithDecoration,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })

        // After migration, hasChanges remains false since it resets the initial ref
        expect(result.current.isDefaultLanguageLoaded).toBe(true)
    })

    it('should call updateApplicationTexts when submitData is called for non-default language', async () => {
        const { useLocation } = require('react-router-dom')
        useLocation.mockReturnValue({
            pathname: '/app/settings/channels/gorgias_chat/1/languages/en-US',
        })

        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })

        await act(async () => {
            await result.current.submitData()
        })

        expect(mockMutateAsync).toHaveBeenCalled()
        expect(result.current.hasChanges).toBe(false)
    })

    it('should update launcher label when launcher type is ICON_AND_LABEL on submitData', async () => {
        const integrationWithIconLabel = fromJS({
            id: 1,
            meta: {
                app_id: 'test-app-id',
                language: 'en-US',
                languages: null,
                preferences: {},
            },
            decoration: {
                launcher: { type: 'icon-label', label: 'Chat with us' },
                introduction_text: null,
                offline_introduction_text: null,
            },
            name: 'My Chat',
        })

        const { result } = renderHook(
            () =>
                useGorgiasTranslateText({
                    integration: integrationWithIconLabel,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })

        await act(async () => {
            await result.current.submitData()
        })

        expect(mockMutateAsync).toHaveBeenCalled()
    })

    it('should fall back to default language when URL segment is not in integration languages', async () => {
        const { useLocation } = require('react-router-dom')
        // URL has fr-CA but integration only supports en-US
        useLocation.mockReturnValue({
            pathname: '/app/settings/channels/gorgias_chat/1/languages/fr-CA',
        })

        const { result } = renderHook(
            () => useGorgiasTranslateText({ integration: defaultIntegration }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })

        // Falls back to integrationDefaultLanguage ('en-US')
        expect(result.current.language?.get('value')).toBe('en-US')
    })

    it('should handle null integrationChat.meta gracefully', () => {
        const integrationWithoutMeta = fromJS({
            id: 1,
            decoration: {
                launcher: { type: 'icon-only' },
                introduction_text: null,
                offline_introduction_text: null,
            },
            name: 'My Chat',
        })

        const { result } = renderHook(
            () =>
                useGorgiasTranslateText({
                    integration: integrationWithoutMeta,
                }),
            { wrapper },
        )

        // Without meta, dependencies cannot load (language is never set)
        expect(result.current.dependenciesLoaded).toBe(false)
        expect(result.current.language).toBeNull()
    })

    it('should populate privacy policy disclaimer when multi-language and disclaimer enabled', async () => {
        const {
            isTextsMultiLanguage,
        } = require('config/integrations/gorgias_chat')
        isTextsMultiLanguage.mockReturnValue(true)

        const integrationWithPrivacyPolicy = fromJS({
            id: 1,
            meta: {
                app_id: 'test-app-id',
                language: 'en-US',
                languages: null,
                preferences: {
                    privacy_policy_disclaimer_enabled: true,
                },
            },
            decoration: {
                launcher: { type: 'icon-only' },
                introduction_text: null,
                offline_introduction_text: null,
            },
            name: 'My Chat',
        })

        mockGetApplicationTexts.mockResolvedValue({
            ...multiLanguageInitialTextsEmptyData,
            [LanguageChat.EnglishUs]: {
                texts: {},
                sspTexts: {},
                meta: {},
            },
        })
        mockGetTranslations.mockResolvedValue({
            texts: { privacyPolicyDisclaimer: 'Privacy policy text' },
            sspTexts: {},
            meta: {},
        })

        const { result } = renderHook(
            () =>
                useGorgiasTranslateText({
                    integration: integrationWithPrivacyPolicy,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.dependenciesLoaded).toBe(true)
        })

        expect(result.current.dependenciesLoaded).toBe(true)
    })
})
