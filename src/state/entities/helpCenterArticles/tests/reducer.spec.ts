import {
    helpCenterArticleFetched,
    helpCenterArticleCreated,
    helpCenterArticleDeleted,
    helpCenterArticleUpdated,
    helpCenterArticlesFetched,
} from '../actions'
import reducer from '../reducer'
import {getArticlesResponseFixture} from '../../../../pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'

describe('helpCenterArticles reducer', () => {
    describe('createHelpcenterArticle action', () => {
        it('should add a new helpcenterArticle to the state', () => {
            const newState = reducer(
                {},
                helpCenterArticleCreated(getArticlesResponseFixture.data[0])
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('deleteHelpcenterArticle action', () => {
        it('should delete a helpcenterArticle from the state', () => {
            const newState = reducer(
                {
                    '1': getArticlesResponseFixture.data[0],
                    '2': getArticlesResponseFixture.data[1],
                },
                helpCenterArticleDeleted(1)
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('fetchHelpcenterArticle action', () => {
        it('should add a new helpcenterArticle to the state', () => {
            const newState = reducer(
                {},
                helpCenterArticleFetched(getArticlesResponseFixture.data[0])
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('updateHelpcenterArticle action', () => {
        it('should replace an existing helpcenterArticle in the state', () => {
            const updatedHelpcenterMock = {
                ...getArticlesResponseFixture.data[0],
                name: 'bar',
            }
            const newState = reducer(
                {
                    '1': getArticlesResponseFixture.data[0],
                },
                helpCenterArticleUpdated(updatedHelpcenterMock)
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('fetchHelpcenterArticles action', () => {
        it('should add the helpcenterArticles to the state', () => {
            const newState = reducer(
                {},
                helpCenterArticlesFetched(getArticlesResponseFixture.data)
            )
            expect(newState).toMatchSnapshot()
        })
    })
})
