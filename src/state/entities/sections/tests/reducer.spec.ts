import {section} from '../../../../fixtures/section'
import {
    sectionCreated,
    sectionUpdated,
    sectionDeleted,
    sectionsFetched,
} from '../actions'
import reducer from '../reducer'

describe('sections reducer', () => {
    describe('sectionsFetched action', () => {
        it('should add the sections to the state', () => {
            const newState = reducer(
                {},
                sectionsFetched([section, {...section, id: 2}])
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('sectionCreated action', () => {
        it('should add a new section to the state', () => {
            const newState = reducer({}, sectionCreated(section))
            expect(newState).toMatchSnapshot()
        })
    })

    describe('sectionDeleted action', () => {
        it('should delete a section from the state', () => {
            const newState = reducer({'1': section}, sectionDeleted(1))
            expect(newState).toMatchSnapshot()
        })
    })

    describe('sectionUpdated action', () => {
        it('should update a section of the state', () => {
            const newState = reducer(
                {'1': section},
                sectionUpdated({...section, name: 'foobar'})
            )
            expect(newState).toMatchSnapshot()
        })
    })
})
