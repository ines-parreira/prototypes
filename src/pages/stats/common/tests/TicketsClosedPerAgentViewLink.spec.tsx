import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { LinkProps } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import { logEvent } from 'common/segment'
import { agents as agentsFixtures } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import { LegacyStatsFilters } from 'models/stat/types'
import TicketsClosedPerAgentViewLink from 'pages/stats/common/TicketsClosedPerAgentViewLink'
import StatsFiltersContext from 'pages/stats/StatsFiltersContext'
import { RootState, StoreDispatch } from 'state/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('common/segment')
jest.mock('pages/stats/common/ViewLink', () => (props: LinkProps) => (
    <div>
        ViewLink Mock
        {JSON.stringify(props, null, 2)}
    </div>
))

const logEventMock = logEvent as jest.Mock

describe('TicketsClosedPerAgentViewLink', () => {
    const defaultStatsFilters: LegacyStatsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00+02:00',
            end_datetime: '2021-06-04T23:59:59+02:00',
        },
        channels: [TicketChannel.Email],
        integrations: [1],
        agents: [1, 2],
    }
    const defaultState = {
        agents: fromJS({ all: agentsFixtures }),
        integrations: fromJS(integrationsState),
        entities: {
            tags: {},
        },
    } as RootState

    it('should render an assignee link', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <StatsFiltersContext.Provider value={defaultStatsFilters}>
                    <TicketsClosedPerAgentViewLink
                        agentName={agentsFixtures[0].name}
                    >
                        click me!
                    </TicketsClosedPerAgentViewLink>
                </StatsFiltersContext.Provider>
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the unassigned user link', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <StatsFiltersContext.Provider value={defaultStatsFilters}>
                    <TicketsClosedPerAgentViewLink
                        agentName="John Doe"
                        unassignedName="John Doe"
                    >
                        click me!
                    </TicketsClosedPerAgentViewLink>
                </StatsFiltersContext.Provider>
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render a link for an unknown agent', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <StatsFiltersContext.Provider value={defaultStatsFilters}>
                    <TicketsClosedPerAgentViewLink agentName="Unknown Agent">
                        click me!
                    </TicketsClosedPerAgentViewLink>
                </StatsFiltersContext.Provider>
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should log the event on click', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <StatsFiltersContext.Provider value={defaultStatsFilters}>
                    <TicketsClosedPerAgentViewLink
                        agentName={agentsFixtures[0].name}
                    >
                        click me!
                    </TicketsClosedPerAgentViewLink>
                </StatsFiltersContext.Provider>
            </Provider>,
        )

        fireEvent.click(container.firstChild!)

        expect(logEventMock.mock.calls).toMatchSnapshot()
    })
})
