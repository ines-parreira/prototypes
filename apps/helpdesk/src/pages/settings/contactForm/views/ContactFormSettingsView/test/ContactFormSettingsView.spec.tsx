import React from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
// oxlint-disable-next-line no-named-as-default
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useFlag } from 'core/flags'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useContactFormAutomationSettings from 'pages/automate/common/hooks/useContactFormAutomationSettings'
import {
    CONTACT_FORM_BASE_PATH,
    CONTACT_FORM_CUSTOMIZATION_PATH,
    CONTACT_FORM_PREFERENCES_PATH,
    CONTACT_FORM_PUBLISH_PATH,
    CONTACT_FORM_SETTINGS_PATH,
} from 'pages/settings/contactForm/constants'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import { insertContactFormIdParam } from 'pages/settings/contactForm/utils/navigation'
import ContactFormSettingsView from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormSettingsView'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'
import { DndProvider } from 'utils/wrappers/DndProvider'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
jest.mock('pages/automate/common/hooks/useContactFormAutomationSettings')
jest.mock('hooks/aiAgent/useAiAgentAccess')
jest.mock('core/flags')

const queryClient = mockQueryClient()

const mockUseAiAgentAccess = assumeMock(useAiAgentAccess)
const mockUseFlag = assumeMock(useFlag)

describe('<ContactFormSettingsView />', () => {
    const FORM_ID = '1'
    const defaultState: Partial<RootState> = {
        integrations: fromJS(integrationsState),
        billing: fromJS(billingState),
        currentAccount: fromJS(account),
        entities: {
            contactForm: {
                contactForms: {
                    contactFormById: {
                        [FORM_ID]: ContactFormFixture,
                    },
                },
            },
        } as any,
        ui: {
            contactForm: {
                currentId: Number(FORM_ID),
            },
        } as any,
    }

    const renderView = ({
        path,
        state = defaultState,
        history,
    }: {
        path: string
        history?: any
        state?: Partial<RootState>
    }) => {
        return renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <DndProvider backend={HTML5Backend}>
                    <Provider store={mockStore(state)}>
                        <ContactFormSettingsView />
                    </Provider>
                </DndProvider>
            </QueryClientProvider>,
            {
                path,
                history,
            },
        )
    }

    beforeEach(() => {
        jest.resetAllMocks()
        jest.mocked(useSupportedLocales).mockReturnValue(
            getLocalesResponseFixture,
        )
        jest.mocked(useContactFormAutomationSettings).mockReturnValue({
            automationSettings: {
                order_management: {
                    enabled: true,
                },
                workflows: [],
            },
            isFetchPending: false,
            isUpdatePending: false,
            handleContactFormAutomationSettingsFetch: jest.fn(),
            handleContactFormAutomationSettingsUpdate: jest.fn(),
        })
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        mockUseFlag.mockReturnValue(false)
    })

    it('should redirect to CUSTOMIZATION page if just form id provided', () => {
        const history = createMemoryHistory({
            initialEntries: [
                insertContactFormIdParam(CONTACT_FORM_SETTINGS_PATH, FORM_ID),
            ],
        })

        renderView({
            path: CONTACT_FORM_SETTINGS_PATH,
            history,
        })

        expect(history.location.pathname).toEqual(
            insertContactFormIdParam(CONTACT_FORM_CUSTOMIZATION_PATH, FORM_ID),
        )
    })

    it.each([
        CONTACT_FORM_SETTINGS_PATH,
        CONTACT_FORM_PREFERENCES_PATH,
        CONTACT_FORM_CUSTOMIZATION_PATH,
        CONTACT_FORM_PUBLISH_PATH,
    ])(
        'should redirect to ABOUT page if contact form id is invalid for %p',
        (path) => {
            const INVALID_ID = 'invalid-number'
            const history = createMemoryHistory({
                initialEntries: [insertContactFormIdParam(path, INVALID_ID)],
            })

            renderView({
                path: CONTACT_FORM_SETTINGS_PATH,
                history,
            })

            expect(history.location.pathname).toEqual(CONTACT_FORM_BASE_PATH)
        },
    )

    it.each([
        CONTACT_FORM_CUSTOMIZATION_PATH,
        CONTACT_FORM_PREFERENCES_PATH,
        CONTACT_FORM_PUBLISH_PATH,
    ])(
        'should redirect to ABOUT page if the header `Contact Form` link was clicked',
        async (path) => {
            const history = createMemoryHistory({
                initialEntries: [insertContactFormIdParam(path, FORM_ID)],
            })

            renderView({
                path: CONTACT_FORM_SETTINGS_PATH,
                history,
            })

            const headerLink = await screen.findByLabelText('base-path')
            expect(headerLink.getAttribute('href')).toEqual(
                CONTACT_FORM_BASE_PATH,
            )
        },
    )

    it.each([
        CONTACT_FORM_CUSTOMIZATION_PATH,
        CONTACT_FORM_PREFERENCES_PATH,
        CONTACT_FORM_PUBLISH_PATH,
    ])('should display preview button', async (path) => {
        const history = createMemoryHistory({
            initialEntries: [insertContactFormIdParam(path, FORM_ID)],
        })

        renderView({
            history,
            path: CONTACT_FORM_SETTINGS_PATH,
        })

        await screen.findByLabelText('contact form preview')
    })

    it('should display "Automation Features" tab', () => {
        const history = createMemoryHistory({
            initialEntries: [
                insertContactFormIdParam(CONTACT_FORM_SETTINGS_PATH, FORM_ID),
            ],
        })

        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        renderView({
            path: CONTACT_FORM_SETTINGS_PATH,
            history,
        })

        expect(
            screen.getByRole('link', { name: /Automation Features/i }),
        ).toBeInTheDocument()
    })

    it('should hide the "Automation Features" tab', () => {
        const history = createMemoryHistory({
            initialEntries: [
                insertContactFormIdParam(CONTACT_FORM_SETTINGS_PATH, FORM_ID),
            ],
        })

        renderView({
            path: CONTACT_FORM_SETTINGS_PATH,
            history,
        })

        expect(
            screen.queryByRole('link', { name: /Automation Features/i }),
        ).not.toBeInTheDocument()
    })

    describe('Secondary navbar buttons', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

        it('should display upgrade button in navbar when hasAccess is false', async () => {
            const history = createMemoryHistory({
                initialEntries: [
                    insertContactFormIdParam(
                        CONTACT_FORM_CUSTOMIZATION_PATH,
                        FORM_ID,
                    ),
                ],
            })

            renderView({
                path: CONTACT_FORM_SETTINGS_PATH,
                history,
            })

            await screen.findByText('Upgrade to AI Agent')
        })

        it('should open subscription modal when clicking upgrade button in navbar', async () => {
            const user = userEvent.setup()
            const history = createMemoryHistory({
                initialEntries: [
                    insertContactFormIdParam(
                        CONTACT_FORM_CUSTOMIZATION_PATH,
                        FORM_ID,
                    ),
                ],
            })

            renderView({
                path: CONTACT_FORM_SETTINGS_PATH,
                history,
            })

            const upgradeButton = await screen.findByText('Upgrade to AI Agent')
            await user.click(upgradeButton)

            expect(
                screen.getByRole('heading', { name: /subscribe/i }),
            ).toBeInTheDocument()
        })

        it('should display connect store button in navbar when hasAccess is true', async () => {
            const history = createMemoryHistory({
                initialEntries: [
                    insertContactFormIdParam(
                        CONTACT_FORM_CUSTOMIZATION_PATH,
                        FORM_ID,
                    ),
                ],
            })

            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

            renderView({
                path: CONTACT_FORM_SETTINGS_PATH,
                history,
            })

            await screen.findByText('Connect Store')
        })

        it('should navigate to preferences when clicking connect store in navbar', async () => {
            const user = userEvent.setup()
            const history = createMemoryHistory({
                initialEntries: [
                    insertContactFormIdParam(
                        CONTACT_FORM_CUSTOMIZATION_PATH,
                        FORM_ID,
                    ),
                ],
            })

            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

            renderView({
                path: CONTACT_FORM_SETTINGS_PATH,
                history,
            })

            const connectButton = await screen.findByText('Connect Store')
            await user.click(connectButton)

            expect(history.location.pathname).toEqual(
                `/app/settings/contact-form/${FORM_ID}/preferences`,
            )
        })

        it('should not display connect store button when shop is integrated', async () => {
            const history = createMemoryHistory({
                initialEntries: [
                    insertContactFormIdParam(
                        CONTACT_FORM_CUSTOMIZATION_PATH,
                        FORM_ID,
                    ),
                ],
            })

            const stateWithShopIntegration = {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactForms: {
                            contactFormById: {
                                [FORM_ID]: {
                                    ...ContactFormFixture,
                                    shop_integration: {
                                        shop_name: 'test-shop.myshopify.com',
                                        shop_type: 'shopify',
                                        integration_id: 1,
                                        account_id: 1,
                                    },
                                },
                            },
                        },
                    },
                } as any,
            }

            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

            renderView({
                path: CONTACT_FORM_SETTINGS_PATH,
                history,
                state: stateWithShopIntegration,
            })

            await screen.findByLabelText('contact form preview')

            expect(
                screen.queryByRole('button', { name: /connect store/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('Visual indicators', () => {
        it('should display red dot on Automation Features tab when shop is not integrated', async () => {
            const history = createMemoryHistory({
                initialEntries: [
                    insertContactFormIdParam(
                        CONTACT_FORM_CUSTOMIZATION_PATH,
                        FORM_ID,
                    ),
                ],
            })

            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

            renderView({
                path: CONTACT_FORM_SETTINGS_PATH,
                history,
            })

            const automationLink = await screen.findByRole('link', {
                name: /Automation Features/i,
            })

            const redDotImage = automationLink.querySelector(
                'img[alt="status icon"]',
            )
            expect(redDotImage).toBeInTheDocument()
        })

        it('should not display red dot on Automation Features tab when shop is integrated', async () => {
            const history = createMemoryHistory({
                initialEntries: [
                    insertContactFormIdParam(
                        CONTACT_FORM_CUSTOMIZATION_PATH,
                        FORM_ID,
                    ),
                ],
            })

            const stateWithShopIntegration = {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactForms: {
                            contactFormById: {
                                [FORM_ID]: {
                                    ...ContactFormFixture,
                                    shop_integration: {
                                        shop_name: 'test-shop.myshopify.com',
                                        shop_type: 'shopify',
                                        integration_id: 1,
                                        account_id: 1,
                                    },
                                },
                            },
                        },
                    },
                } as any,
            }

            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

            renderView({
                path: CONTACT_FORM_SETTINGS_PATH,
                history,
                state: stateWithShopIntegration,
            })

            const automationLink = await screen.findByRole('link', {
                name: /Automation Features/i,
            })

            const redDotImage = automationLink.querySelector(
                'img[alt="status icon"]',
            )
            expect(redDotImage).not.toBeInTheDocument()
        })
    })
})
