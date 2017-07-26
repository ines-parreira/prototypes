import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import {TicketBody} from '../TicketBody'

// jest.mock('../Event', () => 'icon')

describe('TicketBody', () => {
    it('should display messages', () => {
        const component = shallow(
            <TicketBody
                elements={fromJS([{
                    id: 1,
                    created_datetime: '2017-07-01T18:00:00'
                }])}
                lastReadMessage={fromJS({
                    id: 1
                })}
                loadingState={fromJS([])}
                ticket={fromJS({id: 1})}
                setStatus={() => {}}
                currentUser={fromJS({
                    timezone: 'UTC'
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display events with messages', () => {
        const component = shallow(
            <TicketBody
                elements={fromJS([{
                    id: 1,
                    created_datetime: '2017-07-01T18:00:00'
                }, {
                    isEvent: true,
                    created_datetime: '2017-07-01T19:00:00'
                }])}
                lastReadMessage={fromJS({
                    id: 1
                })}
                loadingState={fromJS([])}
                ticket={fromJS({id: 1})}
                setStatus={() => {}}
                currentUser={fromJS({
                    timezone: 'UTC'
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should pass `isLastReadMessage` only for the last read message', () => {
        const component = shallow(
            <TicketBody
                elements={fromJS([{
                    id: 1,
                    created_datetime: '2017-07-01T18:00:00'
                }, {
                    id: 2,
                    created_datetime: '2017-07-01T19:00:00'
                }, {
                    id: undefined,
                    created_datetime: '2017-07-01T20:00:00'
                }])}
                lastReadMessage={fromJS({
                    id: 1
                })}
                loadingState={fromJS([])}
                ticket={fromJS({id: 1})}
                setStatus={() => {}}
                currentUser={fromJS({
                    timezone: 'UTC'
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should not pass `isLastReadMessage` for a new message', () => {
        const component = shallow(
            <TicketBody
                elements={fromJS([{
                    id: undefined,
                    created_datetime: '2017-07-01T18:00:00'
                }])}
                lastReadMessage={fromJS({
                    id: undefined
                })}
                loadingState={fromJS([])}
                ticket={fromJS({id: 1})}
                setStatus={() => {}}
                currentUser={fromJS({
                    timezone: 'UTC'
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
