import React from 'react'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'
import expectImmutable from 'expect-immutable'
import {fromJS} from 'immutable'

import TicketView from '../TicketView'

expect.extend(expectImmutable)

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

    describe('visibile', () => {
        let component

        before('render element', () => {
            const renderer = TestUtils.createRenderer()

            renderer.render(
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
                />
            )

            component = renderer.getRenderOutput()
        })

        it('should contain ticket-header', () => {
            expect(component.props.children[0].props.className).toContain('ticket-header')
        })

        it('should contain ticket-content', () => {
            expect(component.props.children[1].props.className).toContain('ticket-content')
        })

        it('should not have the hidden classes', () => {
            expect(component.props.className).toNotContain('transition')
        })
    })

    describe('hidden', () => {
        let component

        before('render element', () => {
            const renderer = TestUtils.createRenderer()

            renderer.render(
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
                    hidden
                />
            )

            component = renderer.getRenderOutput()
        })

        it('should have the hidden classes', () => {
            expect(component.props.className).toContain('transition out fade right')
        })
    })
})
