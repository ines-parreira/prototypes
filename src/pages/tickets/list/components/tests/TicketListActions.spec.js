import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {initialState as currentUser} from '../../../../../state/currentUser/reducers.ts'
import {TicketListActionsContainer} from '../TicketListActions/TicketListActions'
import {LITE_AGENT_ROLE, AGENT_ROLE} from '../../../../../config/user.ts'

describe('TicketListActions component', () => {
    const minProps = {
        agents: fromJS([]),
        currentUser,
        teams: fromJS([]),
        areFiltersValid: true,
    }

    it('should display when nothing is selected', () => {
        const component = shallow(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([])}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display when some tickets are selected', () => {
        const component = shallow(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display options for teams assignations', () => {
        const component = shallow(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
                teams={fromJS([
                    {id: 4, name: 'foo'},
                    {id: 5, name: 'bar'},
                    {id: 6, name: 'baz'},
                ])}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display options for agents assignations', () => {
        const component = shallow(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
                agents={fromJS([
                    {id: 4, name: 'foo'},
                    {id: 5, name: 'bar'},
                    {id: 6, name: 'baz'},
                ])}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display special actions for trash view', () => {
        const component = shallow(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([])}
                isActiveViewTrashView={true}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display the export tickets button for agents', () => {
        const component = shallow(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([])}
                currentUser={fromJS({
                    id: 1,
                    name: 'Peter Parker',
                    roles: [{id: 1, name: AGENT_ROLE}],
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should not display the export tickets button for lite agents', () => {
        const component = shallow(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([])}
                currentUser={fromJS({
                    id: 1,
                    name: 'Peter Parker',
                    roles: [{id: 2, name: LITE_AGENT_ROLE}],
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
