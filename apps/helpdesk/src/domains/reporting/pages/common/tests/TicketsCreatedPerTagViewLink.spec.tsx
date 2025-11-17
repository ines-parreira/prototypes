import React from 'react'

import { logEvent } from '@repo/logging'
import { fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'
import _keyBy from 'lodash/keyBy'
import { Provider } from 'react-redux'
import type { LinkProps } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import type { LegacyStatsFilters } from 'domains/reporting/models/stat/types'
import TicketsCreatedPerTagViewLink from 'domains/reporting/pages/common/TicketsCreatedPerTagViewLink'
import StatsFiltersContext from 'domains/reporting/pages/StatsFiltersContext'
import { integrationsState } from 'fixtures/integrations'
import { tags } from 'fixtures/tag'
import type { RootState, StoreDispatch } from 'state/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('@repo/logging')
jest.mock(
    'domains/reporting/pages/common/ViewLink',
    () => (props: LinkProps) => (
        <div>
            ViewLink Mock
            {JSON.stringify(props, null, 2)}
        </div>
    ),
)

const logEventMock = logEvent as jest.Mock

describe('TicketsCreatedPerTagViewLink', () => {
    const defaultStatsFilters: LegacyStatsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00+02:00',
            end_datetime: '2021-06-04T23:59:59+02:00',
        },
        channels: [TicketChannel.Email],
        integrations: [1],
        tags: [],
    }
    const defaultState = {
        integrations: fromJS(integrationsState),
        entities: {
            tags: _keyBy(tags, 'id'),
        },
    } as RootState

    it('should render a tag link', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <StatsFiltersContext.Provider value={defaultStatsFilters}>
                    <TicketsCreatedPerTagViewLink tagName="fooTag">
                        click me!
                    </TicketsCreatedPerTagViewLink>
                </StatsFiltersContext.Provider>
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the "untagged" link', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <StatsFiltersContext.Provider value={defaultStatsFilters}>
                    <TicketsCreatedPerTagViewLink
                        tagName="fooTag"
                        untaggedName="fooTag"
                    >
                        click me!
                    </TicketsCreatedPerTagViewLink>
                </StatsFiltersContext.Provider>
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a tag link with tag stats filter values', () => {
        const { tags } = defaultState.entities
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <StatsFiltersContext.Provider
                    value={{
                        ...defaultStatsFilters,
                        tags: [tags['1'].id, tags['2'].id, tags['3'].id],
                    }}
                >
                    <TicketsCreatedPerTagViewLink tagName={tags['2'].name}>
                        click me!
                    </TicketsCreatedPerTagViewLink>
                </StatsFiltersContext.Provider>
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a tag link without tag stats filter value if it is the same value as the tag name', () => {
        const { tags } = defaultState.entities
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <StatsFiltersContext.Provider
                    value={{
                        ...defaultStatsFilters,
                        tags: [tags['2'].id],
                    }}
                >
                    <TicketsCreatedPerTagViewLink tagName={tags['2'].name}>
                        click me!
                    </TicketsCreatedPerTagViewLink>
                </StatsFiltersContext.Provider>
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should log the event on click', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <StatsFiltersContext.Provider value={defaultStatsFilters}>
                    <TicketsCreatedPerTagViewLink tagName="fooTag">
                        click me!
                    </TicketsCreatedPerTagViewLink>
                </StatsFiltersContext.Provider>
            </Provider>,
        )

        fireEvent.click(container.firstChild!)

        expect(logEventMock.mock.calls).toMatchSnapshot()
    })
})
