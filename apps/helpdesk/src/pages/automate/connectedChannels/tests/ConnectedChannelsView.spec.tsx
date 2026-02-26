/* eslint-disable @typescript-eslint/no-unsafe-return */
import type React from 'react'

import { screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { keyBy } from 'lodash'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { selfServiceConfiguration1 as mockSelfServiceConfiguration } from 'fixtures/self_service_configurations'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useHelpCentersAutomationSettings from 'pages/automate/common/hooks/useHelpCentersAutomationSettings'
import useSelfServiceChannels from 'pages/automate/common/hooks/useSelfServiceChannels'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'
import type { RootState } from 'state/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { initialState as articlesState } from '../../../../state/entities/helpCenter/articles'
import { initialState as categoriesState } from '../../../../state/entities/helpCenter/categories'
import { ConnectedChannelsView } from '../ConnectedChannelsView'

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
    }),
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
    }),
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
    }),
)

jest.mock('settings/automate/hooks/useIsAutomateSettings')

jest.mock('../components/ConnectedChannelsChatView', () => ({
    ConnectedChannelsChatView: () => (
        <div data-testid="connected-channels-chat-view" />
    ),
}))

jest.mock('../components/ConnectedChannelsHelpCenterView', () => ({
    ConnectedChannelsHelpCenterView: () => (
        <div data-testid="connected-channels-help-center-view" />
    ),
}))

jest.mock('../components/ConnectedChannelsContactFormView', () => ({
    ConnectedChannelsContactFormView: () => (
        <div data-testid="connected-channels-contact-form-view" />
    ),
}))

jest.mock('../components/ConnectedChannelsEmailView', () => ({
    ConnectedChannelsEmailView: () => (
        <div data-testid="connected-channels-email-view" />
    ),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset',
    () => ({
        useIsArticleRecommendationsEnabledWhileSunset: jest.fn(() => ({
            enabled: true,
        })),
    }),
)

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
    const history = createMemoryHistory({ initialEntries: [route] })
    return {
        ...renderWithQueryClientProvider(
            <Provider store={mockedStore}>
                <Router history={history}>{ui}</Router>
            </Provider>,
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

    describe('routing', () => {
        it('should render chat view on base route', () => {
            renderWithRouter(<ConnectedChannelsView />, {
                route: '/app/automation/shopType/shopName/connected-channels',
            })

            // Mock the chat view component separately
            expect(
                screen.getByTestId('connected-channels-chat-view'),
            ).toBeInTheDocument()
        })

        it('should render help center view on /help-center route', () => {
            renderWithRouter(<ConnectedChannelsView />, {
                route: '/app/automation/shopType/shopName/connected-channels/help-center',
            })

            expect(
                screen.getByTestId('connected-channels-help-center-view'),
            ).toBeInTheDocument()
        })

        it('should render contact form view on /contact-form route', () => {
            renderWithRouter(<ConnectedChannelsView />, {
                route: '/app/automation/shopType/shopName/connected-channels/contact-form',
            })

            expect(
                screen.getByTestId('connected-channels-contact-form-view'),
            ).toBeInTheDocument()
        })

        it('should render email view on /email route', () => {
            renderWithRouter(<ConnectedChannelsView />, {
                route: '/app/automation/shopType/shopName/connected-channels/email',
            })

            expect(
                screen.getByTestId('connected-channels-email-view'),
            ).toBeInTheDocument()
        })
    })

    it('should not render page header and navbar when in automate settings mode', () => {
        ;(useIsAutomateSettings as jest.Mock).mockReturnValue(true)

        renderWithRouter(<ConnectedChannelsView />)

        expect(screen.queryByText('Channels')).not.toBeInTheDocument()
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })

    describe('navigation links', () => {
        it('should render all navigation links with correct URLs', () => {
            ;(useIsAutomateSettings as jest.Mock).mockReturnValue(false)
            renderWithRouter(<ConnectedChannelsView />)

            const links = screen.getAllByRole('link')
            expect(links).toHaveLength(4)
            expect(links[0]).toHaveAttribute(
                'href',
                '/app/automation/shopType/shopName/connected-channels',
            )
            expect(links[1]).toHaveAttribute(
                'href',
                '/app/automation/shopType/shopName/connected-channels/help-center',
            )
            expect(links[2]).toHaveAttribute(
                'href',
                '/app/automation/shopType/shopName/connected-channels/contact-form',
            )
            expect(links[3]).toHaveAttribute(
                'href',
                '/app/automation/shopType/shopName/connected-channels/email',
            )
        })
    })
})
