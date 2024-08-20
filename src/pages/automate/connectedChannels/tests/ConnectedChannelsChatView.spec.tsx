import React from 'react'
import {QueryClientProvider} from '@tanstack/react-query'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {keyBy} from 'lodash'
import thunk from 'redux-thunk'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {Router} from 'react-router-dom'
import {act} from '@testing-library/react-hooks'
import {
    mockQueryClient,
    renderWithQueryClientProvider,
} from 'tests/reactQueryTestingUtils'
import {billingState} from 'fixtures/billing'
import {RootState} from 'state/types'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {selfServiceConfiguration1 as mockSelfServiceConfiguration} from 'fixtures/self_service_configurations'
import history from 'pages/history'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import useSelfServiceChannels from 'pages/automate/common/hooks/useSelfServiceChannels'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import {ConnectedChannelsChatView} from '../components/ConnectedChannelsChatView'
import {initialState as articlesState} from '../../../../state/entities/helpCenter/articles'
import {initialState as categoriesState} from '../../../../state/entities/helpCenter/categories'

const mockChatChannels = [
    {
        type: 'chat',
        value: {
            deleted_datetime: null,
            meta: {
                shop_type: 'shopify',
                wizard: {
                    installation_method: 'manual',
                    quick_response_ids: [],
                    status: 'published',
                    step: 'installation',
                },
                shop_integration_id: 8,
                shop_name: 'itay-store-two',
                shopify_integration_ids: [],
                preferences: {
                    email_capture_enforcement: 'optional',
                    hide_on_mobile: false,
                    email_capture_enabled: true,
                    send_chat_transcript: true,
                    hide_outside_business_hours: false,
                    control_ticket_volume: false,
                    live_chat_availability: 'auto-based-on-agent-availability',
                    auto_responder: {
                        enabled: true,
                        reply: 'reply-dynamic',
                    },
                    privacy_policy_disclaimer_enabled: false,
                    display_campaigns_hidden_chat: false,
                    offline_mode_enabled_datetime: null,
                },
                language: 'en-US',
                app_id: '25',
                languages: [
                    {
                        language: 'en-US',
                        primary: true,
                    },
                ],
            },
            http: null,
            deactivated_datetime: null,
            application_id: null,
            name: '25 Shopify Chat',
            uri: '/api/integrations/15/',
            decoration: {
                avatar_type: 'team-members',
                launcher: {
                    type: 'icon',
                },
                background_color_style: 'gradient',
                conversation_color: '#115cb5',
                position: {
                    alignment: 'bottom-right',
                    offsetX: 0,
                    offsetY: 0,
                },
                introduction_text: 'How can we help?',
                offline_introduction_text: 'We will be back soon',
                avatar: {
                    image_type: 'agent-picture',
                    name_type: 'agent-first-name',
                },
                main_color: '#115cb5',
            },
            locked_datetime: null,
            created_datetime: '2024-06-17T10:45:34.203519+00:00',
            type: 'gorgias_chat',
            id: 15,
            description: null,
            updated_datetime: '2024-07-12T12:44:21.004402+00:00',
            managed: false,
        },
    },
    {
        type: 'chat',
        value: {
            deleted_datetime: null,
            meta: {
                shop_type: 'shopify',
                wizard: {
                    installation_method: 'manual',
                    quick_response_ids: [],
                    status: 'published',
                    step: 'installation',
                },
                shop_integration_id: 8,
                shop_name: 'itay-store-two',
                shopify_integration_ids: [],
                preferences: {
                    email_capture_enforcement: 'optional',
                    hide_on_mobile: false,
                    email_capture_enabled: true,
                    send_chat_transcript: true,
                    hide_outside_business_hours: false,
                    control_ticket_volume: false,
                    live_chat_availability: 'auto-based-on-agent-availability',
                    auto_responder: {
                        enabled: true,
                        reply: 'reply-dynamic',
                    },
                    privacy_policy_disclaimer_enabled: false,
                    display_campaigns_hidden_chat: false,
                    offline_mode_enabled_datetime: null,
                },
                language: 'en-US',
                app_id: '24',
                languages: [
                    {
                        language: 'en-US',
                        primary: true,
                    },
                ],
            },
            http: null,
            deactivated_datetime: null,
            application_id: null,
            name: '[E2E] 24/06/17_10:39:14 local chro 00',
            uri: '/api/integrations/14/',
            decoration: {
                avatar_type: 'team-members',
                launcher: {
                    type: 'icon',
                },
                background_color_style: 'gradient',
                conversation_color: '#115cb5',
                position: {
                    alignment: 'bottom-right',
                    offsetX: 0,
                    offsetY: 0,
                },
                introduction_text: 'How can we help?',
                offline_introduction_text: 'We will be back soon',
                avatar: {
                    image_type: 'agent-picture',
                    name_type: 'agent-first-name',
                },
                main_color: '#115cb5',
            },
            locked_datetime: null,
            created_datetime: '2024-06-17T10:39:38.427296+00:00',
            type: 'gorgias_chat',
            id: 14,
            description: null,
            updated_datetime: '2024-07-12T12:44:59.364312+00:00',
            managed: false,
        },
    },
    {
        type: 'chat',
        value: {
            deleted_datetime: null,
            meta: {
                shop_type: 'shopify',
                wizard: {
                    installation_method: 'manual',
                    quick_response_ids: [],
                    status: 'published',
                    step: 'installation',
                },
                shop_integration_id: 8,
                shop_name: 'itay-store-two',
                shopify_integration_ids: [],
                preferences: {
                    email_capture_enforcement: 'optional',
                    hide_on_mobile: false,
                    email_capture_enabled: true,
                    send_chat_transcript: true,
                    hide_outside_business_hours: false,
                    control_ticket_volume: false,
                    live_chat_availability: 'auto-based-on-agent-availability',
                    auto_responder: {
                        enabled: true,
                        reply: 'reply-dynamic',
                    },
                    privacy_policy_disclaimer_enabled: false,
                    display_campaigns_hidden_chat: false,
                    offline_mode_enabled_datetime: null,
                },
                language: 'en-US',
                app_id: '23',
                languages: [
                    {
                        language: 'en-US',
                        primary: true,
                    },
                ],
            },
            http: null,
            deactivated_datetime: null,
            application_id: null,
            name: 'test 1',
            uri: '/api/integrations/13/',
            decoration: {
                avatar_type: 'team-members',
                launcher: {
                    type: 'icon',
                },
                background_color_style: 'gradient',
                conversation_color: '#115cb5',
                position: {
                    alignment: 'bottom-right',
                    offsetX: 0,
                    offsetY: 0,
                },
                main_font_family: 'Inter',
                introduction_text: 'How can we help?',
                use_main_color_outside_business_hours: false,
                offline_introduction_text: 'We will be back soon',
                avatar: {
                    image_type: 'agent-picture',
                    name_type: 'agent-first-name',
                },
                main_color: '#115cb5',
                display_bot_label: true,
            },
            locked_datetime: null,
            created_datetime: '2024-06-17T10:33:18.860981+00:00',
            type: 'gorgias_chat',
            id: 13,
            description: null,
            updated_datetime: '2024-07-15T09:37:28.115505+00:00',
            managed: false,
        },
    },
    {
        type: 'chat',
        value: {
            deleted_datetime: null,
            meta: {
                shop_type: 'shopify',
                wizard: {
                    installation_method: '1-click',
                    quick_response_ids: [
                        '8122010c-248b-4a1c-a795-8dd80eda57a0',
                    ],
                    status: 'published',
                    step: 'installation',
                },
                shop_integration_id: 8,
                one_click_installation_datetime: '2024-06-05T11:27:41.210735',
                shop_name: 'itay-store-two',
                shopify_integration_ids: [8],
                one_click_installation_method: 'theme_app_extension',
                preferences: {
                    email_capture_enforcement: 'optional',
                    hide_on_mobile: false,
                    email_capture_enabled: true,
                    send_chat_transcript: true,
                    hide_outside_business_hours: false,
                    control_ticket_volume: false,
                    live_chat_availability: 'auto-based-on-agent-availability',
                    auto_responder: {
                        enabled: true,
                        reply: 'reply-dynamic',
                    },
                    privacy_policy_disclaimer_enabled: false,
                    display_campaigns_hidden_chat: false,
                    offline_mode_enabled_datetime: null,
                },
                language: 'en-US',
                app_id: '20',
                languages: [
                    {
                        language: 'en-US',
                        primary: true,
                    },
                ],
            },
            http: null,
            deactivated_datetime: null,
            application_id: null,
            name: "Itay's Chat",
            uri: '/api/integrations/10/',
            decoration: {
                avatar_type: 'team-members',
                launcher: {
                    type: 'icon',
                },
                background_color_style: 'gradient',
                conversation_color: '#115cb5',
                position: {
                    alignment: 'bottom-right',
                    offsetX: 0,
                    offsetY: 0,
                },
                introduction_text: 'How can we help?',
                offline_introduction_text: 'We will be back soon',
                avatar: {
                    image_type: 'agent-picture',
                    name_type: 'agent-first-name',
                },
                main_color: '#115cb5',
            },
            locked_datetime: null,
            created_datetime: '2024-06-05T11:27:05.925116+00:00',
            type: 'gorgias_chat',
            id: 10,
            description: null,
            updated_datetime: '2024-06-05T11:27:41.211069+00:00',
            managed: false,
        },
    },
]

const applicationAutomationSettingsFixture = {
    25: {
        id: 110,
        applicationId: 20,
        articleRecommendation: {
            enabled: false,
        },
        orderManagement: {
            enabled: false,
        },
        quickResponses: {
            enabled: true,
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
}

const queryClient = mockQueryClient()
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({
        shopType: 'shopify',
        shopName: 'mystore',
    })),
    useRouteMatch: jest.fn(() => ({
        path: '/app/automation/shopType/shopName/connected-channels',
        url: '/app/automation/shopType/shopName/connected-channels',
    })),
}))

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
                        order_management: {enabled: false},
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
                quickResponses: {
                    enabled: true,
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
                quickResponses: {
                    enabled: true,
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
            23: {
                id: 110,
                applicationId: 23,
                articleRecommendation: {
                    enabled: false,
                },
                orderManagement: {
                    enabled: false,
                },
                quickResponses: {
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

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')
jest.mock('pages/automate/common/hooks/useApplicationsAutomationSettings')
jest.mock('pages/automate/common/hooks/useSelfServiceChannels')
describe('ConnectedChannelsView', () => {
    beforeEach(() => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: mockSelfServiceConfiguration,
            storeIntegration: null,
            isFetchPending: false,
        })
        ;(useSelfServiceChannels as jest.Mock).mockReturnValue(mockChatChannels)
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                25: {
                    id: 110,
                    applicationId: 20,
                    articleRecommendation: {
                        enabled: false,
                    },
                    orderManagement: {
                        enabled: false,
                    },
                    quickResponses: {
                        enabled: true,
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

            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })
    })
    it('should render', () => {
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsChatView />
                    </QueryClientProvider>
                </Provider>
            </Router>
        )
    })

    it('should render the dropdown', () => {
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsChatView />
                    </QueryClientProvider>
                </Provider>
            </Router>
        )
        expect(screen.getByText('Currently viewing')).toBeInTheDocument()
    })

    it('should render chat icon in the dropdown', () => {
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsChatView />
                    </QueryClientProvider>
                </Provider>
            </Router>
        )
        expect(screen.getByText('forum')).toBeInTheDocument()
    })

    it('should show the current channel name', () => {
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsChatView />
                    </QueryClientProvider>
                </Provider>
            </Router>
        )

        expect(
            // button with aria-label="Currently viewing"
            screen.getByRole('button', {name: 'Currently viewing'})
        ).toHaveTextContent(mockChatChannels[0].value.name)
    })

    it('should render the dropdown options', () => {
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsChatView />
                    </QueryClientProvider>
                </Provider>
            </Router>
        )

        // click on the dropdown button
        screen.getByRole('button', {name: 'Currently viewing'}).click()

        // expect the dropdown to be visible
        expect(screen.getByText('Currently viewing')).toBeInTheDocument()

        // expect the dropdown to have the same number of options as the channels
        expect(screen.getAllByRole('option').length).toBe(
            mockChatChannels.length
        )
        screen.getAllByRole('option').forEach((option, index) => {
            expect(option).toHaveTextContent(mockChatChannels[index].value.name)
        })
    })

    // TEMP disabled until we release the "connect to another store" feature
    // it('should have a "connect to another store" option button', () => {
    //     render(
    //         <Router history={history}>
    //             <Provider store={mockedStore}>
    //                 <QueryClientProvider client={queryClient}>
    //                     <ConnectedChannelsChatView />
    //                 </QueryClientProvider>
    //             </Provider>
    //         </Router>
    //     )

    //     screen.debug()
    //     // click on the dropdown button
    //     screen.getByRole('button', {name: 'Currently viewing'}).click()

    //     // expect the last option to be the "connect to another store" button
    //     expect(
    //         screen.getByText('Connect another Chat to this store')
    //     ).toBeInTheDocument()
    // })

    it('should render the loading spinner', () => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: mockSelfServiceConfiguration,
            storeIntegration: null,
            isFetchPending: true,
        })
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsChatView />
                    </QueryClientProvider>
                </Provider>
            </Router>
        )

        expect(screen.getByText(/Loading/i)).toBeInTheDocument()
    })

    it('should render the loading spinner if the automation settings does not have the current channel', () => {
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {},
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsChatView />
                    </QueryClientProvider>
                </Provider>
            </Router>
        )

        expect(screen.getByText(/Loading/i)).toBeInTheDocument()
    })

    it('toggles the settings', async () => {
        const handleUpdate = jest.fn()
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings:
                applicationAutomationSettingsFixture,
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: handleUpdate,
        })

        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsChatView />
                    </QueryClientProvider>
                </Provider>
            </Router>
        )

        const toggle = screen.getByLabelText(/Enable Quick Responses/i)
        fireEvent.click(toggle)

        await waitFor(() => {
            expect(handleUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    quickResponses: {enabled: false},
                }),
                'Quick Responses disabled'
            )
        })

        await act(async () => {
            fireEvent.click(
                screen.getByLabelText(/Enable Article Recommendation/i)
            )
            await waitFor(() => {
                expect(handleUpdate).toHaveBeenCalledTimes(2)
            })

            await act(async () => {
                await waitFor(() => {
                    fireEvent.click(
                        screen.getByLabelText(/Enable Order Management/i)
                    )
                    expect(handleUpdate).toHaveBeenCalledTimes(3)
                })
            })
        })
    })

    it('calls sets the selected value whenever a new channel is selected', () => {
        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsChatView />
                </Provider>
            </Router>
        )

        const dropdown = screen.getByRole('button', {name: 'Currently viewing'})
        fireEvent.click(dropdown)
        fireEvent(
            screen.getByText(mockChatChannels[1].value.name),
            new MouseEvent('click', {bubbles: true})
        )
    })

    it('will not render the preview chat if selfServiceConfiguration is not defined', () => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: null,
            storeIntegration: null,
            isFetchPending: false,
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsChatView />
                </Provider>
            </Router>
        )

        expect(screen.queryByText(/Test/i)).not.toBeInTheDocument()
    })

    it(`will call 'handleUpdate' when switching off the quick-responses`, () => {
        const handleUpdate = jest.fn()
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings:
                applicationAutomationSettingsFixture,
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: handleUpdate,
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsChatView />
                </Provider>
            </Router>
        )

        const toggle = screen.getByLabelText(/Enable Quick Responses/i)
        fireEvent.click(toggle)

        expect(handleUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                quickResponses: {enabled: false},
            }),
            'Quick Responses disabled'
        )
    })
    it(`will call 'handleUpdate' when switching on the article recommendation`, () => {
        const handleUpdate = jest.fn()
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings:
                applicationAutomationSettingsFixture,
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: handleUpdate,
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsChatView />
                </Provider>
            </Router>
        )

        const toggle = screen.getByLabelText(/Enable Article Recommendation/i)
        fireEvent.click(toggle)

        expect(handleUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                articleRecommendation: {enabled: true},
            }),
            'Article Recommendation enabled'
        )
    })

    it(`will call 'handleUpdate' when switching on the order management`, () => {
        const handleUpdate = jest.fn()

        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings:
                applicationAutomationSettingsFixture,
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: handleUpdate,
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsChatView />
                </Provider>
            </Router>
        )

        const toggle = screen.getByLabelText(/Enable Order Management/i)
        fireEvent.click(toggle)

        expect(handleUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                orderManagement: {enabled: true},
            }),
            'Order Management enabled'
        )
    })

    it('should call `handleUpdate` when switching off the order management', () => {
        const handleUpdate = jest.fn()

        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                25: {
                    id: 110,
                    applicationId: 20,
                    articleRecommendation: {
                        enabled: false,
                    },
                    orderManagement: {
                        enabled: true,
                    },
                    quickResponses: {
                        enabled: true,
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
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: handleUpdate,
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsChatView />
                </Provider>
            </Router>
        )

        const toggle = screen.getByLabelText(/Enable Order Management/i)
        fireEvent.click(toggle)

        expect(handleUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                orderManagement: {enabled: false},
            }),
            'Order Management disabled'
        )
    })

    it('should take `shopType` and `shopName` from props when passed', () => {
        const handleUpdate = jest.fn()

        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                ...applicationAutomationSettingsFixture,
                [23]: {
                    ...applicationAutomationSettingsFixture[25],
                    id: 23,
                    quickResponses: {
                        enabled: false,
                    },
                    articleRecommendation: {
                        enabled: false,
                    },
                    orderManagement: {
                        enabled: false,
                    },
                },
            },

            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: handleUpdate,
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsChatView
                        channelId="23"
                        shopType="shopitay"
                        shopName="itayshop"
                        hideDropdown
                    />
                </Provider>
            </Router>
        )

        expect(screen.queryByText(/currently viewing/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/forum/i)).not.toBeInTheDocument()
        expect(
            screen.getByRole('switch', {name: /enable quick responses/i})
        ).not.toBeChecked()
        expect(
            screen.getByRole('switch', {name: /enable article recommendation/i})
        ).not.toBeChecked()
        expect(
            screen.getByRole('switch', {name: /enable order management/i})
        ).not.toBeChecked()
        expect(screen.getAllByText(/test 1/i)).toHaveLength(2)
    })

    it('should render the empty state when there are no channels', () => {
        ;(useSelfServiceChannels as jest.Mock).mockReturnValue([])
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: [],
            storeIntegration: null,
            isFetchPending: false,
        })
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {},
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsChatView />
                </Provider>
            </Router>
        )
        expect(screen.getByText(/Go to Chat/i)).toBeInTheDocument()
    })
})
