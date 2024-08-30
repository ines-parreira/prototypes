/* eslint-disable @typescript-eslint/no-unsafe-return */
import React from 'react'
import {screen, fireEvent, waitFor} from '@testing-library/react'
import {Router} from 'react-router-dom'
import {createMemoryHistory} from 'history'
import {keyBy} from 'lodash'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {act} from 'react-dom/test-utils'
import {selfServiceConfiguration1 as mockSelfServiceConfiguration} from 'fixtures/self_service_configurations'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceChannels from 'pages/automate/common/hooks/useSelfServiceChannels'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import useHelpCentersAutomationSettings from 'pages/automate/common/hooks/useHelpCentersAutomationSettings'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {RootState} from 'state/types'
import {billingState} from 'fixtures/billing'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {ConnectedChannelsView} from '../ConnectedChannelsView'
import {initialState as articlesState} from '../../../../state/entities/helpCenter/articles'
import {initialState as categoriesState} from '../../../../state/entities/helpCenter/categories'

const mockChannels = [
    {
        type: 'chat',
        value: {
            deleted_datetime: null,
            meta: {
                shop_type: 'shopify',
                wizard: {
                    installation_method: 'manual',
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
            name: '[E2E] 24/06/17_10:45:16 local chro 00',
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
]

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({
        shopType: 'shopType',
        shopName: 'shopName',
    })),
    useRouteMatch: jest.fn(() => ({
        path: '/app/automation/shopType/shopName/connected-channels',
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

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')
jest.mock('pages/automate/common/hooks/useApplicationsAutomationSettings')
jest.mock('pages/automate/common/hooks/useSelfServiceChannels')
jest.mock('pages/automate/common/hooks/useHelpCentersAutomationSettings')
jest.mock(
    'pages/automate/connectedChannels/components/ConnectedChannelsEmptyView',
    () => ({
        ConnectedChannelsEmptyView: jest.fn(() => (
            <div>ConnectedChannelsEmptyView</div>
        )),
    })
)

jest.mock(
    'pages/automate/common/hooks/useSelfServiceHelpCenterChannels',
    () => ({
        __esModule: true,
        default: () => [
            {
                value: {
                    id: 1,
                },
            },
        ],
    })
)

jest.mock(
    'pages/automate/common/hooks/useSelfServiceStandaloneContactFormChannels',
    () => ({
        __esModule: true,
        default: () => [
            {
                value: {
                    id: 1,
                },
            },
        ],
    })
)

const renderWithRouter = (ui: React.ReactElement, {route = '/'} = {}) => {
    const history = createMemoryHistory({initialEntries: [route]})
    return {
        ...renderWithQueryClientProvider(
            <Provider store={mockedStore}>
                <Router history={history}>{ui}</Router>
            </Provider>
        ),
        history,
    }
}

describe('ConnectedChannelsView', () => {
    beforeEach(() => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: mockSelfServiceConfiguration,
            storeIntegration: null,
            isFetchPending: false,
        })
        ;(useSelfServiceChannels as jest.Mock).mockReturnValue(mockChannels)
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
        ;(useHelpCentersAutomationSettings as jest.Mock).mockReturnValue({
            helpCentersAutomationSettings: {
                20: {
                    workflows: [
                        {
                            id: '01HQT87MV168MHHENMC1VC55S7',
                            enabled: true,
                        },
                        {
                            id: '01HYFEJ87DV88DZ2EGZ7KKJ4T8',
                            enabled: true,
                        },
                        {
                            id: '01HQTDDBN1A75R9TH8PCQS4ARA',
                            enabled: true,
                        },
                        {
                            id: '01HQQYMHSD75H3HGKR87DAEPG9',
                            enabled: true,
                        },
                    ],
                    order_management: {
                        enabled: true,
                    },
                },
            },
            isFetchPending: false,
        })
    })
    it('should render', () => {
        renderWithRouter(<ConnectedChannelsView />)
        expect(screen.getByText('Chat')).toBeInTheDocument()
        expect(screen.getByText('Help Center')).toBeInTheDocument()
        expect(screen.getByText('Contact Form')).toBeInTheDocument()
        expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('should change the route to chat when clicking on a channel', async () => {
        const {history} = renderWithRouter(<ConnectedChannelsView />)

        const chatChannel = screen.getByRole('link', {name: /chat/i})
        expect(chatChannel).toBeInTheDocument()
        // Check if the component corresponding to the route is rendered

        await act(async () => {
            fireEvent.click(chatChannel)
            await waitFor(() => {
                expect(history.location.pathname).toBe(
                    '/app/automation/shopType/shopName/connected-channels'
                )

                expect(
                    screen.getAllByText(
                        'Display up to 6 Flows on your Chat to proactively resolve top customer requests.'
                    )
                ).toHaveLength(1)
                expect(screen.getByText(/forum/i)).toBeInTheDocument()
            })
        })
        expect(screen.getByText(/forum/i)).toBeInTheDocument()
    })

    it('should change the route to help center when clicking on a channel', async () => {
        const {history} = renderWithRouter(<ConnectedChannelsView />)

        const helpCenterChannel = screen.getByRole('link', {
            name: /help center/i,
        })

        expect(helpCenterChannel).toBeInTheDocument()
        await act(async () => {
            fireEvent.click(helpCenterChannel)

            await waitFor(() => {
                expect(history.location.pathname).toBe(
                    '/app/automation/shopType/shopName/connected-channels/help-center'
                )

                expect(
                    screen.getByText(
                        'Display up to 6 Flows on your Help Center to proactively resolve top customer requests.'
                    )
                ).toBeInTheDocument()
                expect(screen.getByText(/live_help/i)).toBeInTheDocument()
            })
        })
    })

    it('should change the route to contact form when clicking on a channel', async () => {
        const {history} = renderWithRouter(<ConnectedChannelsView />)

        const contactFormChannel = screen.getByRole('link', {
            name: /contact form/i,
        })

        expect(contactFormChannel).toBeInTheDocument()
        await act(async () => {
            fireEvent.click(contactFormChannel)

            await waitFor(() => {
                expect(history.location.pathname).toBe(
                    '/app/automation/shopType/shopName/connected-channels/contact-form'
                )

                expect(
                    screen.getByText(/Enable Order Management/i)
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        'Display up to 6 Flows on your Contact Form to proactively resolve top customer requests.'
                    )
                ).toBeInTheDocument()
                expect(
                    screen.getByText(/Currently viewing/i)
                ).toBeInTheDocument()
            })
        })
    })
    it('should change the route to email when clicking on a channel', async () => {
        const {history} = renderWithRouter(<ConnectedChannelsView />)

        const contactFormChannel = screen.getByRole('link', {
            name: /email/i,
        })

        expect(contactFormChannel).toBeInTheDocument()
        await act(async () => {
            fireEvent.click(contactFormChannel)

            await waitFor(() => {
                expect(history.location.pathname).toBe(
                    '/app/automation/shopType/shopName/connected-channels/email'
                )

                expect(screen.getByText(/email/i)).toBeInTheDocument()
            })
        })
    })
})
