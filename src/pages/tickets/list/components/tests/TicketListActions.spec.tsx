import React, {ComponentProps} from 'react'
import {fromJS, Map, List} from 'immutable'
import {render} from '@testing-library/react'

import {initialState as currentUser} from '../../../../../state/currentUser/reducers'
import {TicketListActionsContainer} from '../TicketListActions'
import {LITE_AGENT_ROLE, AGENT_ROLE} from '../../../../../config/user'
import * as viewsActions from '../../../../../state/views/actions'
import * as ticketsActions from '../../../../../state/tickets/actions.js'

describe('TicketListActions component', () => {
    const minProps: ComponentProps<typeof TicketListActionsContainer> = {
        currentUser,
        areFiltersValid: true,
        isActiveViewTrashView: false,
        allViewItemsSelected: false,
        activeView: fromJS({}) as Map<any, any>,
        agents: fromJS([]) as List<any>,
        teams: fromJS([]) as List<any>,
        view: fromJS({}) as Map<any, any>,
        selectedItemsIds: fromJS([]) as List<any>,
        getViewCount: jest.fn(),
        openMacroModal: jest.fn(),
        fieldEnumSearchCancellable: jest.fn(),
        cancelFieldEnumSearchCancellable: jest.fn(),
        actions: {
            views: {} as typeof viewsActions,
            tickets: {} as typeof ticketsActions,
        },
    }

    it('should render disabled buttons when nothing is selected', () => {
        const {container} = render(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([])}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render enabled buttons when some tickets are selected', () => {
        const {container} = render(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render teams in assign team dropdown', () => {
        const {container} = render(
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

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render agents options in assign agent dropdown', () => {
        const {container} = render(
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

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render special actions for trash view', () => {
        const {container} = render(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([])}
                isActiveViewTrashView={true}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render export tickets button for agents', () => {
        const {container} = render(
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

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render export tickets button for lite agents', () => {
        const {container} = render(
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

        expect(container.firstChild).toMatchSnapshot()
    })
})
