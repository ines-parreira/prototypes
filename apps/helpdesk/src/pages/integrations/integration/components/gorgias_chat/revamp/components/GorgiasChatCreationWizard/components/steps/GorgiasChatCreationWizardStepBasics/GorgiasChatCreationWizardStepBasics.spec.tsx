import type React from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { history } from '@repo/routing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    GorgiasChatCreationWizardInstallationMethod,
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardSteps,
    IntegrationType,
} from 'models/integration/types'
import Wizard from 'pages/common/components/wizard/Wizard'
import * as actions from 'state/integrations/actions'

import GorgiasChatCreationWizardStepBasics from './GorgiasChatCreationWizardStepBasics'

jest.mock('@repo/feature-flags')
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

jest.mock('@repo/routing', () => ({
    history: {
        replace: jest.fn(),
        push: jest.fn(),
        listen: jest.fn(() => jest.fn()),
    },
}))

jest.mock(
    'pages/common/hooks/useIsIntersectingWithBrowserViewport',
    () => () => false,
)

const mockStore = configureMockStore([thunk])

const mockStoreState = {
    currentUser: fromJS({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: { name: 'admin' },
    }),
    agents: fromJS({
        all: [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                role: { name: 'admin' },
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: { name: 'agent' },
            },
        ],
    }),
    integrations: fromJS({
        integrations: [],
    }),
}

const integration = fromJS({
    id: 1,
    name: 'Test Integration',
    meta: {
        shop_integration_id: 1,
        language: 'en-US',
        meta: { oauth: { scope: ['read_script_tags', 'write_script_tags'] } },
    },
    decoration: {},
    type: IntegrationType.Shopify,
})

const minProps: React.ComponentProps<
    typeof GorgiasChatCreationWizardStepBasics
> = {
    isUpdate: false,
    isSubmitting: false,
    integration: fromJS({}),
}

describe('<GorgiasChatCreationWizardStepBasics />', () => {
    it('renders wizard with default options selected', () => {
        const { getByLabelText } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        expect(
            getByLabelText('Ecommerce platforms', { selector: 'input' }),
        ).toBeChecked()

        expect(
            getByLabelText('Allow live chat messages', { selector: 'input' }),
        ).toBeChecked()
    })

    it('renders error for empty fields after submit attempt', () => {
        const { getByLabelText, getAllByText, getByRole } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        fireEvent.click(getByRole('button', { name: 'Continue' }))

        expect(getAllByText('This field is required.')).toHaveLength(2)

        fireEvent.click(
            getByLabelText('Ecommerce platforms', { selector: 'input' }),
        )

        expect(
            getByLabelText('Ecommerce platforms', { selector: 'input' }),
        ).toBeChecked()

        fireEvent.click(getByRole('button', { name: 'Continue' }))

        expect(getAllByText('This field is required.')).toHaveLength(2)
    })

    it('submits form with default values when creating chat', () => {
        const { getByRole, getByLabelText } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        fireEvent.change(getByLabelText('Chat title*', { selector: 'input' }), {
            target: { value: 'Test Chat Title' },
        })

        fireEvent.click(
            getByLabelText('Any other website', { selector: 'input' }),
        )

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        fireEvent.click(getByRole('button', { name: 'Continue' }))

        expect(spy).toHaveBeenCalledTimes(1)
        const [formData, , silentUpdate, , goToNextStep, successMessage] =
            spy.mock.calls[0]
        const form = (formData as Map<string, unknown>).toJS()

        expect(form.type).toBe(IntegrationType.GorgiasChat)
        expect(form.name).toBe('Test Chat Title')
        expect(form.decoration).toEqual({
            conversation_color: '#000000',
            main_color: '#000000',
            introduction_text: 'How can we help?',
            offline_introduction_text: 'We will be back soon',
            avatar_type: 'team-members',
            position: { alignment: 'bottom-right', offsetX: 0, offsetY: 0 },
            avatar: {
                image_type: 'agent-picture',
                name_type: 'agent-first-name',
            },
        })
        expect(form.meta).toEqual({
            language: 'en-US',
            languages: [{ language: 'en-US', primary: true }],
            preferences: {
                live_chat_availability: 'auto-based-on-agent-availability',
                privacy_policy_disclaimer_enabled: true,
                email_capture_enforcement: 'optional',
                auto_responder: { enabled: true, reply: 'reply-dynamic' },
                offline_mode_enabled_datetime: null,
            },
            wizard: {
                status: GorgiasChatCreationWizardStatus.Draft,
                step: GorgiasChatCreationWizardSteps.Branding,
                installation_method:
                    GorgiasChatCreationWizardInstallationMethod.Manual,
            },
            shop_name: null,
            shop_type: null,
            shop_integration_id: null,
        })
        expect(silentUpdate).toBe(true)
        expect(goToNextStep).toBe(true)
        expect(successMessage).toBe('Changes saved')
    })

    it('submits form when updating chat', () => {
        const { getByRole, getByLabelText } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics
                            {...minProps}
                            integration={integration}
                            isUpdate
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        fireEvent.change(getByLabelText('Chat title*', { selector: 'input' }), {
            target: { value: 'Test Chat Title' },
        })

        fireEvent.click(
            getByLabelText('Any other website', { selector: 'input' }),
        )

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        fireEvent.click(getByRole('button', { name: 'Continue' }))

        expect(spy).toHaveBeenCalledTimes(1)
        const [formData, , silentUpdate, , goToNextStep, successMessage] =
            spy.mock.calls[0]
        const form = (formData as Map<string, unknown>).toJS()

        expect(form.type).toBe(IntegrationType.GorgiasChat)
        expect(form.name).toBe('Test Chat Title')
        expect(form.id).toBe(1)
        expect(form.meta).toMatchObject({
            language: 'en-US',
            preferences: {
                live_chat_availability: 'auto-based-on-agent-availability',
            },
            wizard: {
                step: GorgiasChatCreationWizardSteps.Branding,
                installation_method:
                    GorgiasChatCreationWizardInstallationMethod.Manual,
            },
            shop_name: null,
            shop_type: null,
            shop_integration_id: null,
        })
        expect(form.decoration).toEqual({
            introduction_text: 'How can we help?',
            offline_introduction_text: 'We will be back soon',
        })
        expect(silentUpdate).toBe(true)
        expect(goToNextStep).toBe(true)
        expect(successMessage).toBe('Changes saved')
    })

    it('disables buttons when submitting create form', () => {
        const { getByRole } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics
                            {...minProps}
                            isSubmitting
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        expect(getByRole('button', { name: 'Cancel' })).toBeAriaDisabled()
        expect(getByRole('button', { name: /Continue/ })).toBeAriaDisabled()
    })

    it('disables buttons when submitting update form', () => {
        const { getByRole } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics
                            {...minProps}
                            integration={integration}
                            isUpdate
                            isSubmitting
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        expect(
            getByRole('button', { name: 'Save and Exit' }),
        ).toBeAriaDisabled()
        expect(getByRole('button', { name: /Continue/ })).toBeAriaDisabled()
    })

    it('should include languages when creating chat', () => {
        mockUseFlag.mockReturnValue(true)
        const { getByRole, getByLabelText } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        fireEvent.change(getByLabelText('Chat title*', { selector: 'input' }), {
            target: { value: 'Test Chat Title' },
        })

        fireEvent.click(
            getByLabelText('Any other website', { selector: 'input' }),
        )

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        fireEvent.click(getByRole('button', { name: 'Continue' }))

        expect(spy).toHaveBeenCalledTimes(1)
        const [formData] = spy.mock.calls[0]
        const form = (formData as Map<string, unknown>).toJS()

        expect(form.type).toBe(IntegrationType.GorgiasChat)
        expect(form.name).toBe('Test Chat Title')
        expect(form.meta.languages).toEqual([
            { language: 'en-US', primary: true },
        ])
    })

    it('should include languages when updating chat', () => {
        mockUseFlag.mockReturnValue(true)

        const { getByRole, getByLabelText } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics
                            {...minProps}
                            integration={integration}
                            isUpdate
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        fireEvent.change(getByLabelText('Chat title*', { selector: 'input' }), {
            target: { value: 'Test Chat Title' },
        })

        fireEvent.click(
            getByLabelText('Any other website', { selector: 'input' }),
        )

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        fireEvent.click(getByRole('button', { name: 'Continue' }))

        expect(spy).toHaveBeenCalledTimes(1)
        const [formData] = spy.mock.calls[0]
        const form = (formData as Map<string, unknown>).toJS()

        expect(form.type).toBe(IntegrationType.GorgiasChat)
        expect(form.name).toBe('Test Chat Title')
        expect(form.id).toBe(1)
        expect(form.meta.languages).toEqual([
            { language: 'en-US', primary: true },
        ])
    })

    it('should switch to offline capture mode when clicking the option', () => {
        const { getByLabelText } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        fireEvent.click(
            getByLabelText('Allow only offline capture messages', {
                selector: 'input',
            }),
        )

        expect(
            getByLabelText('Allow only offline capture messages', {
                selector: 'input',
            }),
        ).toBeChecked()
        expect(
            getByLabelText('Allow live chat messages', { selector: 'input' }),
        ).not.toBeChecked()
    })

    it('should render LanguagePicker when chatMultiLanguagesEnabled flag is true', () => {
        mockUseFlag.mockImplementation((flagKey) => {
            if (flagKey === FeatureFlagKey.ChatMultiLanguages) {
                return true
            }
            return false
        })

        const { getByText } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        expect(getByText('Default language')).toBeInTheDocument()
    })

    it('should submit with offline live chat availability', () => {
        const { getByRole, getByLabelText } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        fireEvent.change(getByLabelText('Chat title*', { selector: 'input' }), {
            target: { value: 'Test Chat' },
        })

        fireEvent.click(
            getByLabelText('Any other website', { selector: 'input' }),
        )

        fireEvent.click(
            getByLabelText('Allow only offline capture messages', {
                selector: 'input',
            }),
        )

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        fireEvent.click(getByRole('button', { name: 'Continue' }))

        expect(spy).toHaveBeenCalledTimes(1)
        const [formData] = spy.mock.calls[0]
        const form = (formData as Map<string, unknown>).toJS()

        expect(form.meta.preferences.live_chat_availability).toBe('offline')
    })

    it('should save and redirect when clicking Save and Exit in update mode', async () => {
        const integrationWithName = fromJS({
            id: 1,
            name: 'Existing Chat',
            meta: {
                shop_integration_id: null,
                language: 'en-US',
                preferences: {
                    live_chat_availability: 'auto-based-on-agent-availability',
                },
                wizard: {
                    installation_method:
                        GorgiasChatCreationWizardInstallationMethod.Manual,
                },
            },
            decoration: {},
            type: IntegrationType.GorgiasChat,
        })

        const { getByRole } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics
                            {...minProps}
                            integration={integrationWithName}
                            isUpdate
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        fireEvent.click(getByRole('button', { name: 'Save and Exit' }))

        await waitFor(() => {
            expect(spy).toHaveBeenCalledTimes(1)
        })

        const [formData, , , onSuccess] = spy.mock.calls[0]
        const form = (formData as Map<string, unknown>).toJS()

        expect(form.meta.wizard.step).toBe(
            GorgiasChatCreationWizardSteps.Basics,
        )

        if (typeof onSuccess === 'function') {
            onSuccess({ id: 1 })
        }

        await waitFor(() => {
            expect(history.push).toHaveBeenCalledWith(
                '/app/settings/channels/gorgias_chat',
            )
        })
    })

    it('should switch back from manual to ecommerce platform', () => {
        const { getByLabelText } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        fireEvent.click(
            getByLabelText('Any other website', { selector: 'input' }),
        )
        expect(
            getByLabelText('Any other website', { selector: 'input' }),
        ).toBeChecked()

        fireEvent.click(
            getByLabelText('Ecommerce platforms', { selector: 'input' }),
        )
        expect(
            getByLabelText('Ecommerce platforms', { selector: 'input' }),
        ).toBeChecked()
    })

    it('should clear store error when switching to manual installation', () => {
        const { getByLabelText, getByRole, queryAllByText } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        fireEvent.click(getByRole('button', { name: 'Continue' }))
        expect(queryAllByText('This field is required.')).toHaveLength(2)

        fireEvent.click(
            getByLabelText('Any other website', { selector: 'input' }),
        )

        fireEvent.change(getByLabelText('Chat title*', { selector: 'input' }), {
            target: { value: 'Test' },
        })

        fireEvent.click(getByRole('button', { name: 'Continue' }))
        expect(queryAllByText('This field is required.')).toHaveLength(0)
    })
})
