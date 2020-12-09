import {view} from '../../../../fixtures/views'
import {viewsFetched, viewCreated, viewDeleted, viewUpdated} from '../actions'
import reducer from '../reducer'

describe('views reducer', () => {
    describe('viewsFetched action', () => {
        it('should add the views to the state', () => {
            const newState = reducer({}, viewsFetched([view, {...view, id: 8}]))
            expect(newState).toMatchSnapshot()
        })
    })

    describe('viewCreated action', () => {
        it('should add a new view to the state', () => {
            const newState = reducer({}, viewCreated(view))
            expect(newState).toMatchSnapshot()
        })
    })

    describe('viewDeleted action', () => {
        it('should delete a view from the state', () => {
            const newState = reducer({'7': view}, viewDeleted(7))
            expect(newState).toMatchSnapshot()
        })
    })

    describe('viewUpdated action', () => {
        it('should update a macro of the state', () => {
            const newState = reducer(
                {'7': view},
                viewUpdated({...view, name: 'foo'})
            )
            expect(newState).toMatchSnapshot()
        })
    })
})
