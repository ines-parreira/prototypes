import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { teams } from 'fixtures/teams'
import type { RootState, StoreDispatch } from 'state/types'

import {
    deleteTeamSuccess,
    fetchTeamMembersSuccess,
    fetchTeamSuccess,
    updateTeamSuccess,
} from '../actions'

describe('teams actions', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    it('fetchTeamMembersSuccess should return an action to fetch team members', () => {
        const store = mockStore({})
        const team = { id: teams[0].id, members: teams[0].members }

        store.dispatch(fetchTeamMembersSuccess(team))
        expect(store.getActions()).toMatchSnapshot()
    })

    it('deleteTeamSuccess should return an action to delete a team', () => {
        const store = mockStore({})
        store.dispatch(deleteTeamSuccess(1))
        expect(store.getActions()).toMatchSnapshot()
    })

    it('fetchTeamSuccess should return an action to fetch a team', () => {
        const store = mockStore({})
        store.dispatch(fetchTeamSuccess(teams[0]))
        expect(store.getActions()).toMatchSnapshot()
    })

    it('updateTeamSuccess should return an action to update a team', () => {
        const store = mockStore({})
        store.dispatch(updateTeamSuccess(teams[0]))
        expect(store.getActions()).toMatchSnapshot()
    })
})
