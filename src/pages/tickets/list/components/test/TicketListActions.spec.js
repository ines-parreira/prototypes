import React from 'react'
import {fromJS} from 'immutable'
import TicketListActions from '../TicketListActions'
import {shallow} from 'enzyme'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('TicketListActions component', () => {
    const currentUserStore = fromJS({
        id: 1,
        name: 'Monsieur Agent'
    })

    const viewsStore = fromJS({
        active: {
            id: 12,
            category: 'user',
            name: 'not trash'
        }
    })

    const agentsStore = fromJS({
        all: []
    })

    let store

    beforeEach(() => {
        store = mockStore({
            currentUser: currentUserStore,
            views: viewsStore,
            agents: agentsStore
        })
    })

    it('should display when nothing is selected', () => {
        const component = shallow(
            <TicketListActions
                store={store}
                selectedItemsIds={fromJS([])}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display when some tickets are selected', () => {
        const component = shallow(
            <TicketListActions
                store={store}
                selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display options for agents assignations', () => {
        store = mockStore({
            currentUser: currentUserStore,
            views: viewsStore,
            agents: fromJS({
                all: [
                    {id: 4, name: 'foo'},
                    {id: 5, name: 'bar'},
                    {id: 6, name: 'baz'},
                ]
            }),
        })

        const component = shallow(
            <TicketListActions
                store={store}
                selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display special actions for trash view', () => {
        store = mockStore({
            currentUser: currentUserStore,
            views: fromJS({
                active: {
                    category: 'system',
                    name: 'Trash'
                }
            }),
            agents: agentsStore,
        })

        const component = shallow(
            <TicketListActions
                store={store}
                selectedItemsIds={fromJS([])}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })
})
