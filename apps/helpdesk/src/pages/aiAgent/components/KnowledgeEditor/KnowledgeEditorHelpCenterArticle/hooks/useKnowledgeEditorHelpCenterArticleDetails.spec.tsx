import { renderHook } from '@testing-library/react'

import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'

import { useKnowledgeEditorHelpCenterArticleDetails } from './useKnowledgeEditorHelpCenterArticleDetails'

describe('useKnowledgeEditorHelpCenterArticleDetails', () => {
    it('returns article details', () => {
        const { result } = renderHook(() =>
            useKnowledgeEditorHelpCenterArticleDetails({
                article: {
                    visibilityStatus: 'PUBLIC',
                    createdDatetime: '2024-01-01T00:00:00Z',
                    lastUpdatedDatetime: '2024-01-01T00:00:00Z',
                    slug: 'test-slug',
                    articleId: 1,
                    unlistedId: 'test-unlisted-id',
                },
                locale: 'en-US',
                helpCenter: getHelpCentersResponseFixture.data[0],
            }),
        )

        expect(result.current).toEqual({
            isPublished: true,
            createdDatetime: new Date('2024-01-01T00:00:00Z'),
            lastUpdatedDatetime: new Date('2024-01-01T00:00:00Z'),
            articleUrl: 'http://acme.gorgias.docker:4000/en-US/test-slug-1',
        })
    })

    it('renders article details without URL when slug is not available', () => {
        const { result } = renderHook(() =>
            useKnowledgeEditorHelpCenterArticleDetails({
                article: {
                    visibilityStatus: 'PUBLIC',
                    createdDatetime: '2024-01-01T00:00:00Z',
                    lastUpdatedDatetime: '2024-01-01T00:00:00Z',
                    articleId: 1,
                    unlistedId: 'test-unlisted-id',
                },
                locale: 'en-US',
                helpCenter: getHelpCentersResponseFixture.data[0],
            }),
        )

        expect(result.current).toEqual({
            isPublished: true,
            createdDatetime: new Date('2024-01-01T00:00:00Z'),
            lastUpdatedDatetime: new Date('2024-01-01T00:00:00Z'),
            articleUrl: undefined,
        })
    })

    it('returns article details when article data is empty', () => {
        const { result } = renderHook(() =>
            useKnowledgeEditorHelpCenterArticleDetails({
                locale: 'en-US',
                helpCenter: getHelpCentersResponseFixture.data[0],
            }),
        )

        expect(result.current).toEqual({
            isPublished: undefined,
            createdDatetime: undefined,
            lastUpdatedDatetime: undefined,
            articleUrl: undefined,
        })
    })
})
