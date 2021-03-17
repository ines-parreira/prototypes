import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import ViewSharingModalBody from '../ViewSharingModalBody'
import {ViewVisibility} from '../../../../../../constants/view'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('<ViewSharingModalBody/>', () => {
    const getState = () => ({
        agents: fromJS({
            all: [],
        }),
        teams: fromJS({
            all: {},
        }),
    })

    const store = mockStore(getState())
    let setVisibility: jest.MockedFunction<any>
    let onTeamClick: jest.MockedFunction<any>
    let onUserClick: jest.MockedFunction<any>
    let onRemoveTeam: jest.MockedFunction<any>
    let onRemoveUser: jest.MockedFunction<any>

    beforeEach(() => {
        setVisibility = jest.fn()
        onTeamClick = jest.fn()
        onUserClick = jest.fn()
        onRemoveTeam = jest.fn()
        onRemoveUser = jest.fn()
    })

    describe('render()', () => {
        it('should render as a spinner', () => {
            const component = shallow(
                <ViewSharingModalBody
                    visibility={ViewVisibility.PUBLIC}
                    isLoading
                    error={null}
                    initialTeams={fromJS([])}
                    initialUsers={fromJS([])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([])}
                    {...({store} as any)}
                    setVisibility={setVisibility}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                    onRemoveTeam={onRemoveTeam}
                    onRemoveUser={onRemoveUser}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should render an error', () => {
            const component = shallow(
                <ViewSharingModalBody
                    visibility={ViewVisibility.PUBLIC}
                    isLoading={false}
                    error={new Error('foo bar')}
                    initialTeams={fromJS([])}
                    initialUsers={fromJS([])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([])}
                    {...({store} as any)}
                    setVisibility={setVisibility}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                    onRemoveTeam={onRemoveTeam}
                    onRemoveUser={onRemoveUser}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should render public body', () => {
            const component = shallow(
                <ViewSharingModalBody
                    visibility={ViewVisibility.PUBLIC}
                    isLoading={false}
                    error={null}
                    initialTeams={fromJS([])}
                    initialUsers={fromJS([])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([])}
                    {...({store} as any)}
                    setVisibility={setVisibility}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                    onRemoveTeam={onRemoveTeam}
                    onRemoveUser={onRemoveUser}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should render shared body', () => {
            const component = shallow(
                <ViewSharingModalBody
                    visibility={ViewVisibility.SHARED}
                    isLoading={false}
                    error={null}
                    initialTeams={fromJS([])}
                    initialUsers={fromJS([])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([])}
                    {...({store} as any)}
                    setVisibility={setVisibility}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                    onRemoveTeam={onRemoveTeam}
                    onRemoveUser={onRemoveUser}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should render private body', () => {
            const component = shallow(
                <ViewSharingModalBody
                    visibility={ViewVisibility.PRIVATE}
                    isLoading={false}
                    error={null}
                    initialTeams={fromJS([])}
                    initialUsers={fromJS([])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([])}
                    {...({store} as any)}
                    setVisibility={setVisibility}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                    onRemoveTeam={onRemoveTeam}
                    onRemoveUser={onRemoveUser}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })
    })
})
