import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import {RootState} from '../../types'
import * as selectors from '../selectors'

jest.addMatchers(immutableMatchers)

describe('auths selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            auths: fromJS([
                {data: {token: '1'}, type: 'api_key'},
                {data: {token: '2'}, type: 'api_key'},
            ]),
        } as RootState
    })

    it('should select the first auth of type api_key', () => {
        expect(selectors.getApiKey(state)).toEqualImmutable('1')
        expect(
            selectors.getApiKey({auths: fromJS([])} as RootState)
        ).toEqualImmutable('')
        expect(
            selectors.getApiKey({
                auths: fromJS([
                    {
                        type: 'not_api_key',
                        data: {
                            token: 1,
                        },
                    },
                ]),
            } as RootState)
        ).toEqualImmutable('')
    })
})
