import * as immutableMatchers from 'jest-immutable-matchers'

import reducer, {initialState} from '../reducers'
import * as types from '../constants'

jest.addMatchers(immutableMatchers)

describe('auths reducers', () => {
    it('fetch auths pagination', () => {
        const resp = {
            data: [{
                data: {
                    token: 'onetoken'
                }
            }, {
                data: {
                    token: 'secondtoken'
                }
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
                    type: types.FETCH_USER_AUTHS_SUCCESS,
                    resp,
                }
            )
        ).toMatchSnapshot()
    })
})
