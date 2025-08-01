import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { campaign } from 'fixtures/campaign'
import { channelConnection } from 'fixtures/channelConnection'
import {
    convertStatusLimitReached,
    convertStatusNotInstalled,
} from 'fixtures/convert'
import { entitiesInitialState } from 'fixtures/entities'
import { integrationsState } from 'fixtures/integrations'
import { user } from 'fixtures/users'
import useSearch from 'hooks/useSearch'
import * as revenueBetaHook from 'pages/common/hooks/useIsConvertSubscriber'
import useGetConvertStatus from 'pages/convert/common/hooks/useGetConvertStatus'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import { RootState, StoreDispatch } from 'state/types'

import { useCampaignListOptions } from '../../../hooks/useCampaignListOptions'
import { CampaignListOptions } from '../../../providers/CampaignListOptions'
import { Campaign } from '../../../types/Campaign'
import { CampaignStatus } from '../../../types/enums/CampaignStatus.enum'
import { CampaignTriggerType } from '../../../types/enums/CampaignTriggerType.enum'
import { createTrigger } from '../../../utils/createTrigger'
import CampaignsList from '../CampaignsList'

jest.mock('hooks/useSearch')
jest.mock('../../../hooks/useCampaignListOptions')
jest.mock('pages/convert/common/hooks/useGetConvertStatus')

const useGetConvertStatusMock = assumeMock(useGetConvertStatus)

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection,
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const campaignsList = Array.from({ length: 19 }, (_, i) => ({
    ...campaign,
    id: i,
    name: `campaign ${i}`,
    triggers: [createTrigger(CampaignTriggerType.BusinessHours)],
    message_text: `campaign message ${i}`,
    message_html: `campaign message ${i}`,
})) as unknown[] as Campaign[]

const integration = fromJS({
    id: 118,
    type: 'gorgias_chat',
    name: 'My new chat',
    meta: {
        campaigns: campaignsList,
    },
})

describe('<CampaignsList />', () => {
    let store: MockStoreEnhanced<Partial<RootState>, StoreDispatch>
    const props = {
        campaigns: campaignsList,
        integration: integration,
        isLoading: false,
        isUpdatingCampaign: false,
        isDeletingCampaign: false,
        onDeleteCampaign: jest.fn(),
        onDuplicateCampaign: jest.fn(),
        onUpdateCampaign: jest.fn(),
    }

    beforeAll(() => {
        jest.spyOn(
            revenueBetaHook,
            'useIsConvertSubscriber',
        ).mockImplementation(() => true)
    })

    beforeEach(() => {
        store = mockStore({
            currentUser: fromJS(user),
            entities: entitiesInitialState,
            billing: fromJS(billingState),
            integrations: fromJS(integrationsState),
        })
        ;(useSearch as jest.Mock).mockImplementation(() => {
            return {
                page: 1,
                search: '',
                state: '',
            }
        })
        ;(useCampaignListOptions as jest.Mock).mockImplementation(() => {
            return {
                getParams: () => ({
                    search: '',
                    filters: [],
                }),
            }
        })
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: {
                ...channelConnection,
                is_onboarded: true,
            },
        } as any)
    })

    describe('Campaigns intro Candu links', () => {
        it('should display', () => {
            const { container } = render(
                <Provider store={store}>
                    <CampaignListOptions>
                        <CampaignsList {...props} />
                    </CampaignListOptions>
                </Provider>,
            )

            expect(
                container.querySelector(
                    '[data-candu-id="convert-links-campaign-list"]',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('Campaigns search', () => {
        it('should display the found campaigns', () => {
            ;(useCampaignListOptions as jest.Mock).mockImplementation(() => {
                return {
                    getParams: () => ({
                        search: 'Awesome',
                        filters: [],
                    }),
                }
            })

            const trigger = createTrigger(CampaignTriggerType.BusinessHours)

            render(
                <Provider store={store}>
                    <CampaignListOptions>
                        <CampaignsList
                            {...props}
                            campaigns={[
                                ...campaignsList,
                                {
                                    ...campaign,
                                    id: '999',
                                    name: `Awesome campaign`,
                                    triggers: [trigger],
                                    trigger_rule: `{${trigger.id}}`,
                                    message_text: `awesome campaign message`,
                                    message_html: `awesome campaign message`,
                                    status: CampaignStatus.Active,
                                    is_light: false,
                                    created_datetime:
                                        '2021-10-06T17:17:56.565Z',
                                    updated_datetime:
                                        '2021-10-06T17:17:56.565Z',
                                },
                            ]}
                        />
                    </CampaignListOptions>
                </Provider>,
            )

            screen.getByText('Awesome campaign')
            expect(() => screen.getByText('campaign 2')).toThrow()
        })

        it('should display a message if no campaigns were found', () => {
            ;(useCampaignListOptions as jest.Mock).mockImplementation(() => {
                return {
                    getParams: () => ({
                        search: 'not found',
                        filters: [],
                    }),
                }
            })

            const { getByText } = render(
                <Provider store={store}>
                    <CampaignsList {...props} />
                </Provider>,
            )

            getByText('No campaigns match your search and filters.')
        })
    })

    describe('Campaign filter when A/B test LD is enabled', () => {
        it('should display A/B Test filter', () => {
            const { getByText } = render(
                <Provider store={store}>
                    <CampaignsList {...props} />
                </Provider>,
            )

            getByText('All')
            getByText('Active')
            getByText('Inactive')
            getByText('A/B Tests')
        })
    })

    describe('Campaign filters', () => {
        const campaignsForFilters = [
            {
                id: '156a4d-fg68h40-sd6f4',
                name: 'Super campaign',
                message_text: 'Campaign message 1',
                message_html: 'Campaign message 1',
                triggers: [createTrigger(CampaignTriggerType.BusinessHours)],
                status: CampaignStatus.Active,
            },
            {
                id: 'not-so-good-campaign-d8f9-fds486-sf78',
                name: 'Not so good campaign',
                message_text: 'Campaign message 2',
                message_html: 'Campaign message 2',
                triggers: [createTrigger(CampaignTriggerType.BusinessHours)],
                status: CampaignStatus.Inactive,
            },
        ] as unknown[] as Campaign[]

        it('should display the status filter', () => {
            const { getByText } = render(
                <Provider store={store}>
                    <CampaignsList {...props} />
                </Provider>,
            )

            getByText('All')
            getByText('Active')
            getByText('Inactive')
        })

        it('should not display the status filter if there are no campaigns', () => {
            const { getByText } = render(
                <Provider store={store}>
                    <CampaignsList {...props} campaigns={[]} />
                </Provider>,
            )

            expect(() => getByText('All')).toThrow()
            expect(() => getByText('Active')).toThrow()
            expect(() => getByText('Inactive')).toThrow()
        })

        it('should display all campaigns by default', () => {
            const { getByText } = render(
                <Provider store={store}>
                    <CampaignsList {...props} campaigns={campaignsForFilters} />
                </Provider>,
            )

            getByText('Super campaign')
            getByText('Not so good campaign')
        })

        it('should display only active campaigns', () => {
            ;(useCampaignListOptions as jest.Mock).mockImplementation(() => {
                return {
                    getParams: () => ({
                        state: 'active',
                        filters: [],
                    }),
                }
            })

            const { getByText } = render(
                <Provider store={store}>
                    <CampaignsList {...props} campaigns={campaignsForFilters} />
                </Provider>,
            )

            getByText('Super campaign')
            expect(() => getByText('Not so good campaign')).toThrow()
        })

        it('should display only inactive campaigns', () => {
            ;(useCampaignListOptions as jest.Mock).mockImplementation(() => {
                return {
                    getParams: () => ({
                        state: 'inactive',
                        filters: [],
                    }),
                }
            })

            const { getByText } = render(
                <Provider store={store}>
                    <CampaignsList {...props} campaigns={campaignsForFilters} />
                </Provider>,
            )

            expect(() => getByText('Super campaign')).toThrow()
            getByText('Not so good campaign')
        })
    })

    describe('Campaign infobar', () => {
        const buttonText = 'Complete installation'
        const messageText = "haven't completed the campaign bundle installation"

        it('should render setup infobar', () => {
            useGetConvertStatusMock.mockReturnValue(convertStatusNotInstalled)
            const { queryByText } = render(
                <Provider store={store}>
                    <CampaignsList {...props} campaigns={campaignsList} />
                </Provider>,
            )

            expect(
                queryByText(messageText, { exact: false }),
            ).toBeInTheDocument()
            expect(queryByText(buttonText)).toBeInTheDocument()
        })
    })

    describe('Usage limit', () => {
        const buttonText = 'Upgrade'
        const messageText = "You've reached the limit for your Convert plan"

        it('should render limit reached banner', () => {
            useGetConvertStatusMock.mockReturnValue(convertStatusLimitReached)
            const { queryByText } = render(
                <Provider store={store}>
                    <CampaignsList {...props} campaigns={campaignsList} />
                </Provider>,
            )

            expect(
                queryByText(messageText, { exact: false }),
            ).toBeInTheDocument()
            expect(queryByText(buttonText)).toBeInTheDocument()
        })
    })
})
