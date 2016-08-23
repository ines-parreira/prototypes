import expect from 'expect'
import React from 'react'
import {fromJS} from 'immutable'
import TestUtils from 'react-addons-test-utils'
import UserRow from '../UserRow'

describe('UserRow component', () => {
    let component

    const user = fromJS({
        id: 1,
        name: 'user',
        email: 'user@gorgias.io',
        roles: [
            { name: 'agent'},
            { name: 'admin'}
        ]
    })

    before('render component', () => {
        const renderer = TestUtils.createRenderer()

        renderer.render(
            <UserRow
                user={user}
                updateUser={() => {}}
                deleteUser={() => {}}
            />
        )

        component = renderer.getRenderOutput()
    })

    it('should display the user\'s name and email', () => {
        const userDetails = component.props.children[1].props.children[1].props.children
        expect(userDetails.props.children[0].props.children).toBe('user')
        expect(userDetails.props.children[1].props.children).toBe('user@gorgias.io')
    })

    it('should display the highest role of the user', () => {
        const userRole = component.props.children[1].props.children[2].props.children
        expect(userRole).toEqual(<div className="ui blue label">ADMIN</div>)
    })
})
