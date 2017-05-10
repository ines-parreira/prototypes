import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'

import {TicketView} from '../TicketView'

describe('TicketView component', () => {
    const ticket = fromJS({
        subject: '',
        status: 'new',
        tags: [],
        priority: '',
        assignee_user: {
            name: ''
        },
        messages: [],
        state: {
            loading: false
        }
    })
    const actions = {
        ticket: {
            setSubject: () => {},
            setStatus: () => {},
            addTags: () => {},
            removeTag: () => {},
            togglePriority: () => {},
            setAgent: () => {}
        },
        macro: {
            previewMacro: () => {},
            previewMacroInModal: () => {},
            openModal: () => {}
        }
    }
    const tags = fromJS({
        items: []
    })
    const users = fromJS({
        agents: []
    })
    const agents = fromJS([])

    describe('visible', () => {
        let component

        beforeAll(() => {
            component = shallow(
                <TicketView
                    actions={actions}
                    ticket={ticket}
                    macros={{}}
                    currentUser={{}}
                    tags={tags}
                    users={users}
                    settings={{}}
                    submit={() => {}}
                    applyMacro={() => {}}
                    computeNextUrl={() => {}}
                    view={{}}
                    agents={agents}
                    hideTicket={_noop}
                    usersIsLoading={_noop}
                    isTicketHidden={false}
                />
            )
        })

        it('should not have the hidden classes', () => {
            expect(component).not.toHaveClassName('transition')
        })
    })

    describe('hidden', () => {
        let component

        beforeAll(() => {
            component = shallow(
                <TicketView
                    actions={actions}
                    ticket={ticket}
                    macros={{}}
                    currentUser={{}}
                    tags={tags}
                    users={users}
                    settings={{}}
                    submit={() => {}}
                    applyMacro={() => {}}
                    computeNextUrl={() => {}}
                    view={{}}
                    agents={agents}
                    hideTicket={_noop}
                    usersIsLoading={_noop}
                    isTicketHidden
                />
            )
        })

        it('should have the hidden classes', () => {
            expect(component).toHaveClassName('transition out fade right')
        })
    })
})
