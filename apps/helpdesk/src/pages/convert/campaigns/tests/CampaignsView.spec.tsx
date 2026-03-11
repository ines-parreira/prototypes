import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { createBrowserHistory } from 'history'
import { fromJS } from 'immutable'
import _omit from 'lodash/omit'
import { Provider } from 'react-redux'
import routerDom from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { campaign } from 'fixtures/campaign'
import { channelConnection } from 'fixtures/channelConnection'
import { entitiesInitialState } from 'fixtures/entities'
import { useSearch } from 'hooks/useSearch'
import {
    useCreateCampaign,
    useDeleteCampaign,
    useListCampaigns,
    useUpdateCampaign,
} from 'models/convert/campaign/queries'
import { NavigatedSuccessModalName } from 'pages/common/components/SuccessModal/NavigatedSuccessModal'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import { CampaignScheduleRuleValueEnum } from 'pages/convert/campaigns/types/enums/CampaignScheduleSettingsValues.enum'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import { CONVERT_ROUTE_PARAM_NAME } from '../../common/constants'
import { useGetOrCreateChannelConnection } from '../../common/hooks/useGetOrCreateChannelConnection'
import { CampaignsView } from '../CampaignsView'
import type { Campaign } from '../types/Campaign'
import { CampaignStatus } from '../types/enums/CampaignStatus.enum'

jest.mock('@repo/feature-flags')

jest.mock('hooks/useSearch')
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))

const mockUlid = '01GWQ5K143AN1Y3W0AYBZXCGPT'
jest.mock('ulidx', () => ({
    ulid: jest.fn(() => mockUlid),
}))

const useParamsMock = routerDom.useParams as jest.MockedFunction<
    typeof routerDom.useParams
>

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

jest.mock('pages/convert/common/hooks/useGetConvertStatus')
jest.mock('pages/convert/campaigns/components/ConvertSetupBanner', () => {
    return jest.fn(() => <div>Mocked Banner</div>)
})

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection,
)

jest.mock('models/convert/campaign/queries')
const useListCampaignMock = assumeMock(useListCampaigns)
const useCreateCampaignMock = assumeMock(useCreateCampaign)
const useUpdateCampaignMock = assumeMock(useUpdateCampaign)
const useDeleteCampaignMock = assumeMock(useDeleteCampaign)

const queryClient = mockQueryClient()

const mockHistory = createBrowserHistory()

describe('<CampaignsView/>', () => {
    const isConvertSubscriberSpy = jest.spyOn(
        isConvertSubscriberHook,
        'useIsConvertSubscriber',
    )
    const mutateCreateMock = jest.fn()
    const mutateDeleteMock = jest.fn()
    const mutateUpdateMock = jest.fn()

    const integration = {
        id: 118,
        type: 'gorgias_chat',
        name: 'My new chat',
        meta: {},
    }

    const shopifyIntegration = {
        id: 118,
        type: 'gorgias_chat',
        name: 'My new chat',
        meta: {
            app_id: '1',
            shop_integration_id: 1,
            shop_type: 'shopify',
        },
    }

    const defaultState = {
        entities: entitiesInitialState,
        billing: fromJS(billingState),
        integrations: fromJS({
            integrations: [integration],
        }),
    }

    const activeCampaign = {
        ...campaign,
        id: '156a4d-fg68h40-sd6f4',
        name: 'Super campaign',
        message_text: 'Campaign message 1',
        message_html: 'Campaign message 1',
        status: CampaignStatus.Active,
    }

    const inactiveCampaign = {
        ...campaign,
        id: 'not-so-good-campaign-d8f9-fds486-sf78',
        name: 'Not so good campaign',
        message_text: 'Campaign message 2',
        message_html: 'Campaign message 2',
        status: CampaignStatus.Inactive,
    }

    const campaignWithSchedule = {
        ...campaign,
        id: 'campaign-with-schedule',
        name: 'campaign with schedule',
        message_text: 'Campaign message 1',
        message_html: 'Campaign message 1',
        status: CampaignStatus.Active,
        schedule: {
            start_datetime: '2023-08-04T07:25:02.983Z',
            end_datetime: null,
            schedule_rule: CampaignScheduleRuleValueEnum.AllDay,
            custom_schedule: null,
        },
    }

    const campaignWithScheduleEndDate = {
        ...campaign,
        id: 'campaign-with-schedule',
        name: 'campaign with schedule and end date',
        message_text: 'Campaign message 1',
        message_html: 'Campaign message 1',
        status: CampaignStatus.Active,
        schedule: {
            start_datetime: '2023-08-04T07:25:02.983Z',
            end_datetime: '2023-08-10T07:25:02.983Z',
            schedule_rule: CampaignScheduleRuleValueEnum.AllDay,
            custom_schedule: null,
        },
    }

    const campaigns = [
        activeCampaign,
        inactiveCampaign,
        campaignWithSchedule,
        campaignWithScheduleEndDate,
    ] as Campaign[]

    beforeEach(() => {
        localStorage.clear()
        isConvertSubscriberSpy.mockImplementation(() => true)
        ;(useSearch as jest.Mock).mockImplementation(() => {
            return {
                search: '',
            }
        })
        jest.useFakeTimers().setSystemTime(1680109831299)
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: channelConnection,
        } as any)
        useListCampaignMock.mockReturnValue({
            data: campaigns,
            isLoading: false,
            isError: false,
        } as any)
        useCreateCampaignMock.mockImplementation(() => {
            return {
                mutateAsync: mutateCreateMock,
            } as unknown as ReturnType<typeof useCreateCampaign>
        })
        useUpdateCampaignMock.mockImplementation(() => {
            return {
                mutate: mutateUpdateMock,
            } as unknown as ReturnType<typeof useUpdateCampaign>
        })
        useDeleteCampaignMock.mockImplementation(() => {
            return {
                mutate: mutateDeleteMock,
            } as unknown as ReturnType<typeof useDeleteCampaign>
        })
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    const renderComponent = (state: any) => {
        return renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <CampaignsView />
                </Provider>
            </QueryClientProvider>,
            {
                history: mockHistory,
            },
        )
    }

    it('should display the empty state correctly', () => {
        useParamsMock.mockReturnValue({
            [CONVERT_ROUTE_PARAM_NAME]: '118',
        })
        useListCampaignMock.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any)

        const { getByText } = renderComponent(defaultState)

        expect(
            getByText("This integration doesn't have any campaigns yet."),
        ).toBeInTheDocument()
    })

    it('should display the list correctly', () => {
        useParamsMock.mockReturnValue({
            [CONVERT_ROUTE_PARAM_NAME]: '118',
        })

        const { getByText } = renderComponent(defaultState)

        expect(getByText('Super campaign')).toBeInTheDocument()
        expect(getByText('Not so good campaign')).toBeInTheDocument()
        expect(
            getByText('campaign with schedule and end date'),
        ).toBeInTheDocument()
        expect(getByText('campaign with schedule')).toBeInTheDocument()

        // Check the schedule column
        expect(getByText('8/4/2023 - 8/10/2023')).toBeInTheDocument()
        expect(getByText('8/4/2023 - Not set')).toBeInTheDocument()
    })

    it('should display the success setup modal', () => {
        useParamsMock.mockReturnValue({
            [CONVERT_ROUTE_PARAM_NAME]: '118',
        })

        act(() =>
            mockHistory.push('/', {
                showModal: NavigatedSuccessModalName.ConvertOnboarding,
            }),
        )

        const { getByText } = renderComponent(defaultState)

        expect(getByText('All set!')).toBeInTheDocument()
        expect(
            getByText('You can now display campaigns on your website.'),
        ).toBeInTheDocument()
    })

    describe('Campaigns library', () => {
        beforeAll(() => {
            useParamsMock.mockReturnValue({
                [CONVERT_ROUTE_PARAM_NAME]: '118',
            })
        })

        it('should display campaign library button', () => {
            const state = {
                ...defaultState,
                integrations: fromJS({
                    integrations: [shopifyIntegration],
                }),
            }

            const { getByText } = renderComponent(state)

            expect(getByText('Create Custom Campaign')).toBeInTheDocument()
            expect(
                getByText('Create Campaign From Library'),
            ).toBeInTheDocument()
        })

        it('should not display campaign library button', () => {
            const state = {
                ...defaultState,
                integrations: fromJS({
                    integrations: [
                        {
                            id: 118,
                            type: 'gorgias_chat',
                            name: 'My new chat',
                            meta: {},
                        },
                    ],
                }),
            }

            const { getByText, queryByText } = renderComponent(state)

            expect(getByText('Create Campaign')).toBeInTheDocument()
            expect(
                queryByText('Create Campaign From Library'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Light campaigns', () => {
        beforeEach(() => {
            isConvertSubscriberSpy.mockImplementation(() => false)
            useParamsMock.mockReturnValue({
                [CONVERT_ROUTE_PARAM_NAME]: '118',
            })
        })

        it('should disable create campaign button and display tooltip with link', async () => {
            const state = {
                ...defaultState,
                integrations: fromJS({
                    integrations: [
                        {
                            id: 118,
                            type: 'gorgias_chat',
                            name: 'My new chat',
                            meta: {
                                app_id: '1',
                                shop_integration_id: 1,
                                shop_type: 'shopify',
                            },
                        },
                    ],
                }),
            }

            const { getByRole, findByText } = renderComponent(state)

            const button = getByRole('button', { name: 'Create Campaign' })
            expect(button).toBeInTheDocument()
            expect(button).toBeAriaDisabled()

            fireEvent.mouseOver(button)

            // verify tooltip click does not go to campaign create form
            const tooltip = await findByText('To create more campaigns', {
                exact: false,
            })
            tooltip.click()
            expect(mockHistory.location.pathname).not.toContain(
                '/campaigns/new',
            )

            await waitFor(() => {
                const link = getByRole('link', { name: 'discover Convert' })
                expect(link).toBeInTheDocument()
                expect(link).toHaveAttribute('target', '_blank')
            })
        })
    })

    describe('Campaign actions', () => {
        it('should display the duplicate buttons correctly', () => {
            renderComponent(defaultState)

            const duplicateButtons =
                screen.getAllByLabelText('Duplicate campaign')

            expect(duplicateButtons.length).toBe(4)
        })

        it('should display the delete buttons correctly', () => {
            renderComponent(defaultState)

            const deleteButtons = screen.getAllByLabelText('Delete campaign')
            expect(deleteButtons.length).toBe(4)
        })

        it('should call the duplicate callback', async () => {
            useListCampaignMock.mockReturnValue({
                data: [activeCampaign],
                isLoading: false,
                isError: false,
            } as any)

            renderComponent(defaultState)

            fireEvent.click(screen.getByLabelText('Duplicate campaign'))

            await waitFor(() => {
                const duplicateCampaign = {
                    ..._omit(activeCampaign, 'id'),
                    name: `(Copy) ${activeCampaign.name}`,
                    channel_connection_id: channelConnection.id,
                    trigger_rule: `{${mockUlid}}`,
                    schedule: null,
                    triggers: [
                        {
                            ...activeCampaign.triggers[0],
                            id: mockUlid,
                        },
                    ],
                    status: CampaignStatus.Inactive,
                }

                expect(mutateCreateMock).toHaveBeenCalledWith([
                    undefined,
                    duplicateCampaign,
                ])
            })
        })

        it('should call the delete callback', async () => {
            useListCampaignMock.mockReturnValue({
                data: [activeCampaign],
                isLoading: false,
                isError: false,
            } as any)

            renderComponent(defaultState)

            fireEvent.click(screen.getByLabelText('Delete campaign'))

            await waitFor(() => {
                screen.getByText(`Are you sure?`)
            })

            fireEvent.click(screen.getByText('Confirm'))

            await waitFor(() => {
                expect(mutateDeleteMock).toHaveBeenCalledWith([
                    undefined,
                    {
                        campaign_id: activeCampaign.id,
                        channelConnectionId: channelConnection.id,
                    },
                ])
            })
        })

        it('should show additional notification when disabling campaign with schedule', () => {
            useListCampaignMock.mockReturnValue({
                data: [campaignWithSchedule],
                isLoading: false,
                isError: false,
            } as any)

            const { getByRole } = renderComponent(defaultState)

            const toggleBtn = getByRole('switch')

            act(() => {
                fireEvent.click(toggleBtn)
            })

            expect(mutateUpdateMock).toHaveBeenCalledTimes(1)
            expect(mutateUpdateMock).toHaveBeenCalledWith(
                [
                    undefined,
                    {
                        campaign_id: 'campaign-with-schedule',
                        channelConnectionId: channelConnection.id,
                    },
                    { status: 'inactive' },
                ],
                { onSuccess: expect.any(Function) },
            )
        })
    })

    describe('Upsell banner', () => {
        const stateWithShopifyIntegration = {
            ...defaultState,
            integrations: fromJS({
                integrations: [shopifyIntegration],
            }),
        }

        beforeAll(() => {
            useParamsMock.mockReturnValue({
                [CONVERT_ROUTE_PARAM_NAME]: '118',
            })
        })

        it('should display the upsell banner for Shopify non-subscribers', () => {
            isConvertSubscriberSpy.mockImplementation(() => false)

            const { getByText } = renderComponent(stateWithShopifyIntegration)

            expect(getByText('Learn More')).toBeInTheDocument()
        })

        it('should not display the upsell banner for non-Shopify non-subscribers', () => {
            isConvertSubscriberSpy.mockImplementation(() => false)

            const { queryByText } = renderComponent(defaultState)

            expect(queryByText('Learn More')).not.toBeInTheDocument()
        })

        it('should not display the upsell banner for Shopify subscribers', () => {
            isConvertSubscriberSpy.mockImplementation(() => true)

            const { queryByText } = renderComponent(stateWithShopifyIntegration)

            expect(
                queryByText('Select Plan To Get Started'),
            ).not.toBeInTheDocument()
        })
    })
})
