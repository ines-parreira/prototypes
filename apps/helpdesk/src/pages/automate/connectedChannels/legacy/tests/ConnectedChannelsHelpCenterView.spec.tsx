import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { produce } from 'immer'
import { fromJS } from 'immutable'
import { keyBy } from 'lodash'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import { billingState } from 'fixtures/billing'
import { selfServiceConfiguration1 as mockSelfServiceConfiguration } from 'fixtures/self_service_configurations'
import { useUpdateHelpCenter } from 'models/helpCenter/queries'
import useHelpCentersAutomationSettings from 'pages/automate/common/hooks/useHelpCentersAutomationSettings'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import type { SelfServiceHelpCenterChannel } from 'pages/automate/common/hooks/useSelfServiceHelpCenterChannels'
import useSelfServiceHelpCenterChannels from 'pages/automate/common/hooks/useSelfServiceHelpCenterChannels'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { initialState as articlesState } from 'state/entities/helpCenter/articles'
import { initialState as categoriesState } from 'state/entities/helpCenter/categories'
import { NotificationStatus } from 'state/notifications/types'
import type { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import { ConnectedChannelsHelpCenterView } from '../components/ConnectedChannelsHelpCenterView'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')
jest.mock('pages/automate/common/hooks/useHelpCentersAutomationSettings')
jest.mock('pages/automate/common/hooks/useSelfServiceHelpCenterChannels')
jest.mock('models/helpCenter/queries')

const mockHelpCenterChannels: SelfServiceHelpCenterChannel[] = [
    {
        type: TicketChannel.HelpCenter,
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
            shop_integration_id: 1,
            source: 'manual',
            subdomain: 'acme',
            supported_locales: ['en-US'],
            theme: 'light',
            uid: 'ju2vbjep',
            integration_id: 18,
            type: 'faq',
            layout: 'default',
            main_embedment_base_url: null,
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
        ;(useSelfServiceHelpCenterChannels as jest.Mock).mockReturnValue(
            mockHelpCenterChannels,
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
        ;(useUpdateHelpCenter as jest.Mock).mockReturnValue({
            mutateAsync: jest.fn(),
        })
        mockedStore.clearActions()
    })

    it('should render', () => {
        renderWithRouter(
            <Provider store={mockedStore}>
                <QueryClientProvider client={queryClient}>
                    <ConnectedChannelsHelpCenterView />
                </QueryClientProvider>
            </Provider>,
        )
    })

    it('should render the dropdown', async () => {
        renderWithRouter(
            <Provider store={mockedStore}>
                <QueryClientProvider client={queryClient}>
                    <ConnectedChannelsHelpCenterView />
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(screen.getByText('Currently viewing')).toBeInTheDocument()
        })
    })

    it('should render contact form icon in the dropdown', async () => {
        renderWithRouter(
            <Provider store={mockedStore}>
                <QueryClientProvider client={queryClient}>
                    <ConnectedChannelsHelpCenterView />
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(screen.getByText('live_help')).toBeInTheDocument()
        })
    })

    it('should not render app dropdown when help center prop is passed', async () => {
        renderWithRouter(
            <Provider store={mockedStore}>
                <QueryClientProvider client={queryClient}>
                    <ConnectedChannelsHelpCenterView
                        helpCenter={mockHelpCenterChannels[0].value}
                    />
                </QueryClientProvider>
            </Provider>,
        )
        await waitFor(() => {
            expect(screen.queryByText('Currently viewing')).toBeNull()
        })
    })

    it('should use helpCenter.id when helpCenter prop is provided instead of channel list', async () => {
        const mockUpdateHelpCenterMutateAsync = jest.fn().mockResolvedValue({
            data: {
                ...mockHelpCenterChannels[0].value,
                self_service_deactivated_datetime: '2024-09-04T10:02:02.163Z',
            },
        })

        const mockChannelsWithDeactivated = produce(
            mockHelpCenterChannels,
            (draft) => {
                draft[0].value.self_service_deactivated_datetime =
                    '2024-09-04T10:02:02.163Z'
            },
        )

        ;(useSelfServiceHelpCenterChannels as jest.Mock).mockReturnValue(
            mockChannelsWithDeactivated,
        )
        ;(useUpdateHelpCenter as jest.Mock).mockReturnValue({
            mutateAsync: mockUpdateHelpCenterMutateAsync,
        })

        renderWithRouter(
            <Provider store={mockedStore}>
                <QueryClientProvider client={queryClient}>
                    <ConnectedChannelsHelpCenterView
                        helpCenter={mockChannelsWithDeactivated[0].value}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Enable Order Management'),
            ).toBeInTheDocument()
        })

        act(() => {
            fireEvent.click(screen.getByText('Enable Order Management'))
        })

        await waitFor(() => {
            expect(mockUpdateHelpCenterMutateAsync).toHaveBeenCalledWith([
                undefined,
                { help_center_id: mockChannelsWithDeactivated[0].value.id },
                {
                    self_service_deactivated: false,
                },
            ])
        })
    })

    it('should prioritize helpCenter.id over channel list id when both are available', async () => {
        const differentHelpCenterId = 999
        const mockUpdateHelpCenterMutateAsync = jest.fn().mockResolvedValue({
            data: {
                ...mockHelpCenterChannels[0].value,
                id: differentHelpCenterId,
                self_service_deactivated_datetime: '2024-09-04T10:02:02.163Z',
            },
        })

        const providedHelpCenter = {
            ...mockHelpCenterChannels[0].value,
            id: differentHelpCenterId,
            self_service_deactivated_datetime: '2024-09-04T10:02:02.163Z',
        }

        // Create a modified channel list with deactivated order management
        const mockChannelsWithDeactivated = produce(
            mockHelpCenterChannels,
            (draft) => {
                draft[0].value.self_service_deactivated_datetime =
                    '2024-09-04T10:02:02.163Z'
            },
        )

        ;(useSelfServiceHelpCenterChannels as jest.Mock).mockReturnValue(
            mockChannelsWithDeactivated,
        )
        ;(useUpdateHelpCenter as jest.Mock).mockReturnValue({
            mutateAsync: mockUpdateHelpCenterMutateAsync,
        })

        // Mock useHelpCentersAutomationSettings to capture the helpCenterId passed to it
        const mockHandleUpdate = jest.fn()
        ;(useHelpCentersAutomationSettings as jest.Mock).mockImplementation(
            (helpCenterId) => {
                // Verify the correct helpCenterId is passed
                expect(helpCenterId).toBe(differentHelpCenterId)
                return {
                    automationSettings: {
                        workflows: [],
                        order_management: {
                            enabled: false,
                        },
                    },
                    isFetchPending: false,
                    handleHelpCenterAutomationSettingsUpdate: mockHandleUpdate,
                }
            },
        )

        renderWithRouter(
            <Provider store={mockedStore}>
                <QueryClientProvider client={queryClient}>
                    <ConnectedChannelsHelpCenterView
                        helpCenter={providedHelpCenter}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Enable Order Management'),
            ).toBeInTheDocument()
        })

        act(() => {
            fireEvent.click(screen.getByText('Enable Order Management'))
        })

        // Verify that the update uses the helpCenter.id (differentHelpCenterId)
        // instead of the channel list's first item id (42)
        await waitFor(() => {
            expect(mockUpdateHelpCenterMutateAsync).toHaveBeenCalledWith([
                undefined,
                { help_center_id: differentHelpCenterId },
                {
                    self_service_deactivated: false,
                },
            ])
        })
    })

    it('should render an empty state when there are no channels', () => {
        ;(useSelfServiceHelpCenterChannels as jest.Mock).mockReturnValue([])

        renderWithRouter(
            <Provider store={mockedStore}>
                <QueryClientProvider client={queryClient}>
                    <ConnectedChannelsHelpCenterView />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText(/Go to Help Center/i)).toBeInTheDocument()
    })

    it('should toggle order management off', async () => {
        const mockUpdateHelpCenterMutateAsync = jest.fn().mockResolvedValue({
            data: {
                ...mockHelpCenterChannels[0].value,
                self_service_deactivated_datetime: '2024-09-04T10:02:02.163Z',
            },
        })

        ;(useUpdateHelpCenter as jest.Mock).mockReturnValue({
            mutateAsync: mockUpdateHelpCenterMutateAsync,
        })

        renderWithRouter(
            <Provider store={mockedStore}>
                <QueryClientProvider client={queryClient}>
                    <ConnectedChannelsHelpCenterView />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/connected-channels/help-center',
                route: '/shopify/itay-store-two/connected-channels/help-center',
            },
        )

        await waitFor(() => {
            expect(screen.getByText('Currently viewing')).toBeInTheDocument()
        })

        act(() => {
            fireEvent.click(screen.getByText('Enable Order Management'))
        })

        await waitFor(() => {
            expect(mockUpdateHelpCenterMutateAsync).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 42 },
                {
                    self_service_deactivated: true,
                },
            ])
        })

        expect(mockedStore.getActions()).toEqual([
            expect.objectContaining({
                type: 'HELPCENTER/HELPCENTER_UPDATED',
                payload: {
                    ...mockHelpCenterChannels[0].value,
                    self_service_deactivated_datetime:
                        '2024-09-04T10:02:02.163Z',
                },
            }),
            expect.objectContaining({
                payload: expect.objectContaining({
                    message: 'Order Management disabled',
                    status: NotificationStatus.Success,
                }),
            }),
        ])
    })

    it('should toggle order management on', async () => {
        const mockUpdateHelpCenterMutateAsync = jest.fn().mockResolvedValue({
            data: {
                ...mockHelpCenterChannels[0].value,
                self_service_deactivated_datetime: null,
            },
        })

        ;(useSelfServiceHelpCenterChannels as jest.Mock).mockReturnValue(
            produce(mockHelpCenterChannels, (draft) => {
                draft[0].value.self_service_deactivated_datetime =
                    '2024-09-04T10:02:02.163Z'
            }),
        )
        ;(useUpdateHelpCenter as jest.Mock).mockReturnValue({
            mutateAsync: mockUpdateHelpCenterMutateAsync,
        })

        renderWithRouter(
            <Provider store={mockedStore}>
                <QueryClientProvider client={queryClient}>
                    <ConnectedChannelsHelpCenterView />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/connected-channels/help-center',
                route: '/shopify/itay-store-two/connected-channels/help-center',
            },
        )

        await waitFor(() => {
            expect(screen.getByText('Currently viewing')).toBeInTheDocument()
        })

        act(() => {
            fireEvent.click(screen.getByText('Enable Order Management'))
        })

        await waitFor(() => {
            expect(mockUpdateHelpCenterMutateAsync).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 42 },
                {
                    self_service_deactivated: false,
                },
            ])
        })

        expect(mockedStore.getActions()).toEqual([
            expect.objectContaining({
                type: 'HELPCENTER/HELPCENTER_UPDATED',
                payload: {
                    ...mockHelpCenterChannels[0].value,
                    self_service_deactivated_datetime: null,
                },
            }),
            expect.objectContaining({
                payload: expect.objectContaining({
                    message: 'Order Management enabled',
                    status: NotificationStatus.Success,
                }),
            }),
        ])
    })

    it('should show loading spinner when data is being fetched', () => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: null,
            storeIntegration: null,
            isFetchPending: true,
        })
        ;(useHelpCentersAutomationSettings as jest.Mock).mockReturnValue({
            automationSettings: null,
            isFetchPending: true,
            handleHelpCenterAutomationSettingsUpdate: jest.fn(),
        })

        renderWithRouter(
            <Provider store={mockedStore}>
                <QueryClientProvider client={queryClient}>
                    <ConnectedChannelsHelpCenterView />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should handle channel selection change correctly', async () => {
        const mockChannels = [
            ...mockHelpCenterChannels,
            {
                type: TicketChannel.HelpCenter,
                value: {
                    ...mockHelpCenterChannels[0].value,
                    id: 43,
                    name: 'Second Help Center',
                },
            },
        ]

        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: mockSelfServiceConfiguration,
            storeIntegration: null,
            isFetchPending: false,
        })
        ;(useSelfServiceHelpCenterChannels as jest.Mock).mockReturnValue(
            mockChannels,
        )
        ;(useHelpCentersAutomationSettings as jest.Mock).mockReturnValue({
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
            handleHelpCenterAutomationSettingsUpdate: jest.fn(),
        })

        renderWithRouter(
            <Provider store={mockedStore}>
                <QueryClientProvider client={queryClient}>
                    <ConnectedChannelsHelpCenterView />
                </QueryClientProvider>
            </Provider>,
        )

        // Wait for the dropdown to be visible
        await waitFor(() => {
            expect(screen.getByText('Currently viewing')).toBeInTheDocument()
        })

        // Open the dropdown
        const dropdown = screen.getByText(mockHelpCenterChannels[0].value.name)
        await act(async () => {
            fireEvent.click(dropdown)
        })

        // Wait for the second option to be visible and click it
        await waitFor(() => {
            expect(screen.getByText('Second Help Center')).toBeInTheDocument()
        })

        await act(async () => {
            fireEvent.click(screen.getByText('Second Help Center'))
        })

        // Verify the selection changed
        expect(screen.getByText('Second Help Center')).toBeInTheDocument()
    })

    it('should initialize with channel ID from URL parameter', async () => {
        const channelId = '43'
        const mockChannels = [
            ...mockHelpCenterChannels,
            {
                type: TicketChannel.HelpCenter,
                value: {
                    ...mockHelpCenterChannels[0].value,
                    id: 43,
                    name: 'Channel from URL',
                },
            },
        ]

        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: mockSelfServiceConfiguration,
            storeIntegration: null,
            isFetchPending: false,
        })
        ;(useSelfServiceHelpCenterChannels as jest.Mock).mockReturnValue(
            mockChannels,
        )
        ;(useHelpCentersAutomationSettings as jest.Mock).mockReturnValue({
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
            handleHelpCenterAutomationSettingsUpdate: jest.fn(),
        })

        renderWithRouter(
            <Provider store={mockedStore}>
                <QueryClientProvider client={queryClient}>
                    <ConnectedChannelsHelpCenterView />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/connected-channels/help-center',
                route: `/shopify/itay-store-two/connected-channels/help-center?channel-id=${channelId}`,
            },
        )

        await waitFor(() => {
            expect(screen.getByText('Channel from URL')).toBeInTheDocument()
        })
    })
})
