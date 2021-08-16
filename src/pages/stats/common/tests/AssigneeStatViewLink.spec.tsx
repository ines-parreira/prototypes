import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {createMemoryHistory} from 'history'
import {LinkProps} from 'react-router-dom'

import {RootState, StoreDispatch} from '../../../../state/types'

import AssigneeStatViewLink from '../AssigneeStatViewLink'
import {renderWithRouter} from '../../../../utils/testing'
import {agents as agentsFixtures} from '../../../../fixtures/agents'
import {integrationsState} from '../../../../fixtures/integrations'
import {TicketChannels} from '../../../../business/ticket'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('../StatViewLink', () => (props: LinkProps) => (
    <div>
        Link Mock
        {JSON.stringify(props, null, 2)}
    </div>
))

describe('AssigneeStatViewLink', () => {
    const history = createMemoryHistory({initialEntries: ['/']})
    history.replace('/stats/support-performance-agents')

    const defaultState: Partial<RootState> = {
        stats: fromJS({
            filters: {
                period: {
                    start_datetime: '2021-05-29T00:00:00+02:00',
                    end_datetime: '2021-06-04T23:59:59+02:00',
                },
            },
        }),
        agents: fromJS({all: agentsFixtures}),
        integrations: fromJS(integrationsState),
    }

    const store = mockStore(defaultState)

    it.each<[string, string]>([
        [
            'not prepare a link if no agent exists under the passed name',
            'Marcus Miller',
        ],
        [
            'prepare a link when an agent exists under the passed name',
            'Acme Support',
        ],
        [
            'prepare a link when "Unassigned" is passed as agent name',
            'Unassigned',
        ],
    ])('should %s', (name, agentName) => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <AssigneeStatViewLink agentName={agentName}>
                    click here!
                </AssigneeStatViewLink>
            </Provider>,
            {
                path: '/stats/:view',
                history,
            }
        )
        expect(container).toMatchSnapshot()
    })

    it.each<[string, any]>([
        [
            'should prepare a link with period filters in UTC format',
            {
                ...defaultState,
                stats: fromJS({
                    filters: {
                        period: {
                            start_datetime: '2021-05-29T00:00:00+02:00',
                            end_datetime: '2021-06-04T23:59:59+02:00',
                        },
                    },
                }),
            },
        ],
        [
            'should prepare a link with channel filters when a single channel is selected',
            {
                ...defaultState,
                stats: fromJS({
                    filters: {
                        channels: [TicketChannels.EMAIL],
                        period: {
                            start_datetime: '2021-05-29T00:00:00+02:00',
                            end_datetime: '2021-06-04T23:59:59+02:00',
                        },
                    },
                }),
            },
        ],
        [
            'should prepare a link with channel filters when multiple channels are selected',
            {
                ...defaultState,
                stats: fromJS({
                    filters: {
                        channels: [TicketChannels.EMAIL, TicketChannels.CHAT],
                        period: {
                            start_datetime: '2021-05-29T00:00:00+02:00',
                            end_datetime: '2021-06-04T23:59:59+02:00',
                        },
                    },
                }),
            },
        ],
        [
            'should prepare a link with integration filters when a single integration is selected',
            {
                ...defaultState,
                stats: fromJS({
                    filters: {
                        integrations: [1],
                        period: {
                            start_datetime: '2021-05-29T00:00:00+02:00',
                            end_datetime: '2021-06-04T23:59:59+02:00',
                        },
                    },
                }),
            },
        ],
        [
            'should prepare a link with integration filters when multiple integrations are selected',
            {
                ...defaultState,
                stats: fromJS({
                    filters: {
                        integrations: [1, 5],
                        period: {
                            start_datetime: '2021-05-29T00:00:00+02:00',
                            end_datetime: '2021-06-04T23:59:59+02:00',
                        },
                    },
                }),
            },
        ],
    ])('should %s', (name, state) => {
        const agentName = 'Acme Support'
        const {container} = renderWithRouter(
            <Provider store={mockStore(state)}>
                <AssigneeStatViewLink agentName={agentName}>
                    click here!
                </AssigneeStatViewLink>
            </Provider>,
            {
                path: '/stats/:view',
                history,
            }
        )
        expect(container).toMatchSnapshot()
    })
})
