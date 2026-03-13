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
import { useGetHelpCenter } from 'models/helpCenter/queries'
import {
    applicationAutomationSettingsFixture,
    applicationsAutomationSettingsStateFixture,
} from 'pages/aiAgent/fixtures/applicationAutomationSettings.fixture'
import { mockChatChannels } from 'pages/aiAgent/fixtures/chatChannels.fixture'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceChannels from 'pages/automate/common/hooks/useSelfServiceChannels'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'
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
import { ConnectedChannelsChatView } from '../components/ConnectedChannelsChatView'

jest.mock('settings/automate/hooks/useIsAutomateSettings')

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

const mockHelpCenterFixture = getSingleHelpCenterResponseFixture
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('models/helpCenter/queries', () => ({
    ...jest.requireActual('models/helpCenter/queries'),
    useGetHelpCenter: jest.fn(() => ({
        data: mockHelpCenterFixture,
        isLoading: false,
    })),
}))

const mockStore = configureMockStore([thunk])
const useGetHelpCenterMock = useGetHelpCenter as jest.Mock

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
            23: {
                id: 110,
                applicationId: 23,
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
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset',
)

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
                        enabled: true,
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
        ;(
            useIsArticleRecommendationsEnabledWhileSunset as jest.Mock
        ).mockReturnValue({ enabledInSettings: true })
    })
    it('should render', () => {
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsChatView />
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
                        <ConnectedChannelsChatView />
                    </QueryClientProvider>
                </Provider>
            </Router>,
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
            </Router>,
        )
        expect(screen.getByText('chat_bubble')).toBeInTheDocument()
    })

    it('should show the current channel name', () => {
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsChatView />
                    </QueryClientProvider>
                </Provider>
            </Router>,
        )

        expect(
            // button with aria-label="Currently viewing"
            screen.getByRole('button', { name: 'Currently viewing' }),
        ).toHaveTextContent(mockChatChannels[0].value.name)
    })

    it('should render the dropdown options', async () => {
        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsChatView />
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
        expect(screen.getAllByRole('option').length).toBe(
            mockChatChannels.length,
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
            </Router>,
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
            </Router>,
        )

        expect(screen.getByText(/Loading/i)).toBeInTheDocument()
    })

    it('toggles the settings', async () => {
        const handleUpdate = jest.fn()
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings:
                applicationsAutomationSettingsStateFixture,
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
            </Router>,
        )

        await act(async () => {
            fireEvent.click(screen.getByLabelText(/Enable Order Management/i))
            await waitFor(() => {
                expect(handleUpdate).toHaveBeenCalledTimes(1)
            })
        })
    })

    it('calls sets the selected value whenever a new channel is selected', () => {
        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsChatView />
                </Provider>
            </Router>,
        )

        const dropdown = screen.getByRole('button', {
            name: 'Currently viewing',
        })
        fireEvent.click(dropdown)
        fireEvent(
            screen.getByText(mockChatChannels[1].value.name),
            new MouseEvent('click', { bubbles: true }),
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
            </Router>,
        )

        expect(screen.queryByText(/Test/i)).not.toBeInTheDocument()
    })

    it(`will call 'handleUpdate' when switching on the article recommendation`, () => {
        const handleUpdate = jest.fn()
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                25: {
                    ...applicationAutomationSettingsFixture,
                    articleRecommendation: {
                        enabled: false,
                    },
                },
            },
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: handleUpdate,
        })
        ;(useGetHelpCenter as jest.Mock).mockReturnValue({
            data: {
                ...mockHelpCenterFixture,
            },
            isLoading: false,
        })
        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsChatView />
                </Provider>
            </Router>,
        )

        const toggle = screen.getByLabelText(/Enable Article Recommendation/i)
        fireEvent.click(toggle)

        expect(handleUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                articleRecommendation: { enabled: true },
            }),
            'Article Recommendation enabled',
        )
    })

    it('should show Article Recommendation toggle as unchecked when articleRecommendation.enabled is false in settings', () => {
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                25: {
                    ...applicationAutomationSettingsFixture,
                    articleRecommendation: { enabled: false },
                },
            },
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsChatView />
                </Provider>
            </Router>,
        )

        expect(
            screen.getByRole('switch', {
                name: /enable article recommendation/i,
            }),
        ).not.toBeChecked()
    })

    it(`will call 'handleUpdate' when switching on the order management`, () => {
        const handleUpdate = jest.fn()

        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings:
                applicationsAutomationSettingsStateFixture,
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: handleUpdate,
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsChatView />
                </Provider>
            </Router>,
        )

        const toggle = screen.getByLabelText(/Enable Order Management/i)
        fireEvent.click(toggle)

        expect(handleUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                orderManagement: { enabled: true },
            }),
            'Order Management enabled',
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
                        enabled: true,
                    },
                    orderManagement: {
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
            </Router>,
        )

        const toggle = screen.getByLabelText(/Enable Order Management/i)
        fireEvent.click(toggle)

        expect(handleUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                orderManagement: { enabled: false },
            }),
            'Order Management disabled',
        )
    })

    it('should take `shopType` and `shopName` from props when passed', () => {
        const handleUpdate = jest.fn()

        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                ...applicationsAutomationSettingsStateFixture,
                [23]: {
                    ...applicationAutomationSettingsFixture,
                    id: 23,
                    articleRecommendation: {
                        enabled: true,
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
            </Router>,
        )

        expect(screen.queryByText(/currently viewing/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/chat_bubble/i)).not.toBeInTheDocument()
        // Article recommendation toggle is shown but should be checked (enabled)
        expect(
            screen.getByRole('switch', {
                name: /enable article recommendation/i,
            }),
        ).toBeChecked()
        expect(
            screen.getByRole('switch', { name: /enable order management/i }),
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
            </Router>,
        )
        expect(screen.getByText(/Go to Chat/i)).toBeInTheDocument()
    })

    it('should render "Configuration Required" warning when the help center is not configured', () => {
        useGetHelpCenterMock.mockReturnValue({
            data: {
                ...mockHelpCenterFixture,
                deleted_datetime: '2024-07-12T12:44:21.004402+00:00',
            },
            isLoading: false,
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsChatView />
                </Provider>
            </Router>,
        )

        expect(screen.getByText(/Configuration Required/i)).toBeInTheDocument()
    })

    it('should show loading spinner when data is being fetched', () => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: null,
            storeIntegration: null,
            isFetchPending: true,
        })
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {},
            isFetchPending: true,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })
        ;(useSelfServiceChannels as jest.Mock).mockReturnValue(mockChatChannels)

        render(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedChannelsChatView />
                    </QueryClientProvider>
                </Provider>
            </Router>,
        )

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should handle channel selection change and navigation', async () => {
        const mockChannels = [
            ...mockChatChannels,
            {
                type: TicketChannel.HelpCenter,
                value: {
                    id: 100,
                    name: 'Help Center Channel',
                },
            },
            {
                type: TicketChannel.ContactForm,
                value: {
                    id: 101,
                    name: 'Contact Form Channel',
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
        ;(useSelfServiceChannels as jest.Mock).mockReturnValue(mockChannels)
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                25: {
                    id: 110,
                    applicationId: 20,
                    articleRecommendation: {
                        enabled: true,
                    },
                    orderManagement: {
                        enabled: false,
                    },
                    workflows: {
                        enabled: true,
                        entrypoints: [
                            {
                                enabled: true,
                                workflow_id: '01HQTDDBN1A75R9TH8PCQS4ARA',
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

        renderWithRouter(
            <Provider store={mockedStore}>
                <QueryClientProvider client={queryClient}>
                    <ConnectedChannelsChatView />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/channels',
                route: '/shopify/itay-store-two/channels',
            },
        )

        // Wait for dropdown to be visible and verify initial state
        await waitFor(() => {
            expect(screen.getByText('Currently viewing')).toBeInTheDocument()
        })
        expect(
            screen.getByRole('button', { name: 'Currently viewing' }),
        ).toHaveTextContent(mockChatChannels[0].value.name)

        // Open dropdown
        const dropdown = screen.getByRole('button', {
            name: 'Currently viewing',
        })
        await act(async () => {
            fireEvent.click(dropdown)
        })

        // Click Help Center option and verify it appears in dropdown
        await waitFor(() => {
            expect(screen.getByText('Help Center Channel')).toBeInTheDocument()
        })
        await act(async () => {
            fireEvent.click(screen.getByText('Help Center Channel'))
        })
    })

    describe('Article recommendation visibility for Shopify integrations', () => {
        it('should hide Article Recommendation section when storeIntegration is Shopify and enabledInSettings is false', () => {
            ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
                selfServiceConfiguration: mockSelfServiceConfiguration,
                storeIntegration: {
                    type: 'shopify',
                    meta: {
                        shop_domain: 'test-store.myshopify.com',
                        shop_name: 'test-store',
                    },
                },
                isFetchPending: false,
            })
            ;(
                useIsArticleRecommendationsEnabledWhileSunset as jest.Mock
            ).mockReturnValue({ enabledInSettings: false })

            renderWithQueryClientProvider(
                <Router history={history}>
                    <Provider store={mockedStore}>
                        <ConnectedChannelsChatView />
                    </Provider>
                </Router>,
            )

            expect(
                screen.queryByText(/Article Recommendation/i),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByLabelText(/Enable Article Recommendation/i),
            ).not.toBeInTheDocument()
        })

        it('should show Article Recommendation section when storeIntegration is Shopify and enabledInSettings is true', () => {
            ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
                selfServiceConfiguration: mockSelfServiceConfiguration,
                storeIntegration: {
                    type: 'shopify',
                    meta: {
                        shop_domain: 'test-store.myshopify.com',
                        shop_name: 'test-store',
                    },
                },
                isFetchPending: false,
            })
            ;(
                useIsArticleRecommendationsEnabledWhileSunset as jest.Mock
            ).mockReturnValue({ enabledInSettings: true })

            renderWithQueryClientProvider(
                <Router history={history}>
                    <Provider store={mockedStore}>
                        <ConnectedChannelsChatView />
                    </Provider>
                </Router>,
            )

            expect(
                screen.getByRole('switch', {
                    name: /Enable Article Recommendation/i,
                }),
            ).toBeInTheDocument()
        })

        it('should show Article Recommendation section when storeIntegration is non-Shopify (BigCommerce) when enabledInSettings is true', () => {
            ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
                selfServiceConfiguration: mockSelfServiceConfiguration,
                storeIntegration: {
                    type: 'bigcommerce',
                    meta: {
                        shop_domain: 'test-store.mybigcommerce.com',
                        store_hash: 'abc123',
                    },
                },
                isFetchPending: false,
            })
            ;(
                useIsArticleRecommendationsEnabledWhileSunset as jest.Mock
            ).mockReturnValue({ enabledInSettings: true })

            renderWithQueryClientProvider(
                <Router history={history}>
                    <Provider store={mockedStore}>
                        <ConnectedChannelsChatView />
                    </Provider>
                </Router>,
            )

            expect(
                screen.getByRole('switch', {
                    name: /Enable Article Recommendation/i,
                }),
            ).toBeInTheDocument()
        })

        it('should show Article Recommendation section when storeIntegration is non-Shopify (Magento2) when enabledInSettings is true', () => {
            ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
                selfServiceConfiguration: mockSelfServiceConfiguration,
                storeIntegration: {
                    type: 'magento2',
                    meta: { store_url: 'https://test-store.com' },
                },
                isFetchPending: false,
            })
            ;(
                useIsArticleRecommendationsEnabledWhileSunset as jest.Mock
            ).mockReturnValue({ enabledInSettings: true })

            renderWithQueryClientProvider(
                <Router history={history}>
                    <Provider store={mockedStore}>
                        <ConnectedChannelsChatView />
                    </Provider>
                </Router>,
            )

            expect(
                screen.getByRole('switch', {
                    name: /Enable Article Recommendation/i,
                }),
            ).toBeInTheDocument()
        })
    })
})
