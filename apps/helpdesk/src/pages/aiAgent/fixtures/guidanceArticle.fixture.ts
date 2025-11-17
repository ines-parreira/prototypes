import type { GuidanceArticle } from '../types'

export const getGuidanceArticleFixture = (
    id: number,
    overrides: Partial<Omit<GuidanceArticle, 'id'>> = {},
): GuidanceArticle => ({
    id,
    title: `Title ${id}`,
    content: `Content ${id}`,
    locale: 'en-US' as const,
    visibility: 'PUBLIC',
    createdDatetime: '2024-04-18T12:21:00.531Z',
    lastUpdated: '2024-04-18T12:21:00.531Z',
    templateKey: null,
    ...overrides,
})
