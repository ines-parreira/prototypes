import React from 'react'
import {QueryClientProvider} from '@tanstack/react-query'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {keyBy} from 'lodash'
import thunk from 'redux-thunk'
import {render, screen, waitFor} from '@testing-library/react'
import {Router} from 'react-router-dom'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {billingState} from 'fixtures/billing'
import {RootState} from 'state/types'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {selfServiceConfiguration1 as mockSelfServiceConfiguration} from 'fixtures/self_service_configurations'
import history from 'pages/history'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import useSelfServiceHelpCenterChannels from 'pages/automate/common/hooks/useSelfServiceHelpCenterChannels'
import useHelpCentersAutomationSettings from 'pages/automate/common/hooks/useHelpCentersAutomationSettings'
import {initialState as articlesState} from '../../../../state/entities/helpCenter/articles'
import {initialState as categoriesState} from '../../../../state/entities/helpCenter/categories'
import {ConnectedChannelsHelpCenterView} from '../components/ConnectedChannelsHelpCenterView'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')
jest.mock('pages/automate/common/hooks/useHelpCentersAutomationSettings')
jest.mock('pages/automate/common/hooks/useSelfServiceHelpCenterChannels')

const mockHelpCenterChannels = [
    {
        type: 'help-center',
        value: {
            created_datetime: '2023-12-21T13:01:16.097Z',
            updated_datetime: '2024-04-26T09:16:46.329Z',
            deleted_datetime: null,
            algolia_api_key:
                'MDNjMjQ3YTEwNGMzMGJlYmQwNDk3ZjhmMjliN2MzZmYyYWE0MmJjODljZGVmM2VmNjRhNDM1ZjA2ZDY3MThiZGZpbHRlcnM9aGVscF9jZW50ZXJfaWQlM0E0MiZyZXN0cmljdEluZGljZXM9ZW50aXRpZXMtaXRheQ==',
            algolia_app_id: '5I8FV9TXKT',
            algolia_index_name: 'entities-itay',
            automation_settings_id: 7,
            brand_logo_light_url: null,
            brand_logo_url: null,
            code_snippet_template:
                '<script defer src="http://help-center.gorgias.docker:4000/api/help-centers/loader.js?v=2" data-gorgias-loader-help-center data-gorgias-help-center-uid="ju2vbjep"></script>',
            deactivated_datetime: null,
            default_locale: 'en-US',
            email_integration: {
                id: 5,
                email: 'zp7d01g9zorymjke@email-itay.gorgi.us',
            },
            favicon_url: null,
            gaid: null,
            hotswap_session_token: null,
            id: 42,
            name: 'Acme2',
            powered_by_deactivated_datetime: null,
            primary_color: '#4A8DF9',
            primary_font_family: 'Inter',
            search_deactivated_datetime: null,
            self_service_deactivated_datetime: null,
            shop_name: 'itay-store-two',
            source: 'manual',
            subdomain: 'acme',
            supported_locales: ['en-US'],
            theme: 'light',
            uid: 'ju2vbjep',
            integration_id: 18,
            type: 'faq',
            layout: 'default',
            account_id: 1,
            translations: [
                {
                    created_datetime: '2023-12-21T13:01:16.097Z',
                    updated_datetime: '2023-12-21T13:01:16.097Z',
                    deleted_datetime: null,
                    help_center_id: 42,
                    banner_text: null,
                    banner_image_url: null,
                    banner_image_vertical_offset: 0,
                    locale: 'en-US',
                    seo_meta: {
                        title: null,
                        description: null,
                    },
                    contact_info: {
                        email: {
                            deactivated_datetime: '2024-08-05T10:52:43.387Z',
                            description: '',
                            email: '',
                        },
                        phone: {
                            deactivated_datetime: '2024-08-05T10:52:43.387Z',
                            description: '',
                            phone_numbers: [],
                        },
                        chat: {
                            deactivated_datetime: '2024-08-05T10:52:43.387Z',
                            description: '',
                        },
                    },
                    chat_app_key: null,
                    extra_html: {
                        extra_head_deactivated_datetime:
                            '2024-08-05T10:52:43.387Z',
                        custom_header_deactivated_datetime:
                            '2024-08-05T10:52:43.387Z',
                        custom_footer_deactivated_datetime:
                            '2024-08-05T10:52:43.387Z',
                        extra_head: '',
                        custom_header: '',
                        custom_footer: '',
                    },
                    contact_form_id: 54,
                    logo_hyperlink: null,
                },
            ],
            redirects: [],
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
        ;(useSelfServiceHelpCenterChannels as jest.Mock).mockReturnValue(
            mockHelpCenterChannels
        )
        ;(useHelpCentersAutomationSettings as jest.Mock).mockReturnValue({
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
            handleHelpCenterAutomationSettingsUpdate: jest.fn(),
        })
    })

    it('should render', () => {
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsHelpCenterView />
                    </QueryClientProvider>
                </Provider>
            </Router>
        )
    })

    it('should render the dropdown', async () => {
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsHelpCenterView />
                    </QueryClientProvider>
                </Provider>
            </Router>
        )

        await waitFor(() => {
            expect(screen.getByText('Currently viewing')).toBeInTheDocument()
        })
    })

    it('should render contact form icon in the dropdown', async () => {
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsHelpCenterView />
                    </QueryClientProvider>
                </Provider>
            </Router>
        )

        await waitFor(() => {
            expect(screen.getByText('live_help')).toBeInTheDocument()
        })
    })
})
