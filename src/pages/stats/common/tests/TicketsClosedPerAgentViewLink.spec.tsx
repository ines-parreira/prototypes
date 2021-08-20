import React from 'react'
import {fromJS} from 'immutable'
import {LinkProps} from 'react-router-dom'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from '../../../../state/types'
import {TicketChannels} from '../../../../business/ticket'
import {integrationsState} from '../../../../fixtures/integrations'
import TicketsClosedPerAgentViewLink from '../TicketsClosedPerAgentViewLink'
import {logEvent} from '../../../../store/middlewares/segmentTracker.js'
import {agents as agentsFixtures} from '../../../../fixtures/agents'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('../../../../store/middlewares/segmentTracker')
jest.mock('../ViewLink', () => (props: LinkProps) => (
    <div>
        ViewLink Mock
        {JSON.stringify(props, null, 2)}
    </div>
))

const logEventMock = logEvent as jest.Mock

describe('TicketsClosedPerAgentViewLink', () => {
    const defaultState: Partial<RootState> = {
        stats: fromJS({
            filters: {
                period: {
                    start_datetime: '2021-05-29T00:00:00+02:00',
                    end_datetime: '2021-06-04T23:59:59+02:00',
                },
                channels: [TicketChannels.EMAIL],
                integrations: [1],
            },
        }),
        agents: fromJS({all: agentsFixtures}),
        integrations: fromJS(integrationsState),
    }

    it('should render an assignee link', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketsClosedPerAgentViewLink
                    agentName={agentsFixtures[0].name}
                >
                    click me!
                </TicketsClosedPerAgentViewLink>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the unassigned user link', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketsClosedPerAgentViewLink
                    agentName="John Doe"
                    unassignedName="John Doe"
                >
                    click me!
                </TicketsClosedPerAgentViewLink>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render a link for an unknown agent', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketsClosedPerAgentViewLink agentName="Unknown Agent">
                    click me!
                </TicketsClosedPerAgentViewLink>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should log the event on click', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketsClosedPerAgentViewLink
                    agentName={agentsFixtures[0].name}
                >
                    click me!
                </TicketsClosedPerAgentViewLink>
            </Provider>
        )

        fireEvent.click(container.firstChild!)

        expect(logEventMock.mock.calls).toMatchSnapshot()
    })
})
