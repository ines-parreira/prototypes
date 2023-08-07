import React from 'react'
import {screen, render} from '@testing-library/react'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {fromJS} from 'immutable'

import {RootState, StoreDispatch} from 'state/types'
import {entitiesInitialState} from 'fixtures/entities'
import useSearch from 'hooks/useSearch'

import {useCampaignListOptions} from '../../../hooks/useCampaignListOptions'

import {createTrigger} from '../../../utils/createTrigger'

import {CampaignListOptions} from '../../../providers/CampaignListOptions'

import {CampaignTriggerKey} from '../../../types/enums/CampaignTriggerKey.enum'
import {ChatCampaign} from '../../../types/Campaign'

import {CampaignsList} from '../CampaignsList'

jest.mock('hooks/useSearch')
jest.mock('../../../hooks/useCampaignListOptions')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const campaignsList = Array.from({length: 19}, (_, i) => ({
    id: i,
    name: `campaign ${i}`,
    triggers: [createTrigger(CampaignTriggerKey.BusinessHours)],
    message: {
        text: `campaign message ${i}`,
        html: `campaign message ${i}`,
    },
})) as unknown[] as ChatCampaign[]

const currentUser = fromJS({
    id: 1,
    role: {name: 'agent'},
})

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

    beforeEach(() => {
        store = mockStore({
            entities: entitiesInitialState,
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
                }),
            }
        })
    })

    describe('Campaigns search', () => {
        it('should display the found campaigns', () => {
            ;(useCampaignListOptions as jest.Mock).mockImplementation(() => {
                return {
                    getParams: () => ({
                        search: 'Awesome',
                    }),
                }
            })

            render(
                <Provider store={store}>
                    <CampaignListOptions>
                        <CampaignsList
                            currentUser={currentUser}
                            integration={integration}
                            campaigns={[
                                ...campaignsList,
                                {
                                    id: '999',
                                    name: `Awesome campaign`,
                                    triggers: [
                                        createTrigger(
                                            CampaignTriggerKey.BusinessHours
                                        ),
                                    ],
                                    message: {
                                        text: `awesome campaign message`,
                                        html: `awesome campaign message`,
                                    },
                                },
                            ]}
                            onDeleteCampaign={jest.fn()}
                            onDuplicateCampaign={jest.fn()}
                            onUpdateCampaign={jest.fn()}
                        />
                    </CampaignListOptions>
                </Provider>
            )

            screen.getByText('Awesome campaign')
            expect(() => screen.getByText('campaign 2')).toThrow()
        })

        it('should display a message if no campaigns were found', () => {
            ;(useCampaignListOptions as jest.Mock).mockImplementation(() => {
                return {
                    getParams: () => ({
                        search: 'not found',
                    }),
                }
            })

            const {getByText} = render(
                <Provider store={store}>
                    <CampaignsList
                        currentUser={currentUser}
                        integration={integration}
                        campaigns={campaignsList}
                        onDeleteCampaign={jest.fn()}
                        onDuplicateCampaign={jest.fn()}
                        onUpdateCampaign={jest.fn()}
                    />
                </Provider>
            )

            getByText('No campaigns match your search and filters.')
        })
    })

    describe('Campaign filters', () => {
        const campaignsForFilters = [
            {
                id: '156a4d-fg68h40-sd6f4',
                name: 'Super campaign',
                message: {
                    text: 'Campaign message 1',
                    html: 'Campaign message 1',
                },
                triggers: [createTrigger(CampaignTriggerKey.BusinessHours)],
                deactivated_datetime: null,
            },
            {
                id: 'not-so-good-campaign-d8f9-fds486-sf78',
                name: 'Not so good campaign',
                message: {
                    text: 'Campaign message 2',
                    html: 'Campaign message 2',
                },
                triggers: [createTrigger(CampaignTriggerKey.BusinessHours)],
                deactivated_datetime: '2017-10-06T17:17:56.565Z',
            },
        ] as unknown[] as ChatCampaign[]

        it('should display the status filter', () => {
            const {getByText} = render(
                <Provider store={store}>
                    <CampaignsList
                        currentUser={currentUser}
                        integration={integration}
                        campaigns={campaignsList}
                        onDeleteCampaign={jest.fn()}
                        onDuplicateCampaign={jest.fn()}
                        onUpdateCampaign={jest.fn()}
                    />
                </Provider>
            )

            getByText('All')
            getByText('Active')
            getByText('Inactive')
        })

        it('should not display the status filter if there are no campaigns', () => {
            const {getByText} = render(
                <Provider store={store}>
                    <CampaignsList
                        currentUser={currentUser}
                        integration={integration}
                        campaigns={[]}
                        onDeleteCampaign={jest.fn()}
                        onDuplicateCampaign={jest.fn()}
                        onUpdateCampaign={jest.fn()}
                    />
                </Provider>
            )

            expect(() => getByText('All')).toThrow()
            expect(() => getByText('Active')).toThrow()
            expect(() => getByText('Inactive')).toThrow()
        })

        it('should display all campaigns by default', () => {
            const {getByText} = render(
                <Provider store={store}>
                    <CampaignsList
                        currentUser={currentUser}
                        integration={integration}
                        campaigns={campaignsForFilters}
                        onDeleteCampaign={jest.fn()}
                        onDuplicateCampaign={jest.fn()}
                        onUpdateCampaign={jest.fn()}
                    />
                </Provider>
            )

            getByText('Super campaign')
            getByText('Not so good campaign')
        })

        it('should display only active campaigns', () => {
            ;(useCampaignListOptions as jest.Mock).mockImplementation(() => {
                return {
                    getParams: () => ({
                        state: 'active',
                    }),
                }
            })

            const {getByText} = render(
                <Provider store={store}>
                    <CampaignsList
                        currentUser={currentUser}
                        integration={integration}
                        campaigns={campaignsForFilters}
                        onDeleteCampaign={jest.fn()}
                        onDuplicateCampaign={jest.fn()}
                        onUpdateCampaign={jest.fn()}
                    />
                </Provider>
            )

            getByText('Super campaign')
            expect(() => getByText('Not so good campaign')).toThrow()
        })

        it('should display only inactive campaigns', () => {
            ;(useCampaignListOptions as jest.Mock).mockImplementation(() => {
                return {
                    getParams: () => ({
                        state: 'inactive',
                    }),
                }
            })

            const {getByText} = render(
                <Provider store={store}>
                    <CampaignsList
                        currentUser={currentUser}
                        integration={integration}
                        campaigns={campaignsForFilters}
                        onDeleteCampaign={jest.fn()}
                        onDuplicateCampaign={jest.fn()}
                        onUpdateCampaign={jest.fn()}
                    />
                </Provider>
            )

            expect(() => getByText('Super campaign')).toThrow()
            getByText('Not so good campaign')
        })
    })
})
