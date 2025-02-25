import { initialState } from 'fixtures/initialState'

import toInitialStoreState from '../toInitialStoreState'

describe('toInitialStoreState', () => {
    it('should return the expected store state', () => {
        expect(toInitialStoreState(initialState)).toMatchSnapshot()
    })
})
