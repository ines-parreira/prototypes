import { section } from '../../../../fixtures/section'
import {
    sectionCreated,
    sectionDeleted,
    sectionsFetched,
    sectionUpdated,
} from '../actions'
import reducer from '../reducer'

describe('sections reducer', () => {
    describe('sectionsFetched action', () => {
        it('should add the sections to the state', () => {
            const newState = reducer(
                {},
                sectionsFetched([section, { ...section, id: 2 }]),
            )
            expect(newState).toMatchSnapshot()
        })

        it('should handle when payload is undefined', () => {
            const newState = reducer({}, sectionsFetched(undefined))
            expect(newState).toEqual({})
        })

        it('should handle when payload is null', () => {
            const newState = reducer({}, sectionsFetched(null))
            expect(newState).toEqual({})
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
            const newState = reducer({ '1': section }, sectionDeleted(1))
            expect(newState).toMatchSnapshot()
        })
    })

    describe('sectionUpdated action', () => {
        it('should update a section of the state', () => {
            const newState = reducer(
                { '1': section },
                sectionUpdated({ ...section, name: 'foobar' }),
            )
            expect(newState).toMatchSnapshot()
        })
    })
})
