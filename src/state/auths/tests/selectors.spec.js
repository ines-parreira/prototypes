import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as selectors from '../selectors.ts'

jest.addMatchers(immutableMatchers)

describe('auths selectors', () => {
    let state

    beforeEach(() => {
        state = {
            auths: fromJS([
                {data: {token: '1'}, type: 'api_key'},
                {data: {token: '2'}, type: 'api_key'},
            ]),
        }
    })

    it('should select the first auth of type api_key', () => {
        expect(selectors.getApiKey(state)).toEqualImmutable('1')
        expect(selectors.getApiKey({auths: fromJS([])})).toEqualImmutable('')
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
            })
        ).toEqualImmutable('')
    })
})
