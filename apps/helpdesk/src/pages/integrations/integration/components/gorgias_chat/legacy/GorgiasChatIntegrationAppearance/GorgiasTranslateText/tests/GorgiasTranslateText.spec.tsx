import React from 'react'

import { assumeMock, render } from '@repo/testing'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, useHistory, useLocation } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { LANGUAGE } from 'constants/languages'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { entitiesInitialState } from 'fixtures/entities'
import { integrationsState } from 'fixtures/integrations'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import * as IntegrationsActions from 'state/integrations/actions'
import type { RootState, StoreDispatch } from 'state/types'

import GorgiasTranslateText from '../GorgiasTranslateText'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
    useHistory: jest.fn(),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/hooks/useInstallationStatus',
    () => ({
        useInstallationStatus: () => ({
            installed: true,
            installedOnShopifyCheckout: false,
            embeddedSpqInstalled: false,
            minimumSnippetVersion: null,
        }),
    }),
)

jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess')

jest.mock('state/integrations/actions', () => ({
    ...jest.requireActual('state/integrations/actions'),
    getTranslations: jest.fn(),
    getApplicationTexts: jest.fn(),
    updateApplicationTexts: jest.fn(),
    updateOrCreateIntegration: jest.fn(() => ({ type: 'UPDATE_INTEGRATION' })),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationHeader',
    () => ({
        __esModule: true,
        default: () => <div data-testid="integration-header" />,
    }),
)

jest.mock('pages/common/components/PageHeader', () => ({
    __esModule: true,
    default: ({ title }: { title: React.ReactNode }) => <div>{title}</div>,
}))

jest.mock(
    '../GorgiasTranslateExitModal',
    () =>
        ({
            isOpen,
            onConfirm,
            onDiscard,
            onClose,
        }: {
            isOpen: boolean
            onConfirm: () => void
            onDiscard: () => void
            onClose: () => void
        }) =>
            isOpen ? (
                <div role="dialog" aria-label="exit-modal">
                    <button type="button" onClick={onConfirm}>
                        modal-save
                    </button>
                    <button type="button" onClick={onDiscard}>
                        modal-discard
                    </button>
                    <button type="button" onClick={onClose}>
                        modal-close
                    </button>
                </div>
            ) : null,
)

jest.mock(
    '../GorgiasTranslateInputGroup',
    () =>
        ({
            title,
            keys,
            requiredKeys,
            saveValue,
            trackInputMethod,
        }: {
            title: string
            keys: string[]
            requiredKeys?: string[]
            saveValue: (key: string, value: string) => void
            trackInputMethod?: (key: string) => void
        }) => (
            <section aria-label={`section-${title}`}>
                <h2>{title}</h2>
                <ul>
                    {keys.map((key) => (
                        <li key={key}>
                            {key}
                            {requiredKeys?.includes(key) ? ' *' : ''}
                            <button
                                type="button"
                                onClick={() => saveValue(key, `value-${key}`)}
                            >
                                {`save-${key}`}
                            </button>
                            <button
                                type="button"
                                onClick={() => trackInputMethod?.(key)}
                            >
                                {`track-${key}`}
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
        ),
)

jest.mock('pages/common/forms/SelectField/SelectField', () => ({
    __esModule: true,
    default: ({
        value,
        onChange,
        options,
    }: {
        value: string
        onChange: (value: string) => void
        options: { value: string }[]
    }) => (
        <div aria-label="language-select">
            <span>{`current:${value}`}</span>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                >
                    {`switch-to-${option.value}`}
                </button>
            ))}
        </div>
    ),
}))

const useLocationMock = useLocation as jest.Mock
const useHistoryMock = useHistory as jest.Mock
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)
const mockUseStoreIntegrations = jest.mocked(useStoreIntegrations)

const mockGetTranslations = jest.mocked(IntegrationsActions.getTranslations)
const mockGetApplicationTexts = jest.mocked(
    IntegrationsActions.getApplicationTexts,
)
const mockUpdateApplicationTexts = jest.mocked(
    IntegrationsActions.updateApplicationTexts,
)
const mockUpdateOrCreateIntegration = jest.mocked(
    IntegrationsActions.updateOrCreateIntegration,
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const baseIntegration = fromJS({
    id: 118,
    type: 'gorgias_chat',
    name: 'My new chat',
    decoration: {
        introduction_text: 'Welcome',
        offline_introduction_text: 'We are offline',
        launcher: {
            type: 'icon-only',
            label: 'Chat with us',
        },
    },
    meta: {
        app_id: 'app-123',
        language: LANGUAGE.EN_US,
        languages: [
            { language: LANGUAGE.EN_US, primary: true },
            { language: LANGUAGE.IT },
        ],
        preferences: {},
    },
})

const defaultTranslations = {
    texts: {
        chatTitle: 'Chat with us',
        chatWithUs: 'Chat with us',
        introductionText: 'Hello',
        offlineIntroductionText: 'Offline',
        privacyPolicyDisclaimer: 'Default disclaimer',
    },
    sspTexts: {},
    meta: {},
}

const emptyTextsResponse = {
    texts: {},
    sspTexts: {},
    meta: {},
}

const renderComponent = (integration = baseIntegration) => {
    const store = mockStore({
        entities: entitiesInitialState,
        billing: fromJS(billingState),
        currentAccount: fromJS(account),
        integrations: fromJS(integrationsState),
    })
    const result = render(
        <MemoryRouter>
            <Provider store={store}>
                <GorgiasTranslateText integration={integration} />
            </Provider>
        </MemoryRouter>,
    )
    return { ...result, store }
}

describe('GorgiasTranslateText', () => {
    let historyPushMock: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        historyPushMock = jest.fn()
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        mockUseStoreIntegrations.mockReturnValue([])
        useHistoryMock.mockReturnValue({ push: historyPushMock })
        useLocationMock.mockReturnValue({
            pathname: '/app/settings/channels/gorgias_chat/118/languages/en-US',
        })
        mockGetTranslations.mockResolvedValue(defaultTranslations as never)
        mockGetApplicationTexts.mockResolvedValue(emptyTextsResponse as never)
        mockUpdateApplicationTexts.mockResolvedValue(undefined as never)
        mockUpdateOrCreateIntegration.mockReturnValue((() =>
            Promise.resolve({})) as never)
    })

    it('renders the breadcrumb and header', async () => {
        renderComponent()
        expect(screen.getByText('Chat')).toBeInTheDocument()
        expect(screen.getByTestId('integration-header')).toBeInTheDocument()
        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /save changes/i }),
            ).toBeInTheDocument()
        })
    })

    it('shows the advanced customization warning by default and hides it when closed', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('link', {
                    name: /advanced customization/i,
                }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByLabelText(/close icon/i))

        expect(
            screen.queryByRole('link', { name: /advanced customization/i }),
        ).not.toBeInTheDocument()
    })

    it('renders loading spinner while dependencies are not loaded', () => {
        mockGetTranslations.mockReturnValue(new Promise(() => {}) as never)
        mockGetApplicationTexts.mockReturnValue(new Promise(() => {}) as never)

        renderComponent()

        expect(
            screen.queryByRole('button', { name: /save changes/i }),
        ).not.toBeInTheDocument()
    })

    it('renders legacy mono-language sections when URL ends with /texts', async () => {
        useLocationMock.mockReturnValue({
            pathname: '/app/settings/channels/gorgias_chat/118/texts',
        })
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('region', { name: 'section-General' }),
            ).toBeInTheDocument()
        })

        expect(
            screen.queryByRole('region', { name: 'section-Intro message' }),
        ).not.toBeInTheDocument()
    })

    it('renders multi-language sections including Intro message', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('region', { name: 'section-Intro message' }),
            ).toBeInTheDocument()
        })
        expect(
            screen.getByRole('region', { name: 'section-General' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('region', {
                name: 'section-Offline Capture - Confirmation email',
            }),
        ).toBeInTheDocument()
    })

    it('marks the chatTitle key as required for the default language', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('region', { name: 'section-General' }),
            ).toBeInTheDocument()
        })

        const general = screen.getByRole('region', { name: 'section-General' })
        expect(
            within(general).getByText(/texts\.chatTitle \*/),
        ).toBeInTheDocument()
        expect(
            within(general).queryByText(/texts\.chatWithUs \*/),
        ).not.toBeInTheDocument()
    })

    it('marks both chatTitle and chatWithUs as required when launcher type is icon-label', async () => {
        const integration = baseIntegration.setIn(
            ['decoration', 'launcher', 'type'],
            'icon-label',
        )
        renderComponent(integration)

        await waitFor(() => {
            expect(
                screen.getByRole('region', { name: 'section-General' }),
            ).toBeInTheDocument()
        })

        const general = screen.getByRole('region', { name: 'section-General' })
        expect(
            within(general).getByText(/texts\.chatTitle \*/),
        ).toBeInTheDocument()
        expect(
            within(general).getByText(/texts\.chatWithUs \*/),
        ).toBeInTheDocument()
    })

    it('navigates directly to the back URL when there are no unsaved changes', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /save changes/i }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('link', { name: /back/i }))

        expect(historyPushMock).toHaveBeenCalledWith(
            '/app/settings/channels/gorgias_chat/118/languages',
        )
    })

    it('falls back to the default integration language when URL segment is unknown', async () => {
        useLocationMock.mockReturnValue({
            pathname: '/app/settings/channels/gorgias_chat/118/languages/xx',
        })
        renderComponent()

        await waitFor(() => {
            expect(mockGetTranslations).toHaveBeenCalledWith(LANGUAGE.EN_US)
        })
    })

    it('submits updated texts and shows a success toast', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /save changes/i }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /save changes/i }))

        await waitFor(() => {
            expect(mockUpdateApplicationTexts).toHaveBeenCalled()
        })

        const [appId] = mockUpdateApplicationTexts.mock.calls[0]
        expect(appId).toBe('app-123')

        await waitFor(() => {
            expect(
                screen.getByText('Your changes are now live'),
            ).toBeInTheDocument()
        })
    })

    it('shows an error toast when save fails', async () => {
        const user = userEvent.setup()
        mockUpdateApplicationTexts.mockRejectedValue(new Error('boom') as never)
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /save changes/i }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /save changes/i }))

        await waitFor(() => {
            expect(
                screen.getByText(/couldn't update your changes/i),
            ).toBeInTheDocument()
        })
    })

    it('resets values and shows a toast when Discard Changes is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /discard changes/i }),
            ).toBeInTheDocument()
        })

        await user.click(
            screen.getByRole('button', { name: /discard changes/i }),
        )

        await waitFor(() => {
            expect(screen.getByText('Discarded changes')).toBeInTheDocument()
        })
    })

    it('renders the privacy policy section when the feature flag is enabled', async () => {
        jest.isolateModules(() => {})
        const featureFlags = require('@repo/feature-flags')
        const useFlagSpy = jest
            .spyOn(featureFlags, 'useFlag')
            .mockImplementation(
                (flagKey: unknown) =>
                    flagKey ===
                    featureFlags.FeatureFlagKey.ChatPrivacyPolicyDisclaimer,
            )

        try {
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByRole('region', {
                        name: 'section-Privacy policy disclaimer',
                    }),
                ).toBeInTheDocument()
            })
        } finally {
            useFlagSpy.mockRestore()
        }
    })

    it('migrates decoration values into texts when default language is selected', async () => {
        // When dependencies load with empty texts and a default language is loaded,
        // migration fills fields from decoration. After migration and submit, the
        // decoration values should be sent to the API.
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /save changes/i }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /save changes/i }))

        await waitFor(() => {
            expect(mockUpdateApplicationTexts).toHaveBeenCalled()
        })

        const [, payload] = mockUpdateApplicationTexts.mock.calls[0] as any
        const enUs = payload['en-US']
        expect(enUs.texts.introductionText).toBe('Welcome')
        expect(enUs.texts.offlineIntroductionText).toBe('We are offline')
        expect(enUs.texts.chatTitle).toBe('My new chat')
    })

    it('uses legacy back URL when in legacy mono-language mode', async () => {
        useLocationMock.mockReturnValue({
            pathname: '/app/settings/channels/gorgias_chat/118/texts',
        })
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /save changes/i }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('link', { name: /back/i }))

        expect(historyPushMock).toHaveBeenCalledWith(
            '/app/settings/channels/gorgias_chat/118/appearance',
        )
    })

    it('handles a nully integrationChat.meta gracefully without rendering the form', () => {
        const integrationWithoutMeta = fromJS({
            id: 118,
            type: 'gorgias_chat',
            name: 'My new chat',
            decoration: {
                launcher: { type: 'icon-only' },
            },
        })

        renderComponent(integrationWithoutMeta)

        expect(
            screen.queryByRole('button', { name: /save changes/i }),
        ).not.toBeInTheDocument()
    })

    it('loads application texts that are already in multi-language format', async () => {
        mockGetApplicationTexts.mockResolvedValue({
            'en-US': {
                texts: { chatTitle: 'Existing title' },
                sspTexts: {},
                meta: {},
            },
            it: { texts: {}, sspTexts: {}, meta: {} },
        } as never)

        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /save changes/i }),
            ).toBeInTheDocument()
        })
    })

    it('tracks an input click', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'track-texts.chatTitle' }),
            ).toBeInTheDocument()
        })

        await user.click(
            screen.getByRole('button', { name: 'track-texts.chatTitle' }),
        )
    })

    it('opens the exit modal when clicking back with unsaved changes', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'save-texts.chatTitle' }),
            ).toBeInTheDocument()
        })

        await user.click(
            screen.getByRole('button', { name: 'save-texts.chatTitle' }),
        )
        await user.click(screen.getByRole('link', { name: /back/i }))

        expect(
            screen.getByRole('dialog', { name: 'exit-modal' }),
        ).toBeInTheDocument()
        expect(historyPushMock).not.toHaveBeenCalled()
    })

    it('discards changes and navigates when clicking Discard Changes in the exit modal', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'save-texts.chatTitle' }),
            ).toBeInTheDocument()
        })

        await user.click(
            screen.getByRole('button', { name: 'save-texts.chatTitle' }),
        )
        await user.click(screen.getByRole('link', { name: /back/i }))

        const dialog = screen.getByRole('dialog', { name: 'exit-modal' })
        await user.click(within(dialog).getByText('modal-discard'))

        expect(historyPushMock).toHaveBeenCalledWith(
            '/app/settings/channels/gorgias_chat/118/languages',
        )
    })

    it('saves changes and navigates when clicking Save Changes in the exit modal', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'save-texts.chatTitle' }),
            ).toBeInTheDocument()
        })

        await user.click(
            screen.getByRole('button', { name: 'save-texts.chatTitle' }),
        )
        await user.click(screen.getByRole('link', { name: /back/i }))

        const dialog = screen.getByRole('dialog', { name: 'exit-modal' })
        await user.click(within(dialog).getByText('modal-save'))

        await waitFor(() => {
            expect(historyPushMock).toHaveBeenCalledWith(
                '/app/settings/channels/gorgias_chat/118/languages',
            )
        })
    })

    it('submits in legacy mono-language mode using the legacy payload shape', async () => {
        useLocationMock.mockReturnValue({
            pathname: '/app/settings/channels/gorgias_chat/118/texts',
        })
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /save changes/i }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /save changes/i }))

        await waitFor(() => {
            expect(mockUpdateApplicationTexts).toHaveBeenCalled()
        })

        const [appId, payload] = mockUpdateApplicationTexts.mock.calls[0] as any
        expect(appId).toBe('app-123')
        // Legacy mode sends a flat texts/sspTexts/meta object, not keyed by language
        expect(payload).toMatchObject({
            texts: expect.any(Object),
            sspTexts: expect.any(Object),
            meta: expect.any(Object),
        })
    })

    it('updates launcher label when launcher type is icon-and-label on save', async () => {
        const integration = baseIntegration.setIn(
            ['decoration', 'launcher', 'type'],
            'icon-label',
        )
        const user = userEvent.setup()
        renderComponent(integration)

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /save changes/i }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /save changes/i }))

        await waitFor(() => {
            expect(mockUpdateOrCreateIntegration).toHaveBeenCalled()
        })

        const [updatedIntegration] = mockUpdateOrCreateIntegration.mock
            .calls[0] as any
        const updated = updatedIntegration.toJS()
        expect(updated.decoration.launcher.type).toBe('icon-label')
        expect(updated.decoration.launcher.label).toBeDefined()
    })

    it('switches language directly when there are no unsaved changes', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'switch-to-it' }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: 'switch-to-it' }))

        await waitFor(() => {
            expect(screen.getByText('current:it')).toBeInTheDocument()
        })
        expect(
            screen.queryByRole('dialog', { name: 'exit-modal' }),
        ).not.toBeInTheDocument()
    })

    it('opens the language change modal when switching language with unsaved changes', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'save-texts.chatTitle' }),
            ).toBeInTheDocument()
        })

        await user.click(
            screen.getByRole('button', { name: 'save-texts.chatTitle' }),
        )
        await user.click(screen.getByRole('button', { name: 'switch-to-it' }))

        expect(
            screen.getByRole('dialog', { name: 'exit-modal' }),
        ).toBeInTheDocument()
        expect(screen.getByText('current:en-US')).toBeInTheDocument()
    })

    it('discards changes and switches language from the confirmation modal', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'save-texts.chatTitle' }),
            ).toBeInTheDocument()
        })

        await user.click(
            screen.getByRole('button', { name: 'save-texts.chatTitle' }),
        )
        await user.click(screen.getByRole('button', { name: 'switch-to-it' }))

        const dialog = screen.getByRole('dialog', { name: 'exit-modal' })
        await user.click(within(dialog).getByText('modal-discard'))

        await waitFor(() => {
            expect(screen.getByText('current:it')).toBeInTheDocument()
        })
        expect(
            screen.queryByRole('dialog', { name: 'exit-modal' }),
        ).not.toBeInTheDocument()
    })

    it('saves changes and switches language from the confirmation modal', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'save-texts.chatTitle' }),
            ).toBeInTheDocument()
        })

        await user.click(
            screen.getByRole('button', { name: 'save-texts.chatTitle' }),
        )
        await user.click(screen.getByRole('button', { name: 'switch-to-it' }))

        const dialog = screen.getByRole('dialog', { name: 'exit-modal' })
        await user.click(within(dialog).getByText('modal-save'))

        await waitFor(() => {
            expect(mockUpdateApplicationTexts).toHaveBeenCalled()
        })
        await waitFor(() => {
            expect(screen.getByText('current:it')).toBeInTheDocument()
        })
    })
})
