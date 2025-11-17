import type { AIArticle } from 'models/helpCenter/types'

import { filteredSortedTopQuestionsFromFetchedArticles } from '../utils'

describe('filteredSortedTopQuestionsFromFetchedArticles', () => {
    it('returns an empty array if fetchedArticles is null', () => {
        const result = filteredSortedTopQuestionsFromFetchedArticles(null)
        expect(result).toEqual([])
    })

    it('returns top questions sorted by tickets count', () => {
        const fetchedArticles: Partial<AIArticle>[] = [
            {
                title: 'Question 1',
                related_tickets_count: 5,
                key: 'key1',
            },
            {
                title: 'Question 2',
                related_tickets_count: 10,
                key: 'key2',
            },
            {
                title: 'Question 3',
                related_tickets_count: 3,
                key: 'key3',
                review_action: 'publish',
            },
            {
                title: 'Question 4',
                related_tickets_count: 100,
                key: 'key4',
                review_action: 'dismissFromTopQuestions',
            },
            {
                title: 'Question 5',
                key: 'key5',
            },
        ]
        const expected = [
            {
                title: 'Question 2',
                ticketsCount: 10,
                templateKey: 'key2',
                reviewAction: undefined,
            },
            {
                title: 'Question 1',
                ticketsCount: 5,
                templateKey: 'key1',
                reviewAction: undefined,
            },
            {
                title: 'Question 5',
                ticketsCount: 0,
                templateKey: 'key5',
                reviewAction: undefined,
            },
        ]
        const result = filteredSortedTopQuestionsFromFetchedArticles(
            fetchedArticles as AIArticle[],
        )
        expect(result).toEqual(expected)
    })
})
