import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as actions from '../../teams/actions'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.addMatchers(immutableMatchers)

jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args) => args),
    }
})

describe('team actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore()
        mockServer = new MockAdapter(axios)
    })

    describe('fetchTeamsPagination()', () => {
        it('works', () => {
            const data = {data: 'test'}
            mockServer.onGet('/api/teams/').reply(200, data)

            return store.dispatch(actions.fetchTeamsPagination())
                .then((resp) => {
                    expect(resp).toEqualImmutable(fromJS(data))
                })
        })

        it('fails', () => {
            mockServer.onGet('/api/teams/').reply(500)

            return store.dispatch(actions.fetchTeamsPagination())
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('fetchTeamMembersPagination()', () => {
        const teamId = 1

        it('works', () => {
            const data = {data: 'test'}
            mockServer.onGet(`/api/teams/${teamId}/members/`).reply(200, data)

            return store.dispatch(actions.fetchTeamMembersPagination(teamId))
                .then((resp) => {
                    expect(resp).toEqualImmutable(fromJS(data))
                })
        })

        it('fails', () => {
            mockServer.onGet(`/api/teams/${teamId}/members/`).reply(500)

            return store.dispatch(actions.fetchTeamMembersPagination(teamId))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('addTeamMember()', () => {
        const teamId = 1
        const userId = 10

        it('works', () => {
            const data = {data: 'test'}
            mockServer.onPost(`/api/teams/${teamId}/members/`).reply(201, data)

            return store.dispatch(actions.addTeamMember(teamId, userId))
                .then((resp) => {
                    expect(resp).toEqualImmutable(fromJS(data))
                })
        })

        it('fails', () => {
            mockServer.onPost(`/api/teams/${teamId}/members/`).reply(500)

            return store.dispatch(actions.addTeamMember(teamId, userId))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('deleteTeamMember()', () => {
        const teamId = 1
        const userId = 10

        it('works', () => {
            mockServer.onDelete(`/api/teams/${teamId}/members/${userId}/`).reply(204)

            return store.dispatch(actions.deleteTeamMember(teamId, userId))
                .then((resp) => {
                    expect(resp).toEqual(null)
                })
        })

        it('fails', () => {
            mockServer.onDelete(`/api/teams/${teamId}/members/${userId}/`).reply(500)

            return store.dispatch(actions.deleteTeamMember(teamId, userId))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('deleteTeamMemberList()', () => {
        const teamId = 1
        const userIds = fromJS([10, 100, 1000])

        it('works', () => {
            mockServer.onDelete(`/api/teams/${teamId}/members/`).reply(204)

            return store.dispatch(actions.deleteTeamMemberList(teamId, userIds))
                .then((resp) => {
                    expect(resp).toEqual(null)
                })
        })

        it('fails', () => {
            mockServer.onDelete(`/api/teams/${teamId}/members/`).reply(500)

            return store.dispatch(actions.deleteTeamMemberList(teamId, userIds))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('fetchTeam()', () => {
        const teamId = 1

        it('works', () => {
            const data = {data: 'test'}
            mockServer.onGet(`/api/teams/${teamId}/`).reply(200, data)

            return store.dispatch(actions.fetchTeam(teamId))
                .then((resp) => {
                    expect(store.getActions()).toMatchSnapshot()
                    expect(resp).toEqualImmutable(fromJS(data))
                })
        })

        it('fails', () => {
            mockServer.onGet(`/api/teams/${teamId}/`).reply(500)

            return store.dispatch(actions.fetchTeam(teamId))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('updateTeam()', () => {
        const teamId = 1
        const team = fromJS({
            id: teamId,
            name: 'My Team'
        })

        it('works', () => {
            mockServer.onPut(`/api/teams/${teamId}/`).reply(202, team.toJS())

            return store.dispatch(actions.updateTeam(team))
                .then((resp) => {
                    expect(store.getActions()).toMatchSnapshot()
                    expect(resp).toEqualImmutable(team)
                })
        })

        it('fails', () => {
            mockServer.onPut(`/api/teams/${teamId}/`).reply(500)

            return store.dispatch(actions.updateTeam(team))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('createTeam()', () => {
        const team = fromJS({
            name: 'My Team'
        })
        const respTeam = team.set('id', 1)

        it('works', () => {
            mockServer.onPost('/api/teams/').reply(201, respTeam.toJS())

            return store.dispatch(actions.createTeam(team))
                .then((resp) => {
                    expect(store.getActions()).toMatchSnapshot()
                    expect(resp).toEqualImmutable(respTeam)
                })
        })

        it('fails', () => {
            mockServer.onPost('/api/teams/').reply(500)

            return store.dispatch(actions.createTeam(team))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('deleteTeam()', () => {
        const teamId = 1

        it('works', () => {
            mockServer.onDelete(`/api/teams/${teamId}/`).reply(204)

            return store.dispatch(actions.deleteTeam(teamId))
                .then((resp) => {
                    expect(store.getActions()).toMatchSnapshot()
                    expect(resp).toEqual(null)
                })
        })

        it('fails', () => {
            mockServer.onDelete(`/api/teams/${teamId}/`).reply(500)

            return store.dispatch(actions.deleteTeam(teamId))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

})
