import React from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {LinkProps} from 'react-router-dom'
import {Provider} from 'react-redux'
import {fireEvent, render} from '@testing-library/react'

import {RootState, StoreDispatch} from '../../../../state/types'
import {integrationsState} from '../../../../fixtures/integrations'
import {logEvent} from '../../../../store/middlewares/segmentTracker'
import TicketsCreatedPerChannelViewLink from '../TicketsCreatedPerChannelViewLink'
import {TicketChannel} from '../../../../business/types/ticket'
import {reportError} from '../../../../utils/errors'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('../../../../utils/errors')
jest.mock('../../../../store/middlewares/segmentTracker')
jest.mock('../ViewLink', () => (props: LinkProps) => (
    <div>
        ViewLink Mock
        {JSON.stringify(props, null, 2)}
    </div>
))

const logEventMock = logEvent as jest.Mock

describe('TicketsCreatedPerChannelViewLink', () => {
    const defaultState: Partial<RootState> = {
        stats: fromJS({
            filters: {
                period: {
                    start_datetime: '2021-05-29T00:00:00+02:00',
                    end_datetime: '2021-06-04T23:59:59+02:00',
                },
                channels: [TicketChannel.Email],
                integrations: [1],
            },
        }),
        integrations: fromJS(integrationsState),
    }

    it('should render a link for a channel', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketsCreatedPerChannelViewLink channelName="Facebook Mention">
                    click me!
                </TicketsCreatedPerChannelViewLink>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should log the event on click', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketsCreatedPerChannelViewLink channelName="Facebook Mention">
                    click me!
                </TicketsCreatedPerChannelViewLink>
            </Provider>
        )

        fireEvent.click(container.firstChild!)

        expect(logEventMock.mock.calls).toMatchSnapshot()
    })

    it('should not render a link for an unknown channel', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketsCreatedPerChannelViewLink channelName="Foo Bar Baz">
                    click me!
                </TicketsCreatedPerChannelViewLink>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should report and error for an unknown channel', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketsCreatedPerChannelViewLink channelName="Foo Bar Baz">
                    click me!
                </TicketsCreatedPerChannelViewLink>
            </Provider>
        )
        expect(reportError).toHaveBeenLastCalledWith(
            new Error('Channel not found for the name: Foo Bar Baz')
        )
    })
})
