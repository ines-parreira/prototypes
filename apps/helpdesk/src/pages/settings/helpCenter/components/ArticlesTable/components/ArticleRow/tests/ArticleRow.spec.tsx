import React from 'react'

import { render, screen } from '@testing-library/react'
import { HTML5Backend } from 'react-dnd-html5-backend'

import type { Article } from 'models/helpCenter/types'
import { getArticlesResponseFixture } from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { DndProvider } from 'utils/wrappers/DndProvider'

import { ArticleRow } from '../ArticleRow'

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

jest.mock('pages/settings/helpCenter/hooks/useArticleRowActions', () => ({
    useArticleRowActions: () => [],
}))

const baseArticle = {
    ...getArticlesResponseFixture.data[0],
    position: 0,
} as Article

const noopHandler = () => {
    return null
}

const defaultProps = {
    position: 0,
    categoryId: 5,
    level: 0,
    isAncestorUnlisted: false,
    onMoveEntity: noopHandler,
    onDropEntity: noopHandler,
    onClickRow: noopHandler,
    onClickSettings: noopHandler,
}

const renderArticleRow = (
    article: Article,
    props?: Partial<typeof defaultProps>,
) =>
    render(
        <DndProvider backend={HTML5Backend}>
            <table>
                <tbody>
                    <ArticleRow
                        {...defaultProps}
                        {...props}
                        article={article}
                    />
                </tbody>
            </table>
        </DndProvider>,
    )

describe('<ArticleRow />', () => {
    it('should display visibility based on customer_visibility, not visibility_status', () => {
        const article: Article = {
            ...baseArticle,
            translation: {
                ...baseArticle.translation,
                visibility_status: 'PUBLIC',
                customer_visibility: 'UNLISTED',
                is_current: true,
            },
        }

        renderArticleRow(article)

        expect(screen.getByText('Unlisted')).toBeInTheDocument()
        expect(screen.getByText('visibility_off')).toBeInTheDocument()
        expect(screen.queryByText('Public')).not.toBeInTheDocument()
    })

    it('should display Public when customer_visibility is PUBLIC', () => {
        const article: Article = {
            ...baseArticle,
            translation: {
                ...baseArticle.translation,
                visibility_status: 'PUBLIC',
                customer_visibility: 'PUBLIC',
                is_current: true,
            },
        }

        renderArticleRow(article)

        expect(screen.getByText('Public')).toBeInTheDocument()
        expect(screen.getByText('visibility')).toBeInTheDocument()
        expect(screen.queryByText('Unlisted')).not.toBeInTheDocument()
    })

    it('should fallback to PUBLIC when customer_visibility is undefined', () => {
        const article: Article = {
            ...baseArticle,
            translation: {
                ...baseArticle.translation,
                visibility_status: 'UNLISTED',
                customer_visibility: undefined as unknown as
                    | 'PUBLIC'
                    | 'UNLISTED',
                is_current: true,
            },
        }

        renderArticleRow(article)

        expect(screen.getByText('Public')).toBeInTheDocument()
        expect(screen.getByText('visibility')).toBeInTheDocument()
    })
})
