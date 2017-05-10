import {fromJS} from 'immutable'

import * as selectors from '../selectors'

describe('selectors', () => {
    describe('users', () => {
        let state = {}

        beforeEach(() => {
            state = {
                users: fromJS({
                    _internal: {
                        loading: {
                            loader1: true,
                            loader2: false,
                        }
                    }
                })
            }
        })

        it('isLoading', () => {
            expect(
                selectors.isLoading('loader1')(state)
            ).toBe(true)

            expect(
                selectors.isLoading('loader2')(state)
            ).toBe(false)

            expect(
                selectors.isLoading('unknown')(state)
            ).toBe(false)
        })

        it('makeIsLoading', () => {
            const isLoading = selectors.makeIsLoading(state)

            expect(
                isLoading('loader1')
            ).toBe(true)

            expect(
                isLoading('loader2')
            ).toBe(false)

            expect(
                isLoading('unknown')
            ).toBe(false)
        })
    })
})
