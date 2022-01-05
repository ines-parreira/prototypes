import {fromJS} from 'immutable'

import {user} from '../../../../fixtures/users'
import {ViewType} from '../../../../models/view/types'
import {RootState} from '../../../types'
import {getOrderedViewsByType, getTicketViews} from '../selectors'

describe('selectors', () => {
    const state: RootState = {
        entities: {
            views: {
                '1': {
                    id: 1,
                    type: ViewType.TicketList,
                },
                '2': {
                    id: 2,
                    type: ViewType.TicketList,
                },
                '10': {
                    id: 10,
                    type: ViewType.TicketList,
                },
                '4': {
                    id: 4,
                    type: ViewType.TicketList,
                },
                '5': {
                    id: 5,
                    type: ViewType.CustomerList,
                },
                '123': {
                    id: 123,
                    type: ViewType.TicketList,
                },
            },
        },
        currentUser: fromJS(user),
    } as any

    describe('getTicketViews', () => {
        it('should return all ticket views', () => {
            expect(getTicketViews(state)).toMatchSnapshot()
        })
    })

    describe('getOrderedViewsByType', () => {
        it('should return the ordered list of views', () => {
            expect(
                getOrderedViewsByType(ViewType.TicketList)(state)
            ).toMatchSnapshot()
        })
    })
})
