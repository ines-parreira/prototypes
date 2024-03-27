import React from 'react'
import {screen, fireEvent, waitFor, act} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {QueryClientProvider} from '@tanstack/react-query'
import routerDom from 'react-router-dom'
import _omit from 'lodash/omit'
import LD from 'launchdarkly-react-client-sdk'
import {createBrowserHistory} from 'history'
import {RootState, StoreDispatch} from 'state/types'
import {entitiesInitialState} from 'fixtures/entities'
import {billingState} from 'fixtures/billing'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import useSearch from 'hooks/useSearch'

import {assumeMock, renderWithRouter} from 'utils/testing'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {
    useCreateCampaign,
    useDeleteCampaign,
    useListCampaigns,
    useUpdateCampaign,
} from 'models/convert/campaign/queries'
import {campaign} from 'fixtures/campaign'
import {channelConnection} from 'fixtures/channelConnection'
import {FeatureFlagKey} from 'config/featureFlags'

import {NavigatedSuccessModalName} from 'pages/common/components/SuccessModal/NavigatedSuccessModal'
import {Campaign} from '../types/Campaign'
import {CampaignsView} from '../CampaignsView'
import {CONVERT_ROUTE_PARAM_NAME} from '../../common/constants'
import {CampaignStatus} from '../types/enums/CampaignStatus.enum'
import {useGetOrCreateChannelConnection} from '../../common/hooks/useGetOrCreateChannelConnection'

jest.mock('utils/launchDarkly')

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

jest.mock('pages/settings/revenue/hooks/useGetConvertStatus')
jest.mock('pages/convert/campaigns/components/ConvertSetupBanner', () => {
    return jest.fn(() => <div>Mocked Banner</div>)
})

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection
)

jest.mock('models/convert/campaign/queries')
const useListCampaignMock = assumeMock(useListCampaigns)
const useCreateCampaignMock = assumeMock(useCreateCampaign)
const useUpdateCampaignMock = assumeMock(useUpdateCampaign)
const useDeleteCampaignMock = assumeMock(useDeleteCampaign)

const queryClient = mockQueryClient()

const mockHistory = createBrowserHistory()

describe('<CampaignsView/>', () => {
    const mutateCreateMock = jest.fn()
    const mutateDeleteMock = jest.fn()

    const defaultState = {
        entities: entitiesInitialState,
        billing: fromJS(billingState),
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

    const campaigns = [activeCampaign, inactiveCampaign] as Campaign[]

    beforeEach(() => {
        localStorage.clear()
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
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
                mutate: jest.fn(),
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
            }
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

        const {getByText} = renderComponent(defaultState)

        expect(
            getByText("This integration doesn't have any campaigns yet.")
        ).toBeInTheDocument()
    })

    it('should display the list correctly', () => {
        useParamsMock.mockReturnValue({
            [CONVERT_ROUTE_PARAM_NAME]: '118',
        })

        const {getByText} = renderComponent(defaultState)

        expect(getByText('Super campaign')).toBeInTheDocument()
        expect(getByText('Not so good campaign')).toBeInTheDocument()
    })

    it('should display the success setup modal', () => {
        useParamsMock.mockReturnValue({
            [CONVERT_ROUTE_PARAM_NAME]: '118',
        })

        act(() =>
            mockHistory.push('/', {
                showModal: NavigatedSuccessModalName.ConvertOnboarding,
            })
        )

        const {getByText} = renderComponent(defaultState)

        expect(getByText('All set!')).toBeInTheDocument()
        expect(
            getByText('You can now display campaigns on your website.')
        ).toBeInTheDocument()
    })

    describe('Campaigns library', () => {
        beforeAll(() => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.ConvertCampaignLibraryUi]: true,
            }))
            useParamsMock.mockReturnValue({
                [CONVERT_ROUTE_PARAM_NAME]: '118',
            })
        })

        it('should display campaign library button', () => {
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

            const {getByText} = renderComponent(state)

            expect(getByText('Create Custom Campaign')).toBeInTheDocument()
            expect(
                getByText('Create Campaign From Library')
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

            const {getByText, queryByText} = renderComponent(state)

            expect(getByText('Create Campaign')).toBeInTheDocument()
            expect(
                queryByText('Create Campaign From Library')
            ).not.toBeInTheDocument()
        })
    })

    describe('Campaign actions', () => {
        it('should display the duplicate buttons correctly', () => {
            const {getAllByTestId} = renderComponent(defaultState)

            const duplicateButtons = getAllByTestId('duplicate-icon-button')
            expect(duplicateButtons.length).toBe(2)
        })

        it('should display the delete buttons correctly', () => {
            const {getAllByTestId} = renderComponent(defaultState)

            const deleteButtons = getAllByTestId('delete-icon-button')
            expect(deleteButtons.length).toBe(2)
        })

        it('should call the duplicate callback', async () => {
            useListCampaignMock.mockReturnValue({
                data: [activeCampaign],
                isLoading: false,
                isError: false,
            } as any)

            const {getByTestId} = renderComponent(defaultState)

            fireEvent.click(getByTestId('duplicate-icon-button'))

            await waitFor(() => {
                const duplicateCampaign = {
                    ..._omit(activeCampaign, 'id'),
                    name: `(Copy) ${activeCampaign.name}`,
                    channel_connection_id: channelConnection.id,
                    trigger_rule: `{${mockUlid}}`,
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

            const {getByTestId} = renderComponent(defaultState)

            fireEvent.click(getByTestId('delete-icon-button'))

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
    })
})
