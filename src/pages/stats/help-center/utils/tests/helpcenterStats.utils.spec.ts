import { getArticleUrl } from '../helpcenterStats.utils'

describe('helpcenterStats.utils', () => {
    describe('getArticleUrl', () => {
        it('should return article url', () => {
            expect(
                getArticleUrl({
                    slug: 'report-issue-12',
                    domain: 'acme',
                    locale: 'en-US',
                }),
            ).toBe('http://acme/en-US/report-issue-12')
        })
    })
})
