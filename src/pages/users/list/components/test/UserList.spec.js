import expect from 'expect'
import React from 'react'
import {fromJS, List} from 'immutable'
import TestUtils from 'react-addons-test-utils'
import UserList from '../UserList'
import {Loader} from '../../../../common/components/Loader'

describe('UserList component', () => {
    let component

    const users = fromJS([
        {id: 1},
        {id: 2},
        {id: 3},
        {id: 4},
        {id: 5}
    ])

    const sort = fromJS({
        field: 'name',
        direction: 'desc'
    })

    describe('with items', () => {
        before('render component', () => {
            const renderer = TestUtils.createRenderer()

            renderer.render(
                <UserList
                    items={users}
                    sort={sort}
                    updateUser={() => {
                    }}
                    deleteUser={() => {
                    }}
                    sortUsers={() => {
                    }}
                />
            )

            component = renderer.getRenderOutput()
        })

        it('should display all users', () => {
            const userList = component.props.children[1].props.children
            expect(userList.size).toBe(users.size)

            userList.forEach((userRow, index) => {
                expect(userRow.props.user.get('id')).toBe(users.getIn([index, 'id']))
            })
        })

        it('should display sort icons according to input sort object', () => {
            const nameSortIcon = component.props.children[0].props.children.props.children[1].props.children[1]

            const roleSortIcon = component.props.children[0].props.children.props.children[2].props.children[1]

            expect(nameSortIcon.props.className).toBe('caret down action icon')
            expect(roleSortIcon.props.className).toBe('sort action icon')
        })
    })

    describe('without items', () => {
        describe('loading', () => {
            before('render component', () => {
                const renderer = TestUtils.createRenderer()
                UserList.contextTypes = {}

                renderer.render(
                    <UserList
                        items={List()}
                        sort={sort}
                        isLoading
                        updateUser={() => {
                        }}
                        deleteUser={() => {
                        }}
                        sortUsers={() => {
                        }}
                    />
                )

                component = renderer.getRenderOutput()
            })

            it('should return a Loader component with "Loading..." as message', () => {
                expect(component).toEqual(<Loader message={<p>Loading...</p>} loading />)
            })
        })

        describe('not loading', () => {
            before('render component', () => {
                const renderer = TestUtils.createRenderer()
                UserList.contextTypes = {}

                renderer.render(
                    <UserList
                        items={List()}
                        sort={sort}
                        updateUser={() => {
                        }}
                        deleteUser={() => {
                        }}
                        sortUsers={() => {
                        }}
                    />
                )

                component = renderer.getRenderOutput()
            })

            it('should return a Loader component with "No users found." as message', () => {
                expect(component).toEqual(<Loader message={<p>No users found.</p>} loading={undefined} />)
            })
        })
    })
})
