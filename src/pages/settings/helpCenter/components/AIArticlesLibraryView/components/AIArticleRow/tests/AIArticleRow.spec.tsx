import React from 'react'

import { render, screen } from '@testing-library/react'

import { AILibraryArticleItem } from 'models/helpCenter/types'
import { AIArticlesListFixture } from 'pages/settings/helpCenter/fixtures/aiArticles.fixture'
import { userEvent } from 'utils/testing/userEvent'

import AIArticleRow, { AIArticleRowProps } from '../AIArticleRow'

describe('AIArticleRow', () => {
    const article: AILibraryArticleItem = {
        ...AIArticlesListFixture[0],
        isNew: false,
    }

    const defaultProps: AIArticleRowProps = {
        article,
        isSelected: false,
        showNewTag: false,
        onSelect: jest.fn(),
    }

    it('renders without errors', () => {
        render(<AIArticleRow {...defaultProps} />)
        expect(screen.getByText(article.title)).toBeInTheDocument()
    })

    it('calls onSelect when clicked', () => {
        const onSelect = jest.fn()
        const props: AIArticleRowProps = {
            ...defaultProps,
            onSelect,
        }
        const { getByTestId } = render(<AIArticleRow {...props} />)
        const articleRow = getByTestId('ai-article-row')
        userEvent.click(articleRow)
        expect(onSelect).toHaveBeenCalledWith(article)
    })
})
