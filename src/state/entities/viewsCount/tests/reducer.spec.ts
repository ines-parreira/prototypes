import {viewsCountFetched} from '../actions'
import reducer from '../reducer'

describe('viewsCount reducer', () => {
    describe('viewsCountFetched action', () => {
        it('should add the views count to the state', () => {
            const newState = reducer(
                {
                    '1': 10,
                    '2': 30,
                },
                viewsCountFetched({
                    '1': 20,
                    '3': 40,
                })
            )
            expect(newState).toMatchSnapshot()
        })
    })
})
