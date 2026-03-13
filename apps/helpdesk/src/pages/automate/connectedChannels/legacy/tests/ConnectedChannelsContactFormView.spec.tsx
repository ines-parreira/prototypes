import React from 'react'

import { history } from '@repo/routing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { keyBy } from 'lodash'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import { billingState } from 'fixtures/billing'
import { selfServiceConfiguration1 as mockSelfServiceConfiguration } from 'fixtures/self_service_configurations'
import useContactFormAutomationSettings from 'pages/automate/common/hooks/useContactFormAutomationSettings'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import useSelfServiceStandaloneContactFormChannels from 'pages/automate/common/hooks/useSelfServiceStandaloneContactFormChannels'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'
import type { RootState } from 'state/types'
import {
    mockQueryClient,
    renderWithQueryClientProvider,
} from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import { initialState as articlesState } from '../../../../../state/entities/helpCenter/articles'
import { initialState as categoriesState } from '../../../../../state/entities/helpCenter/categories'
import { ConnectedChannelsContactFormView } from '../components/ConnectedChannelsContactFormView'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')
jest.mock('pages/automate/common/hooks/useContactFormAutomationSettings')
jest.mock(
    'pages/automate/common/hooks/useSelfServiceStandaloneContactFormChannels',
)
jest.mock('settings/automate/hooks/useIsAutomateSettings')

const mockContactFormChannels = [
    {
        type: 'contact_form',
        value: {
            created_datetime: '2023-08-08T12:00:36.313Z',
            updated_datetime: '2023-11-02T00:09:46.302Z',
            deleted_datetime: null,
            account_id: 1,
            code_snippet_template:
                '<script defer src="http://contact.gorgias.docker:4000/api/contact-forms/loader.js?v=3" data-gorgias-loader-contact-form data-gorgias-contact-form-uid="abcde123"></script>',
            default_locale: 'fr-FR',
            email_integration: {
                id: 5,
                email: 'zp7d01g9zorymjke@email-itay.gorgi.us',
            },
            help_center_id: null,
            id: 4,
            name: 'ACME Contact Form',
            source: 'manual',
            subject_lines: {
                options: [
                    'Order status',
                    'Feedback',
                    'Report an issue',
                    'Product questions',
                    'Request refund or discount',
                ],
                allow_other: true,
            },
            uid: 'abcde123',
            url_template: 'http://contact.gorgias.docker:4000/forms/abcde123',
            shop_name: 'itay-store-two',
            deactivated_datetime: null,
            automation_settings_id: 4,
            integration_id: null,
            form_display_mode: 'show_immediately',
        },
    },
    {
        type: 'contact_form',
        value: {
            created_datetime: '2023-11-01T23:16:04.103Z',
            updated_datetime: '2023-11-02T00:09:46.303Z',
            deleted_datetime: null,
            account_id: 1,
            code_snippet_template:
                '<script defer src="http://contact.gorgias.docker:4000/api/contact-forms/loader.js?v=3" data-gorgias-loader-contact-form data-gorgias-contact-form-uid="oz5i794j"></script>',
            default_locale: 'en-US',
            email_integration: {
                id: 5,
                email: 'zp7d01g9zorymjke@email-itay.gorgi.us',
            },
            help_center_id: null,
            id: 49,
            name: 'contact-1',
            source: 'manual',
            subject_lines: {
                options: [
                    'Order status',
                    'Feedback',
                    'Report an issue',
                    'Request refund or discount',
                    'Product question',
                ],
                allow_other: true,
            },
            uid: 'oz5i794j',
            url_template: 'http://contact.gorgias.docker:4000/forms/oz5i794j',
            shop_name: 'itay-store-two',
            deactivated_datetime: null,
            automation_settings_id: 5,
            integration_id: null,
            form_display_mode: 'show_immediately',
        },
    },
    {
        type: 'contact_form',
        value: {
            created_datetime: '2023-06-14T09:18:34.325Z',
            updated_datetime: '2023-11-02T00:09:17.072Z',
            deleted_datetime: null,
            account_id: 1,
            code_snippet_template:
                '<script defer src="http://contact.gorgias.docker:4000/api/contact-forms/loader.js?v=3" data-gorgias-loader-contact-form data-gorgias-contact-form-uid="zz5op755"></script>',
            default_locale: 'fr-FR',
            email_integration: {},
            help_center_id: null,
            id: 51,
            name: 'Contact Form Mojo FR',
            source: 'manual',
            subject_lines: {},
            uid: 'zz5op755',
            url_template: 'http://contact.gorgias.docker:4000/forms/zz5op755',
            shop_name: 'itay-store-two',
            deactivated_datetime: null,
            automation_settings_id: 3,
            integration_id: null,
            form_display_mode: 'show_immediately',
        },
    },
]

const mockStore = configureMockStore([thunk])

const defaultState = {
    integrations: fromJS({
        integrations: [],
    }),

    billing: fromJS(billingState),
} as RootState
const contactForm = ContactFormFixture
const mockedStore = mockStore({
    ...defaultState,
    entities: {
        contactForm: {
            contactFormsAutomationSettings: {
                automationSettingsByContactFormId: {
                    [contactForm.id]: {
                        workflows: [],
                        order_management: { enabled: false },
                    },
                },
            },
            contactForms: {
                contactFormById: keyBy([contactForm], 'id'),
            },
        },
        chatsApplicationAutomationSettings: {
            25: {
                id: 110,
                applicationId: 20,
                articleRecommendation: {
                    enabled: false,
                },
                orderManagement: {
                    enabled: false,
                },
                workflows: {
                    enabled: true,
                    entrypoints: [
                        {
                            enabled: true,
                            workflow_id: '01HZHAN2Z7WBMAPK266DTW0ZWC',
                        },
                        {
                            enabled: true,
                            workflow_id: '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                        },
                        {
                            enabled: true,
                            workflow_id: '01HNDKMSSAV6MPV125PXB3MMSG',
                        },
                        {
                            enabled: true,
                            workflow_id: '01HQQYPGNH1CNBART86FG8PCN6',
                        },
                        {
                            enabled: true,
                            workflow_id: '01HQT87MV168MHHENMC1VC55S7',
                        },
                    ],
                },
                createdDatetime: '2024-06-05T11:27:06.939Z',
                updatedDatetime: '2024-07-30T14:16:39.411Z',
            },
            24: {
                id: 110,
                applicationId: 24,
                articleRecommendation: {
                    enabled: false,
                },
                orderManagement: {
                    enabled: false,
                },
                workflows: {
                    enabled: true,
                    entrypoints: [
                        {
                            enabled: true,
                            workflow_id: '01HZHAN2Z7WBMAPK266DTW0ZWC',
                        },
                        {
                            enabled: true,
                            workflow_id: '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                        },
                        {
                            enabled: true,
                            workflow_id: '01HNDKMSSAV6MPV125PXB3MMSG',
                        },
                        {
                            enabled: true,
                            workflow_id: '01HQQYPGNH1CNBART86FG8PCN6',
                        },
                        {
                            enabled: true,
                            workflow_id: '01HQT87MV168MHHENMC1VC55S7',
                        },
                    ],
                },
                createdDatetime: '2024-06-05T11:27:06.939Z',
                updatedDatetime: '2024-07-30T14:16:39.411Z',
            },
        },
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': getSingleHelpCenterResponseFixture,
                },
            },
            helpCentersAutomationSettings: {},
            articles: articlesState,
            categories: categoriesState,
        },
    },
})

const queryClient = mockQueryClient()

describe('ConnectedChannelsContactFormView', () => {
    beforeEach(() => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: mockSelfServiceConfiguration,
            storeIntegration: null,
            isFetchPending: false,
        })
        ;(
            useSelfServiceStandaloneContactFormChannels as jest.Mock
        ).mockReturnValue(mockContactFormChannels)
        ;(useContactFormAutomationSettings as jest.Mock).mockReturnValue({
            automationSettings: {
                workflows: [
                    {
                        id: '01HQTDDBN1A75R9TH8PCQS4ARA',
                        enabled: true,
                    },
                    {
                        id: '01HNWV4Y52TZD1T42HQP4JGPY5',
                        enabled: true,
                    },
                ],
                order_management: {
                    enabled: false,
                },
            },

            isFetchPending: false,
            handleContactFormAutomationSettingsUpdate: jest.fn(),
        })
    })

    it('should render', () => {
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsContactFormView />
                    </QueryClientProvider>
                </Provider>
            </Router>,
        )
    })

    it('should render the dropdown', () => {
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsContactFormView />
                    </QueryClientProvider>
                </Provider>
            </Router>,
        )
        expect(screen.getByText('Currently viewing')).toBeInTheDocument()
    })

    it('should render contact form icon in the dropdown', () => {
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsContactFormView />
                    </QueryClientProvider>
                </Provider>
            </Router>,
        )
        expect(screen.getByText('edit_note')).toBeInTheDocument()
    })

    it('should show the current channel name', () => {
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsContactFormView />
                    </QueryClientProvider>
                </Provider>
            </Router>,
        )

        expect(
            // button with aria-label="Currently viewing"
            screen.getByRole('button', { name: 'Currently viewing' }),
        ).toHaveTextContent(mockContactFormChannels[0].value.name)
    })

    it('should render the dropdown options', async () => {
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsContactFormView />
                    </QueryClientProvider>
                </Provider>
            </Router>,
        )

        // click on the dropdown button
        await userEvent.click(
            screen.getByRole('button', { name: 'Currently viewing' }),
        )

        // expect the dropdown to be visible
        expect(screen.getByText('Currently viewing')).toBeInTheDocument()

        // expect the dropdown to have the same number of options as the channels
        expect(screen.getAllByRole('option')).toHaveLength(
            mockContactFormChannels.length,
        )
        screen.getAllByRole('option').forEach((option, index) => {
            // if is last, return because it is the button

            expect(option).toHaveTextContent(
                mockContactFormChannels[index].value.name,
            )
        })
    })

    it(`will call 'handleUpdate' when switching off the order management`, () => {
        const handleUpdate = jest.fn()

        ;(useContactFormAutomationSettings as jest.Mock).mockReturnValue({
            automationSettings: {
                workflows: [
                    {
                        id: '01HQTDDBN1A75R9TH8PCQS4ARA',
                        enabled: true,
                    },
                    {
                        id: '01HNWV4Y52TZD1T42HQP4JGPY5',
                        enabled: true,
                    },
                ],
                order_management: {
                    enabled: false,
                },
            },
            isFetchPending: false,
            handleContactFormAutomationSettingsUpdate: handleUpdate,
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsContactFormView />
                </Provider>
            </Router>,
        )

        const toggle = screen.getByLabelText(/Enable Order Management/i)
        fireEvent.click(toggle)

        expect(handleUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                order_management: { enabled: true },
                workflows: [
                    { enabled: true, id: '01HQTDDBN1A75R9TH8PCQS4ARA' },
                    { enabled: true, id: '01HNWV4Y52TZD1T42HQP4JGPY5' },
                ],
            }),
            'Order Management enabled',
        )
    })

    it(`will call 'handleUpdate' when switching on the order management`, () => {
        const handleUpdate = jest.fn()

        ;(useContactFormAutomationSettings as jest.Mock).mockReturnValue({
            automationSettings: {
                workflows: [
                    {
                        id: '01HQTDDBN1A75R9TH8PCQS4ARA',
                        enabled: true,
                    },
                    {
                        id: '01HNWV4Y52TZD1T42HQP4JGPY5',
                        enabled: true,
                    },
                ],
                order_management: {
                    enabled: true,
                },
            },
            isFetchPending: false,
            handleContactFormAutomationSettingsUpdate: handleUpdate,
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsContactFormView />
                </Provider>
            </Router>,
        )

        const toggle = screen.getByLabelText(/Enable Order Management/i)
        fireEvent.click(toggle)

        expect(handleUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                order_management: { enabled: false },
                workflows: [
                    { enabled: true, id: '01HQTDDBN1A75R9TH8PCQS4ARA' },
                    { enabled: true, id: '01HNWV4Y52TZD1T42HQP4JGPY5' },
                ],
            }),
            'Order Management disabled',
        )
    })

    it('should use the shopName and shopType from the contact form', () => {
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsContactFormView
                            contactForm={
                                {
                                    shop_name: 'itay-store-three',
                                    id: 1,
                                } as any
                            }
                        />
                    </QueryClientProvider>
                </Provider>
            </Router>,
        )

        expect(screen.queryAllByRole('option').length).toBe(0)
    })

    it('should render an empty state when there are no channels', () => {
        ;(
            useSelfServiceStandaloneContactFormChannels as jest.Mock
        ).mockReturnValue([])

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsContactFormView />
                </Provider>
            </Router>,
        )

        expect(screen.getByText(/Go to Contact Form/i)).toBeInTheDocument()
    })

    it('should show loading spinner when data is being fetched', () => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: null,
            storeIntegration: null,
            isFetchPending: true,
        })
        ;(useContactFormAutomationSettings as jest.Mock).mockReturnValue({
            automationSettings: {
                order_management: {
                    enabled: true,
                },
            },
            isFetchPending: true,
            handleContactFormAutomationSettingsUpdate: jest.fn(),
        })

        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsContactFormView />
                    </QueryClientProvider>
                </Provider>
            </Router>,
        )

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should handle channel selection change and navigation', async () => {
        const mockChannels = [
            ...mockContactFormChannels,
            {
                type: TicketChannel.HelpCenter,
                value: {
                    id: 100,
                    name: 'Help Center Channel',
                },
            },
            {
                type: TicketChannel.Chat,
                value: {
                    id: 101,
                    name: 'Chat Channel',
                    meta: {
                        app_id: 'chat-app-1',
                    },
                },
            },
        ]

        // Mock useIsAutomateSettings to return true
        ;(useIsAutomateSettings as jest.Mock).mockReturnValue(true)
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: mockSelfServiceConfiguration,
            storeIntegration: null,
            isFetchPending: false,
        })
        ;(
            useSelfServiceStandaloneContactFormChannels as jest.Mock
        ).mockReturnValue(mockChannels)
        ;(useContactFormAutomationSettings as jest.Mock).mockReturnValue({
            automationSettings: {
                workflows: [
                    {
                        id: '01HQTDDBN1A75R9TH8PCQS4ARA',
                        enabled: true,
                    },
                ],
                order_management: {
                    enabled: false,
                },
            },
            isFetchPending: false,
            handleContactFormAutomationSettingsUpdate: jest.fn(),
        })

        renderWithRouter(
            <Provider store={mockedStore}>
                <QueryClientProvider client={queryClient}>
                    <ConnectedChannelsContactFormView />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/channels/contact-form',
                route: '/shopify/itay-store-two/channels/contact-form',
            },
        )

        // Wait for dropdown to be visible
        await waitFor(() => {
            expect(screen.getByText('Currently viewing')).toBeInTheDocument()
        })

        // Open dropdown
        const dropdown = screen.getByRole('button', {
            name: 'Currently viewing',
        })
        await act(async () => {
            fireEvent.click(dropdown)
        })

        await waitFor(() => {
            expect(screen.getByText('Help Center Channel')).toBeInTheDocument()
        })
        await act(async () => {
            fireEvent.click(screen.getByText('Help Center Channel'))
        })
    })
})
