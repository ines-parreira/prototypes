import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as selectors from '../selectors'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('agents selectors', () => {
    let state

    beforeEach(() => {
        state = {
            agents: initialState
                .mergeDeep({
                    pagination: {
                        data: [{id: 1}, {id: 2}],
                        meta: {page: 1},
                    }
                })
        }
    })

    it('getState', () => {
        expect(selectors.getState(state)).toEqualImmutable(state.agents)
        expect(selectors.getState({})).toEqualImmutable(fromJS({}))
    })

    it('getPaginatedAgents', () => {
        expect(selectors.getPaginatedAgents(state)).toEqualImmutable(state.agents.getIn(['pagination', 'data']))
        expect(selectors.getPaginatedAgents({})).toEqualImmutable(fromJS([]))
    })

    it('getPagination', () => {
        expect(selectors.getPagination(state)).toEqualImmutable(state.agents.getIn(['pagination', 'meta']))
        expect(selectors.getPagination({})).toEqualImmutable(fromJS({}))
    })
})
