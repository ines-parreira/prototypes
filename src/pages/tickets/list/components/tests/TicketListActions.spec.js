import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import TicketListActions from '../TicketListActions'
import {LITE_AGENT_ROLE, AGENT_ROLE} from '../../../../../config/user'
import {SYSTEM_VIEW_CATEGORY} from '../../../../../constants/view'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('TicketListActions component', () => {
    const currentUserStore = fromJS({
        id: 1,
        name: 'Peter Parker',
    })

    const viewsStore = fromJS({
        active: {
            id: 12,
            category: 'user',
            name: 'not trash',
        },
    })

    const agentsStore = fromJS({
        all: [],
    })

    let store

    beforeEach(() => {
        store = mockStore({
            currentUser: currentUserStore,
            views: viewsStore,
            agents: agentsStore,
        })
    })

    it('should display when nothing is selected', () => {
        const component = shallow(
            <TicketListActions store={store} selectedItemsIds={fromJS([])} />
        )
            .dive()
            .dive()
            .dive()

        expect(component).toMatchSnapshot()
    })

    it('should display when some tickets are selected', () => {
        const component = shallow(
            <TicketListActions
                store={store}
                selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
            />
        )
            .dive()
            .dive()
            .dive()

        expect(component).toMatchSnapshot()
    })

    it('should display options for teams assignations', () => {
        store = mockStore({
            currentUser: currentUserStore,
            views: viewsStore,
            teams: fromJS({
                all: {
                    4: {id: 4, name: 'foo'},
                    5: {id: 5, name: 'bar'},
                    6: {id: 6, name: 'baz'},
                },
            }),
        })

        const component = shallow(
            <TicketListActions
                store={store}
                selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
            />
        )
            .dive()
            .dive()
            .dive()

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
                ],
            }),
        })

        const component = shallow(
            <TicketListActions
                store={store}
                selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
            />
        )
            .dive()
            .dive()
            .dive()

        expect(component).toMatchSnapshot()
    })

    it('should display special actions for trash view', () => {
        store = mockStore({
            currentUser: currentUserStore,
            views: fromJS({
                active: {
                    category: SYSTEM_VIEW_CATEGORY,
                    name: 'Trash',
                },
            }),
            agents: agentsStore,
        })

        const component = shallow(
            <TicketListActions store={store} selectedItemsIds={fromJS([])} />
        )
            .dive()
            .dive()
            .dive()

        expect(component).toMatchSnapshot()
    })

    it('should display the export tickets button for agents', () => {
        store = mockStore({
            currentUser: fromJS({
                id: 1,
                name: 'Peter Parker',
                roles: [{id: 1, name: AGENT_ROLE}],
            }),
            views: viewsStore,
            agents: agentsStore,
        })

        const component = shallow(
            <TicketListActions store={store} selectedItemsIds={fromJS([])} />
        )
            .dive()
            .dive()
            .dive()

        expect(component).toMatchSnapshot()
    })

    it('should not display the export tickets button for lite agents', () => {
        store = mockStore({
            currentUser: fromJS({
                id: 1,
                name: 'Peter Parker',
                roles: [{id: 2, name: LITE_AGENT_ROLE}],
            }),
            views: viewsStore,
            agents: agentsStore,
        })

        const component = shallow(
            <TicketListActions store={store} selectedItemsIds={fromJS([])} />
        )
            .dive()
            .dive()
            .dive()

        expect(component).toMatchSnapshot()
    })
})
