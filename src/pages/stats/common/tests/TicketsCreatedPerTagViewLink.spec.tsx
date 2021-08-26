import React from 'react'
import {fromJS} from 'immutable'
import {LinkProps} from 'react-router-dom'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import _keyBy from 'lodash/keyBy'

import {RootState, StoreDispatch} from '../../../../state/types'
import {TicketChannels} from '../../../../business/ticket'
import {integrationsState} from '../../../../fixtures/integrations'
import {logEvent} from '../../../../store/middlewares/segmentTracker.js'
import TicketsCreatedPerTagViewLink from '../TicketsCreatedPerTagViewLink'
import {tags} from '../../../../fixtures/tag'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('../../../../store/middlewares/segmentTracker')
jest.mock('../ViewLink', () => (props: LinkProps) => (
    <div>
        ViewLink Mock
        {JSON.stringify(props, null, 2)}
    </div>
))

const logEventMock = logEvent as jest.Mock

describe('TicketsCreatedPerTagViewLink', () => {
    const defaultState: Partial<RootState> = {
        stats: fromJS({
            filters: {
                period: {
                    start_datetime: '2021-05-29T00:00:00+02:00',
                    end_datetime: '2021-06-04T23:59:59+02:00',
                },
                channels: [TicketChannels.EMAIL],
                integrations: [1],
                tags: [1],
            },
        }),
        integrations: fromJS(integrationsState),
        entities: {
            tags: _keyBy(tags, 'id'),
        } as RootState['entities'],
    }

    it('should render a tag link', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketsCreatedPerTagViewLink tagName="fooTag">
                    click me!
                </TicketsCreatedPerTagViewLink>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the "untagged" link', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketsCreatedPerTagViewLink
                    tagName="fooTag"
                    untaggedName="fooTag"
                >
                    click me!
                </TicketsCreatedPerTagViewLink>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should log the event on click', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketsCreatedPerTagViewLink tagName="fooTag">
                    click me!
                </TicketsCreatedPerTagViewLink>
            </Provider>
        )

        fireEvent.click(container.firstChild!)

        expect(logEventMock.mock.calls).toMatchSnapshot()
    })
})
