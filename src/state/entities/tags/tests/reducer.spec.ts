import {
    tagCreated,
    tagDeleted,
    tagFetched,
    tagUpdated,
    tagsFetched,
} from '../actions'
import reducer from '../reducer'

import {tags as tagsFixtures} from '../../../../fixtures/tag'

describe('tags reducer', () => {
    describe('createTag action', () => {
        it('should add a new tag to the state', () => {
            const newState = reducer({}, tagCreated(tagsFixtures[0]))
            expect(newState).toMatchSnapshot()
        })
    })

    describe('deleteTag action', () => {
        it('should delete a tag from the state', () => {
            const newState = reducer({'1': tagsFixtures[0]}, tagDeleted(1))
            expect(newState).toMatchSnapshot()
        })
    })

    describe('fetchTag action', () => {
        it('should add a new tag to the state', () => {
            const newState = reducer({}, tagFetched(tagsFixtures[0]))
            expect(newState).toMatchSnapshot()
        })
    })

    describe('updateTag action', () => {
        it('should replace an existing tag in the state', () => {
            const updatedTagMock = {
                ...tagsFixtures[0],
                name: 'bar',
            }
            const newState = reducer(
                {'1': tagsFixtures[0]},
                tagUpdated(updatedTagMock)
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('fetchTags action', () => {
        it('should add the tags to the state', () => {
            const newState = reducer({}, tagsFetched(tagsFixtures))
            expect(newState).toMatchSnapshot()
        })
    })
})
