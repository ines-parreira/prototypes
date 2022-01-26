import React from 'react'
import {fromJS} from 'immutable'
import {LinkProps} from 'react-router-dom'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import _keyBy from 'lodash/keyBy'

import {RootState, StoreDispatch} from 'state/types'
import {integrationsState} from 'fixtures/integrations'
import {logEvent} from 'store/middlewares/segmentTracker'
import {tags} from 'fixtures/tag'
import {StatsFilters} from 'state/stats/types'
import {TicketChannel} from 'business/types/ticket'
import StatsFiltersContext from 'pages/stats/StatsFiltersContext'

import TicketsCreatedPerTagViewLink from '../TicketsCreatedPerTagViewLink'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('store/middlewares/segmentTracker')
jest.mock('../ViewLink', () => (props: LinkProps) => (
    <div>
        ViewLink Mock
        {JSON.stringify(props, null, 2)}
    </div>
))

const logEventMock = logEvent as jest.Mock

describe('TicketsCreatedPerTagViewLink', () => {
    const defaultStatsFilters: StatsFilters = {
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
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <StatsFiltersContext.Provider value={defaultStatsFilters}>
                    <TicketsCreatedPerTagViewLink tagName="fooTag">
                        click me!
                    </TicketsCreatedPerTagViewLink>
                </StatsFiltersContext.Provider>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the "untagged" link', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <StatsFiltersContext.Provider value={defaultStatsFilters}>
                    <TicketsCreatedPerTagViewLink
                        tagName="fooTag"
                        untaggedName="fooTag"
                    >
                        click me!
                    </TicketsCreatedPerTagViewLink>
                </StatsFiltersContext.Provider>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a tag link with tag stats filter values', () => {
        const {tags} = defaultState.entities
        const {container} = render(
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
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a tag link without tag stats filter value if it is the same value as the tag name', () => {
        const {tags} = defaultState.entities
        const {container} = render(
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
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should log the event on click', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <StatsFiltersContext.Provider value={defaultStatsFilters}>
                    <TicketsCreatedPerTagViewLink tagName="fooTag">
                        click me!
                    </TicketsCreatedPerTagViewLink>
                </StatsFiltersContext.Provider>
            </Provider>
        )

        fireEvent.click(container.firstChild!)

        expect(logEventMock.mock.calls).toMatchSnapshot()
    })
})
