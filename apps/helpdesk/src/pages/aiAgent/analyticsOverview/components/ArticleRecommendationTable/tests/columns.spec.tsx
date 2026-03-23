import { ARTICLE_RECOMMENDATION_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/ArticleRecommendationTable/columns'

describe('ARTICLE_RECOMMENDATION_COLUMNS', () => {
    it('has 3 entries', () => {
        expect(ARTICLE_RECOMMENDATION_COLUMNS).toHaveLength(3)
    })

    it('has the correct accessorKeys in order', () => {
        expect(
            ARTICLE_RECOMMENDATION_COLUMNS.map((col) => col.accessorKey),
        ).toEqual([
            'automationRate',
            'automatedInteractions',
            'handoverInteractions',
        ])
    })
})
