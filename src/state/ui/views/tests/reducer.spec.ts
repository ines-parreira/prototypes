import {activeViewIdSet} from '../actions'
import reducer from '../reducer'

describe('views reducer', () => {
    describe('activeViewIdSet action', () => {
        it.each([1, null])('should set the active view', (value) => {
            const newState = reducer(
                {
                    activeViewId: 2,
                },
                activeViewIdSet(value)
            )
            expect(newState).toMatchSnapshot()
        })
    })
})
