import * as immutableMatchers from 'jest-immutable-matchers'

import reducer, {initialState} from '../reducers'
import * as types from '../constants'

jest.addMatchers(immutableMatchers)

describe('agents reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {})).toEqualImmutable(initialState)
    })

    it('fetch agents pagination', () => {
        const resp = {
            data: [{
                name: 'Alex',
            }, {
                name: 'Romain',
            }],
            meta: {
                nb_pages: 2,
                page: 1,
            }
        }

        // success
        expect(
            reducer(
                initialState, {
                    type: types.FETCH_AGENTS_PAGINATION_SUCCESS,
                    resp,
                }
            )
        ).toMatchSnapshot()
    })
})
